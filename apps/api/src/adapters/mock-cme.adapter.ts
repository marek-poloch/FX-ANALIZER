import type { MarketDataAdapter } from "./market-data.adapter";
import type { MarketTick, InstrumentSymbol } from "@fxradar/shared-types";

interface Config {
  tickIntervalMs: number;
  shockProbability: number; // per tick chance of injecting volume spike
}

/**
 * Deterministic-ish mock producing realistic CME FX futures ticks + periodic
 * volume shocks, spread widening and momentum bursts so the demo UI has
 * something to react to.
 */
export class MockCmeAdapter implements MarketDataAdapter {
  readonly name = "mock-cme";
  readonly supportedSymbols: InstrumentSymbol[] = ["6E", "6B", "6J", "6A", "6C", "6S", "6N"];

  private readonly basePrices: Record<string, number> = {
    "6E": 1.08,   // EUR
    "6B": 1.26,   // GBP
    "6J": 0.0065, // JPY (inverse of USDJPY)
    "6A": 0.65,   // AUD
    "6C": 0.73,   // CAD (inverse of USDCAD)
    "6S": 1.12,   // CHF (inverse of USDCHF)
    "6N": 0.60,   // NZD
  };
  private readonly lastPrices = new Map<InstrumentSymbol, number>();
  private readonly lastSpreads = new Map<InstrumentSymbol, number>();
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private readonly config: Config = { tickIntervalMs: 500, shockProbability: 0.01 },
  ) {
    for (const s of this.supportedSymbols) {
      this.lastPrices.set(s, this.basePrices[s] ?? 1);
      this.lastSpreads.set(s, this.basePrices[s]! * 0.00005);
    }
  }

  async start(onTick: (tick: MarketTick) => void): Promise<void> {
    this.timer = setInterval(() => {
      for (const symbol of this.supportedSymbols) {
        onTick(this.nextTick(symbol));
      }
    }, this.config.tickIntervalMs);
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  isConnected(): boolean {
    return this.timer !== null;
  }

  private nextTick(symbol: InstrumentSymbol): MarketTick {
    const base = this.lastPrices.get(symbol)!;
    const shock = Math.random() < this.config.shockProbability;
    const stdDev = base * 0.00015 * (shock ? 8 : 1);
    const delta = randn() * stdDev;
    const price = base + delta;
    this.lastPrices.set(symbol, price);

    const prevSpread = this.lastSpreads.get(symbol)!;
    const spreadNoise = (Math.random() - 0.5) * prevSpread * 0.2;
    const spread = Math.max(
      base * 0.00001,
      prevSpread + spreadNoise + (shock ? prevSpread * 2 : 0),
    );
    this.lastSpreads.set(symbol, spread);

    const bid = price - spread / 2;
    const ask = price + spread / 2;

    const baseVolume = 50 + Math.random() * 80;
    const volume = shock ? baseVolume * (5 + Math.random() * 8) : baseVolume;

    return {
      symbol,
      timestamp: new Date().toISOString(),
      price,
      bid,
      ask,
      bidSize: 100 + Math.random() * 400,
      askSize: 100 + Math.random() * 400,
      volume,
      source: this.name,
      dataQuality: "MOCK",
      delayStatus: "mock",
    };
  }
}

/** Box–Muller normal(0,1). */
function randn(): number {
  const u = Math.random() || 1e-9;
  const v = Math.random() || 1e-9;
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
