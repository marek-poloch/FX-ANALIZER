// Shared type contracts between apps/web, apps/api, and services.

export type DataMode = "mock" | "demo" | "live";
export type DataQuality = "GOOD" | "DEGRADED" | "DELAYED" | "MOCK" | "OFFLINE";
export type Severity = "LOW" | "MEDIUM" | "HIGH";
export type DelayStatus = "realtime" | "delayed" | "mock";

// --- Instruments -----------------------------------------------------------

export type InstrumentSymbol =
  | "6E" | "6B" | "6J" | "6A" | "6C" | "6S" | "6N" | "M6E"
  | "EURUSD" | "GBPUSD" | "USDJPY" | "AUDUSD" | "USDCAD" | "USDCHF" | "NZDUSD" | "DXY";

export interface Instrument {
  symbol: InstrumentSymbol;
  description: string;
  proxyFor?: string;
  invertForSpot?: boolean;
  exchange: "CME" | "SPOT" | "INDEX";
}

// --- Market data -----------------------------------------------------------

export interface MarketTick {
  symbol: InstrumentSymbol;
  timestamp: string; // ISO 8601
  price: number;
  bid?: number;
  ask?: number;
  bidSize?: number;
  askSize?: number;
  volume?: number;
  source: string;
  dataQuality: DataQuality;
  delayStatus: DelayStatus;
}

export interface Candle {
  symbol: InstrumentSymbol;
  interval: "1m" | "5m" | "15m" | "1h" | "4h" | "1d";
  openTime: string;
  closeTime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  trades?: number;
  vwap?: number;
}

export interface OrderBookSnapshot {
  symbol: InstrumentSymbol;
  timestamp: string;
  bids: Array<{ price: number; size: number }>;
  asks: Array<{ price: number; size: number }>;
  spread: number;
  imbalanceRatio: number;
}

// --- Stats / indicators ----------------------------------------------------

export interface VolumeStats {
  symbol: InstrumentSymbol;
  interval: "1m" | "5m" | "15m" | "1h";
  timestamp: string;
  volume: number;
  baselineEwma: number;
  zScore: number;
  percentileRank: number;
}

export interface SpreadStats {
  symbol: InstrumentSymbol;
  timestamp: string;
  spread: number;
  medianSessionSpread: number;
  zScore: number;
}

// --- Composite score & alerts ---------------------------------------------

export interface FlowScoreComponents {
  volumeShock: number;       // 0..20
  priceImpulse: number;      // 0..15
  spreadShock: number;       // 0..10
  orderBookImbalance: number;// 0..15
  liquiditySweep: number;    // 0..10
  crossPair: number;         // 0..10
  macroNews: number;         // 0..10
  sentiment: number;         // 0..5
  cot: number;               // 0..5
}

export interface FlowScore {
  symbol: InstrumentSymbol;
  timestamp: string;
  total: number; // 0..100
  components: FlowScoreComponents;
  category: "noise" | "watch" | "significant" | "probable_institutional" | "major_event";
}

export interface AlertExplanation {
  primaryReason: string;
  contributingFactors: string[];
  dataUsed: string[];
  delayedDataSources: string[];
  unknowns: string[];
}

export interface Alert {
  id: string;
  symbol: InstrumentSymbol;
  timestamp: string;
  severity: Severity;
  score: number;
  title: string;
  description: string;
  explanation: AlertExplanation;
  dataMode: DataMode;
  dismissedAt?: string;
}

// --- Macro / News / Sentiment / COT ---------------------------------------

export interface MacroEvent {
  id: string;
  timestamp: string;
  currency: string;
  name: string;
  impact: "low" | "medium" | "high";
  forecast?: number | string;
  previous?: number | string;
  actual?: number | string;
  source: string;
}

export interface NewsItem {
  id: string;
  timestamp: string;
  title: string;
  summary?: string;
  url?: string;
  source: string;
  currencies: string[];
  tags: string[];
  impactScore?: number;
}

export interface SentimentSnapshot {
  symbol: InstrumentSymbol;
  timestamp: string;
  source: string; // "IG" | "OANDA" | "Myfxbook" | "FXSSI" | "Dukascopy"
  longPct: number;
  shortPct: number;
  representativeness: "broker_only" | "aggregated";
  delayMinutes: number;
}

export interface CotReport {
  symbol: InstrumentSymbol;
  reportDate: string;
  commercialsNet: number;
  nonCommercialsNet: number;
  leveragedFundsNet?: number;
  assetManagersNet?: number;
  percentileRank3y?: number;
  percentileRank5y?: number;
  weeklyChange: number;
}

// --- Data source health ---------------------------------------------------

export interface DataSourceHealth {
  source: string;
  status: DataQuality;
  lastEventAt?: string;
  latencyMs?: number;
  message?: string;
}
