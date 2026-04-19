import type { MarketTick, InstrumentSymbol } from "@fxradar/shared-types";

/**
 * Canonical interface every market data source must implement.
 * Mock/demo/live implementations all satisfy this contract so the rest of
 * the system never depends on a specific provider.
 */
export interface MarketDataAdapter {
  readonly name: string;
  readonly supportedSymbols: InstrumentSymbol[];

  /** Open the connection / start polling. */
  start(onTick: (tick: MarketTick) => void): Promise<void>;

  /** Gracefully close. */
  stop(): Promise<void>;

  /** For health telemetry. */
  isConnected(): boolean;
}
