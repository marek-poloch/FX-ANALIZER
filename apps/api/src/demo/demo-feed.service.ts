import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { InMemoryStore } from "../store/in-memory.store";
import { MockCmeAdapter } from "../adapters/mock-cme.adapter";
import type { MarketDataAdapter } from "../adapters/market-data.adapter";
import { MarketGateway } from "../ws/market.gateway";
import { AlertsGateway } from "../ws/alerts.gateway";
import { NewsGateway } from "../ws/news.gateway";
import { EwmaBaseline, RollingStats } from "../quant/stats";
import { computeFlowScore, severityFromScore } from "../quant/flow-score";
import type {
  Alert,
  AlertExplanation,
  DataMode,
  InstrumentSymbol,
  MarketTick,
  MacroEvent,
  NewsItem,
  SentimentSnapshot,
  CotReport,
} from "@fxradar/shared-types";

// CME FX futures → ISO base currency. Kept inline to avoid cross-workspace
// dependency; mirror of the mapping in apps/web/src/lib/ui.ts.
const SYMBOL_CURRENCY: Record<string, string> = {
  "6E": "EUR", "6B": "GBP", "6J": "JPY", "6A": "AUD",
  "6C": "CAD", "6S": "CHF", "6N": "NZD",
};
function formatSymbolForDisplay(symbol: string): string {
  const ccy = SYMBOL_CURRENCY[symbol];
  return ccy ? `${symbol} (${ccy})` : symbol;
}

interface SymbolState {
  volumeEwma: EwmaBaseline;
  volumeRoll: RollingStats;
  priceRoll: RollingStats;
  spreadRoll: RollingStats;
  lastAlertAt: number;
}

const ALERT_COOLDOWN_MS = 15_000;
const MIN_SCORE_TO_ALERT = 31;

@Injectable()
export class DemoFeedService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DemoFeedService.name);
  private adapter: MarketDataAdapter | null = null;
  private readonly state = new Map<InstrumentSymbol, SymbolState>();

  constructor(
    private readonly store: InMemoryStore,
    private readonly marketGw: MarketGateway,
    private readonly alertsGw: AlertsGateway,
    private readonly newsGw: NewsGateway,
  ) {}

  async onModuleInit() {
    const mode = (process.env.DATA_MODE ?? "demo") as DataMode;
    this.logger.log(`Starting demo feed (DATA_MODE=${mode})`);

    this.seedSentimentAndCot();
    this.seedMacroCalendar();
    this.scheduleDemoNews();

    this.adapter = new MockCmeAdapter({ tickIntervalMs: 500, shockProbability: 0.02 });
    for (const s of this.adapter.supportedSymbols) {
      this.state.set(s, {
        volumeEwma: new EwmaBaseline(0.1),
        volumeRoll: new RollingStats(100),
        priceRoll: new RollingStats(100),
        spreadRoll: new RollingStats(100),
        lastAlertAt: 0,
      });
    }

    await this.adapter.start((tick) => this.onTick(tick));
    this.store.setSourceHealth({
      source: "mock-cme",
      status: "MOCK",
      lastEventAt: new Date().toISOString(),
      latencyMs: 0,
      message: "Demo synthetic feed",
    });
  }

  async onModuleDestroy() {
    await this.adapter?.stop();
  }

  private onTick(tick: MarketTick): void {
    this.store.pushTick(tick);
    this.marketGw.broadcastTick(tick);

    const st = this.state.get(tick.symbol);
    if (!st) return;

    // --- update streaming stats ---
    const vol = tick.volume ?? 0;
    st.volumeEwma.update(vol);
    st.volumeRoll.push(vol);
    st.priceRoll.push(tick.price);

    const spread = (tick.ask ?? tick.price) - (tick.bid ?? tick.price);
    st.spreadRoll.push(spread);

    if (st.volumeRoll.size() < 30) return; // warmup

    const volumeZ = st.volumeRoll.zScore(vol);
    const spreadZ = st.spreadRoll.zScore(spread);
    const priceStd = st.priceRoll.stdev();
    const priceImpulseAtr = priceStd > 0 ? (tick.price - st.priceRoll.mean()) / priceStd : 0;

    const bidSize = tick.bidSize ?? 1;
    const askSize = tick.askSize ?? 1;
    const imbalance = Math.abs(bidSize - askSize) / (bidSize + askSize);

    const liquiditySweep = Math.abs(priceImpulseAtr) > 2.5 && spreadZ > 2;
    const crossPair = Math.abs(volumeZ) > 3; // simplified: real logic compares basket
    const macro = this.hasRecentMacroEvent(tick.symbol);
    const sentiment = false;
    const cot = false;

    const score = computeFlowScore(tick.symbol, {
      volumeZ,
      priceImpulseAtr,
      spreadZ,
      orderBookImbalance: imbalance,
      liquiditySweep,
      crossPairConfirmation: crossPair,
      macroConfirmation: macro,
      sentimentContradiction: sentiment,
      cotExtreme: cot,
    });

    this.store.pushFlowScore(score);
    this.marketGw.broadcastFlowScore(score);

    // --- maybe fire alert ---
    if (score.total >= MIN_SCORE_TO_ALERT) {
      const now = Date.now();
      if (now - st.lastAlertAt < ALERT_COOLDOWN_MS) return;
      st.lastAlertAt = now;

      const alert = this.buildAlert(tick, score.total, {
        volumeZ,
        spreadZ,
        priceImpulseAtr,
        imbalance,
        liquiditySweep,
        macro,
      });
      this.store.pushAlert(alert);
      this.alertsGw.broadcastAlert(alert);
    }
  }

  private buildAlert(
    tick: MarketTick,
    score: number,
    ctx: {
      volumeZ: number;
      spreadZ: number;
      priceImpulseAtr: number;
      imbalance: number;
      liquiditySweep: boolean;
      macro: boolean;
    },
  ): Alert {
    const severity = severityFromScore(score);
    const reasons: string[] = [];
    if (Math.abs(ctx.volumeZ) > 2) reasons.push(`volume z-score ${ctx.volumeZ.toFixed(2)}`);
    if (Math.abs(ctx.spreadZ) > 2) reasons.push(`spread z-score ${ctx.spreadZ.toFixed(2)}`);
    if (Math.abs(ctx.priceImpulseAtr) > 2) reasons.push(`price impulse ${ctx.priceImpulseAtr.toFixed(2)}σ`);
    if (ctx.imbalance > 0.25) reasons.push(`order book imbalance ${(ctx.imbalance * 100).toFixed(0)}%`);
    if (ctx.liquiditySweep) reasons.push("possible liquidity sweep");
    if (ctx.macro) reasons.push("macro window");

    const explanation: AlertExplanation = {
      primaryReason: reasons[0] ?? "composite anomaly",
      contributingFactors: reasons,
      dataUsed: ["mock-cme ticks", "streaming z-score", "EWMA baseline"],
      delayedDataSources: [],
      unknowns: [
        "no real CFTC COT in demo",
        "no spot OTC order flow (not publicly available)",
        "sentiment contradiction not evaluated in demo",
      ],
    };

    return {
      id: uuid(),
      symbol: tick.symbol,
      timestamp: tick.timestamp,
      severity,
      score,
      title: `${severity} flow on ${formatSymbolForDisplay(tick.symbol)} (${score.toFixed(0)}/100)`,
      description: reasons.join(", "),
      explanation,
      dataMode: (process.env.DATA_MODE as DataMode) ?? "demo",
    };
  }

  // --- Seed supporting demo data ------------------------------------------

  private seedSentimentAndCot() {
    const now = new Date().toISOString();
    const symbols: InstrumentSymbol[] = ["6E", "6B", "6J", "6A", "6C", "6S", "6N"];
    for (const symbol of symbols) {
      const longPct = 30 + Math.random() * 40;
      const snap: SentimentSnapshot = {
        symbol,
        timestamp: now,
        source: "MockIG",
        longPct,
        shortPct: 100 - longPct,
        representativeness: "broker_only",
        delayMinutes: 15,
      };
      this.store.setSentiment(symbol, snap);

      const cot: CotReport = {
        symbol,
        reportDate: new Date().toISOString().slice(0, 10),
        commercialsNet: (Math.random() - 0.5) * 200_000,
        nonCommercialsNet: (Math.random() - 0.5) * 200_000,
        weeklyChange: (Math.random() - 0.5) * 30_000,
        percentileRank3y: Math.random(),
        percentileRank5y: Math.random(),
      };
      this.store.setCot(cot);
    }
  }

  private seedMacroCalendar() {
    const now = Date.now();
    const events: MacroEvent[] = [
      {
        id: uuid(),
        timestamp: new Date(now + 2 * 3600_000).toISOString(),
        currency: "USD",
        name: "CPI y/y",
        impact: "high",
        forecast: "3.1%",
        previous: "3.2%",
        source: "mock",
      },
      {
        id: uuid(),
        timestamp: new Date(now + 6 * 3600_000).toISOString(),
        currency: "EUR",
        name: "ECB press conference",
        impact: "high",
        source: "mock",
      },
      {
        id: uuid(),
        timestamp: new Date(now + 20 * 3600_000).toISOString(),
        currency: "GBP",
        name: "Retail sales m/m",
        impact: "medium",
        forecast: "0.3%",
        previous: "0.1%",
        source: "mock",
      },
    ];
    this.store.setMacro(events);
  }

  private hasRecentMacroEvent(_symbol: InstrumentSymbol): boolean {
    const now = Date.now();
    return this.store.getMacro().some((e) => {
      const t = new Date(e.timestamp).getTime();
      return Math.abs(t - now) < 30 * 60_000;
    });
  }

  private scheduleDemoNews() {
    const headlines: Array<[string, string[], string[]]> = [
      ["ECB's Lagarde signals patience on rate cuts", ["EUR"], ["rates"]],
      ["US jobless claims drop to 3-month low", ["USD"], ["rates", "risk-on"]],
      ["Oil slides on OPEC+ output headlines", ["CAD"], ["risk-off"]],
      ["BoJ official hints at policy normalization", ["JPY"], ["intervention", "rates"]],
      ["SNB reiterates FX intervention readiness", ["CHF"], ["intervention"]],
    ];
    setInterval(() => {
      const [title, currencies, tags] = headlines[Math.floor(Math.random() * headlines.length)]!;
      const item: NewsItem = {
        id: uuid(),
        timestamp: new Date().toISOString(),
        title,
        source: "demo-feed",
        currencies,
        tags,
        impactScore: Math.random() * 0.6 + 0.2,
      };
      this.store.pushNews(item);
      this.newsGw.broadcastNews(item);
    }, 45_000);
  }
}
