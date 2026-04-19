import { Injectable } from "@nestjs/common";
import type {
  Alert,
  FlowScore,
  Instrument,
  InstrumentSymbol,
  MarketTick,
  Candle,
  MacroEvent,
  NewsItem,
  SentimentSnapshot,
  CotReport,
  DataSourceHealth,
} from "@fxradar/shared-types";

/**
 * In-memory demo store used when DATA_MODE=demo|mock.
 * Replaced by Postgres-backed implementation in live mode.
 */
@Injectable()
export class InMemoryStore {
  private readonly ticks = new Map<string, MarketTick[]>();
  private readonly candles = new Map<string, Candle[]>();
  private readonly alerts: Alert[] = [];
  private readonly flowScores: FlowScore[] = [];
  private readonly macro: MacroEvent[] = [];
  private readonly news: NewsItem[] = [];
  private readonly sentiment: SentimentSnapshot[] = [];
  private readonly cot: CotReport[] = [];
  private readonly sourceHealth = new Map<string, DataSourceHealth>();

  private readonly MAX_TICKS = 10_000;
  private readonly MAX_CANDLES = 2_000;
  private readonly MAX_ALERTS = 500;

  readonly instruments: Instrument[] = [
    { symbol: "6E", description: "Euro FX futures", proxyFor: "EURUSD", invertForSpot: false, exchange: "CME" },
    { symbol: "6B", description: "British Pound futures", proxyFor: "GBPUSD", invertForSpot: false, exchange: "CME" },
    { symbol: "6J", description: "Japanese Yen futures", proxyFor: "USDJPY", invertForSpot: true, exchange: "CME" },
    { symbol: "6A", description: "Australian Dollar futures", proxyFor: "AUDUSD", invertForSpot: false, exchange: "CME" },
    { symbol: "6C", description: "Canadian Dollar futures", proxyFor: "USDCAD", invertForSpot: true, exchange: "CME" },
    { symbol: "6S", description: "Swiss Franc futures", proxyFor: "USDCHF", invertForSpot: true, exchange: "CME" },
    { symbol: "6N", description: "New Zealand Dollar futures", proxyFor: "NZDUSD", invertForSpot: false, exchange: "CME" },
  ];

  // --- Ticks ---------------------------------------------------------------
  pushTick(tick: MarketTick) {
    const arr = this.ticks.get(tick.symbol) ?? [];
    arr.push(tick);
    if (arr.length > this.MAX_TICKS) arr.shift();
    this.ticks.set(tick.symbol, arr);
  }
  getLatestTick(symbol: InstrumentSymbol): MarketTick | undefined {
    const arr = this.ticks.get(symbol);
    return arr?.[arr.length - 1];
  }
  getTicks(symbol: InstrumentSymbol, limit = 500): MarketTick[] {
    const arr = this.ticks.get(symbol) ?? [];
    return arr.slice(-limit);
  }

  // --- Candles -------------------------------------------------------------
  pushCandle(candle: Candle) {
    const key = `${candle.symbol}:${candle.interval}`;
    const arr = this.candles.get(key) ?? [];
    arr.push(candle);
    if (arr.length > this.MAX_CANDLES) arr.shift();
    this.candles.set(key, arr);
  }
  getCandles(symbol: InstrumentSymbol, interval: string, limit = 200): Candle[] {
    const arr = this.candles.get(`${symbol}:${interval}`) ?? [];
    return arr.slice(-limit);
  }

  // --- Alerts --------------------------------------------------------------
  pushAlert(alert: Alert) {
    this.alerts.unshift(alert);
    if (this.alerts.length > this.MAX_ALERTS) this.alerts.pop();
  }
  getAlerts(limit = 100): Alert[] {
    return this.alerts.slice(0, limit);
  }
  getAlert(id: string): Alert | undefined {
    return this.alerts.find((a) => a.id === id);
  }

  // --- Flow scores ---------------------------------------------------------
  pushFlowScore(score: FlowScore) {
    this.flowScores.unshift(score);
    if (this.flowScores.length > 1000) this.flowScores.pop();
  }
  getLatestFlowScore(symbol: InstrumentSymbol): FlowScore | undefined {
    return this.flowScores.find((s) => s.symbol === symbol);
  }

  // --- Other ---------------------------------------------------------------
  setMacro(events: MacroEvent[]) { this.macro.splice(0, this.macro.length, ...events); }
  getMacro(): MacroEvent[] { return [...this.macro]; }

  pushNews(item: NewsItem) {
    this.news.unshift(item);
    if (this.news.length > 500) this.news.pop();
  }
  getNews(limit = 100): NewsItem[] { return this.news.slice(0, limit); }

  setSentiment(symbol: InstrumentSymbol, snapshot: SentimentSnapshot) {
    const idx = this.sentiment.findIndex((s) => s.symbol === symbol && s.source === snapshot.source);
    if (idx >= 0) this.sentiment[idx] = snapshot;
    else this.sentiment.push(snapshot);
  }
  getSentiment(symbol: InstrumentSymbol): SentimentSnapshot[] {
    return this.sentiment.filter((s) => s.symbol === symbol);
  }

  setCot(report: CotReport) {
    const idx = this.cot.findIndex((c) => c.symbol === report.symbol && c.reportDate === report.reportDate);
    if (idx >= 0) this.cot[idx] = report;
    else this.cot.push(report);
  }
  getCot(symbol: InstrumentSymbol): CotReport[] {
    return this.cot.filter((c) => c.symbol === symbol);
  }

  setSourceHealth(h: DataSourceHealth) { this.sourceHealth.set(h.source, h); }
  getSourceHealth(): DataSourceHealth[] { return [...this.sourceHealth.values()]; }
}
