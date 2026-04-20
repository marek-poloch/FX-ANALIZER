/**
 * Timeframe = lookback window applied to a tick stream.
 *
 *   "instant" → last tick only (stats collapse to a single price)
 *   Everything else → all ticks within the last N seconds.
 *
 * Kept client-side: we over-fetch (limit=10_000) and filter by timestamp,
 * so no API/server changes are required.
 */

import type { MarketTick } from "@fxradar/shared-types";

export const TIMEFRAME_IDS = [
  "instant",
  "1s",
  "5s",
  "10s",
  "15s",
  "30s",
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "3h",
  "5h",
  "1d",
  "3d",
  "5d",
  "1w",
  "1mo",
] as const;

export type TimeframeId = (typeof TIMEFRAME_IDS)[number];

interface TimeframeSpec {
  id: TimeframeId;
  /** window length in seconds; 0 means "instant" (last tick only) */
  seconds: number;
}

const DAY = 86_400;

export const TIMEFRAMES: readonly TimeframeSpec[] = [
  { id: "instant", seconds: 0 },
  { id: "1s", seconds: 1 },
  { id: "5s", seconds: 5 },
  { id: "10s", seconds: 10 },
  { id: "15s", seconds: 15 },
  { id: "30s", seconds: 30 },
  { id: "1m", seconds: 60 },
  { id: "5m", seconds: 5 * 60 },
  { id: "15m", seconds: 15 * 60 },
  { id: "30m", seconds: 30 * 60 },
  { id: "1h", seconds: 3_600 },
  { id: "3h", seconds: 3 * 3_600 },
  { id: "5h", seconds: 5 * 3_600 },
  { id: "1d", seconds: DAY },
  { id: "3d", seconds: 3 * DAY },
  { id: "5d", seconds: 5 * DAY },
  { id: "1w", seconds: 7 * DAY },
  { id: "1mo", seconds: 30 * DAY },
] as const;

/** Most recently seen timeframe; used to default pages the first time. */
export const DEFAULT_TIMEFRAME: TimeframeId = "5m";

export function timeframeSeconds(id: TimeframeId): number {
  return TIMEFRAMES.find((t) => t.id === id)?.seconds ?? 0;
}

/**
 * Apply a timeframe window to an already-sorted (ascending) tick array.
 * Returns a *new* slice — never mutates input.
 */
export function filterTicksByTimeframe<T extends MarketTick>(
  ticks: T[],
  id: TimeframeId,
): T[] {
  if (ticks.length === 0) return ticks;
  if (id === "instant") return [ticks[ticks.length - 1]!];
  const seconds = timeframeSeconds(id);
  if (seconds <= 0) return [ticks[ticks.length - 1]!];

  // Anchor to the freshest tick, not wall-clock, so the view stays stable
  // even if the client's clock drifts from the server's.
  const anchorMs = new Date(ticks[ticks.length - 1]!.timestamp).getTime();
  const cutoffMs = anchorMs - seconds * 1000;

  // Fast path: walk backwards until we fall out of the window. This is O(k)
  // where k is the size of the returned slice, rather than O(n) for a full
  // filter pass.
  let firstIdx = ticks.length;
  for (let i = ticks.length - 1; i >= 0; i--) {
    if (new Date(ticks[i]!.timestamp).getTime() < cutoffMs) break;
    firstIdx = i;
  }
  return ticks.slice(firstIdx);
}
