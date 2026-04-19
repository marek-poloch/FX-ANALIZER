import type { MarketDataAdapter } from "./market-data.adapter";
import type { MarketTick, InstrumentSymbol } from "@fxradar/shared-types";

/**
 * Production CME FX futures adapter — stub.
 *
 * CME does not offer a retail-friendly public market data API.
 * Real integrations typically go through:
 *   - CME MDP 3.0 via a licensed vendor
 *   - Databento, Polygon Futures, CQG, Rithmic
 *
 * Configure credentials via .env:
 *   CME_API_KEY, CME_API_SECRET
 *
 * Until an account is provisioned, start() refuses to run and the system
 * falls back to MockCmeAdapter.
 */
export class CmeAdapter implements MarketDataAdapter {
  readonly name = "cme";
  readonly supportedSymbols: InstrumentSymbol[] = ["6E", "6B", "6J", "6A", "6C", "6S", "6N"];

  constructor(
    private readonly apiKey?: string,
    private readonly apiSecret?: string,
  ) {}

  async start(_onTick: (tick: MarketTick) => void): Promise<void> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error(
        "CmeAdapter: missing CME_API_KEY / CME_API_SECRET. " +
          "See docs/API_KEYS.md for provider options.",
      );
    }
    throw new Error("CmeAdapter: live integration not implemented. Use mock/demo mode.");
  }

  async stop(): Promise<void> {
    /* no-op */
  }

  isConnected(): boolean {
    return false;
  }
}
