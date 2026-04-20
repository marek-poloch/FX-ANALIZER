"use client";

import { useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import { formatSymbol } from "@/lib/ui";
import { useT } from "@/lib/i18n";
import { TimeframeSelector } from "@/components/TimeframeSelector";
import {
  DEFAULT_TIMEFRAME,
  filterTicksByTimeframe,
  type TimeframeId,
} from "@/lib/timeframe";
import type { Instrument, MarketTick } from "@fxradar/shared-types";

export default function LiquidityPage() {
  const { t } = useT();
  const [tf, setTf] = useState<TimeframeId>(DEFAULT_TIMEFRAME);
  const { data: instruments } = useSWR<Instrument[]>("/api/instruments", (p: string) =>
    apiFetch<Instrument[]>(p),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">{t("liquidity.title")}</h1>
      <p className="text-sm text-muted mb-3">{t("liquidity.subtitle")}</p>
      <div className="mb-4">
        <TimeframeSelector value={tf} onChange={setTf} />
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {(instruments ?? []).map((i) => (
          <LiquidityCard key={i.symbol} symbol={i.symbol} timeframe={tf} />
        ))}
      </div>
    </div>
  );
}

type LiquidityState = "elevated" | "depressed" | "normal";

/**
 * Thresholds chosen to match the general "flow anomaly" intuition used
 * elsewhere in the app: ≥1.25× baseline = notably thick book, ≤0.75× =
 * notably thin book. Neutral band avoids flapping on tiny fluctuations.
 */
const ELEVATED_THRESHOLD = 1.25;
const DEPRESSED_THRESHOLD = 0.75;

function classifyLiquidity(windowRate: number, baselineRate: number): LiquidityState {
  if (baselineRate <= 0) return "normal";
  const r = windowRate / baselineRate;
  if (r >= ELEVATED_THRESHOLD) return "elevated";
  if (r <= DEPRESSED_THRESHOLD) return "depressed";
  return "normal";
}

/** Volume units per second across a tick slice. Falls back to tick-count when
 *  the adapter doesn't report per-tick volume. */
function volumeRate(ticks: MarketTick[]): number {
  if (ticks.length < 2) return 0;
  const total = ticks.reduce((s, tk) => s + (tk.volume ?? 1), 0);
  const spanMs =
    new Date(ticks[ticks.length - 1]!.timestamp).getTime() -
    new Date(ticks[0]!.timestamp).getTime();
  const spanSec = Math.max(1, spanMs / 1000);
  return total / spanSec;
}

function LiquidityCard({ symbol, timeframe }: { symbol: string; timeframe: TimeframeId }) {
  const { t } = useT();
  // Over-fetch so longer lookback windows have data; store caps at 10_000.
  const { data } = useSWR<MarketTick[]>(
    `/api/market/${symbol}/ticks?limit=10000`,
    (p: string) => apiFetch<MarketTick[]>(p),
    { refreshInterval: 5000 },
  );
  if (!data || data.length === 0)
    return (
      <div className="border border-border rounded-md p-3 text-sm text-muted">
        {formatSymbol(symbol)} — {t("liquidity.noData")}
      </div>
    );

  const windowed = filterTicksByTimeframe(data, timeframe);
  const prices = windowed.map((x) => x.price);
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const first = prices[0]!;
  const last = prices[prices.length - 1]!;
  const vwap = computeVwap(windowed);

  // Baseline = full-dataset rate; window rate = rate inside the selected
  // timeframe. With a 1-tick window (instant / degenerate), we can't measure
  // a rate — fall back to "normal" and no arrow.
  const windowRate = volumeRate(windowed);
  const baselineRate = volumeRate(data);
  const state: LiquidityState =
    windowed.length < 2 ? "normal" : classifyLiquidity(windowRate, baselineRate);
  const ratio = baselineRate > 0 ? windowRate / baselineRate : 1;

  const priceDelta = last - first;
  const priceDeltaPct = first > 0 ? (priceDelta / first) * 100 : 0;
  const priceDir: "up" | "down" | "flat" =
    windowed.length < 2 || Math.abs(priceDelta) < 1e-9
      ? "flat"
      : priceDelta > 0
        ? "up"
        : "down";

  const wrapClass =
    state === "elevated"
      ? "border-good/60 bg-good/10"
      : state === "depressed"
        ? "border-bad/60 bg-bad/10"
        : "border-border bg-panel/50";

  const stateLabel =
    state === "elevated"
      ? t("liquidity.state.elevated")
      : state === "depressed"
        ? t("liquidity.state.depressed")
        : t("liquidity.state.normal");
  const stateTextClass =
    state === "elevated" ? "text-good" : state === "depressed" ? "text-bad" : "text-muted";

  return (
    <div className={`relative border rounded-md p-3 overflow-hidden ${wrapClass}`}>
      <PriceArrow direction={priceDir} />
      <div className="relative flex items-baseline gap-3">
        <span className="font-mono font-semibold">{formatSymbol(symbol)}</span>
        <span className={`text-[11px] uppercase tracking-wide ${stateTextClass}`}>
          {stateLabel}
        </span>
        <span className="text-xs text-muted ml-auto">
          {windowed.length} {t("liquidity.ticks")}
        </span>
      </div>
      <div className="relative grid grid-cols-4 gap-2 mt-2 text-xs">
        <Stat label={t("liquidity.last")} value={last.toFixed(5)} />
        <Stat label={t("liquidity.sessionHigh")} value={high.toFixed(5)} />
        <Stat label={t("liquidity.sessionLow")} value={low.toFixed(5)} />
        <Stat label={t("liquidity.vwap")} value={vwap.toFixed(5)} />
      </div>
      <div className="relative flex items-center justify-between mt-2 text-[11px] text-muted">
        <span>
          {t("liquidity.priceChange")}:{" "}
          <span
            className={
              priceDir === "up" ? "text-good" : priceDir === "down" ? "text-bad" : "text-muted"
            }
          >
            {priceDir === "up" ? "▲" : priceDir === "down" ? "▼" : "■"}{" "}
            {priceDelta >= 0 ? "+" : ""}
            {priceDelta.toFixed(5)} ({priceDeltaPct >= 0 ? "+" : ""}
            {priceDeltaPct.toFixed(2)}%)
          </span>
        </span>
        <span>
          {t("liquidity.vsBaseline")}: {ratio.toFixed(2)}×
        </span>
      </div>
    </div>
  );
}

/**
 * Large watermark arrow painted behind the card content. Purely decorative —
 * actual direction/amount is repeated in the textual footer for accessibility.
 */
function PriceArrow({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "flat") return null;
  const isUp = direction === "up";
  const color = isUp ? "rgb(34 197 94 / 0.18)" : "rgb(239 68 68 / 0.18)";
  // SVG centred, large, points up or down.
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute right-2 top-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none"
      style={{ color }}
    >
      {isUp ? (
        <polygon points="50,10 90,80 60,80 60,95 40,95 40,80 10,80" fill="currentColor" />
      ) : (
        <polygon points="50,90 10,20 40,20 40,5 60,5 60,20 90,20" fill="currentColor" />
      )}
    </svg>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded p-2">
      <div className="text-muted">{label}</div>
      <div className="font-mono">{value}</div>
    </div>
  );
}

function computeVwap(ticks: MarketTick[]): number {
  let pv = 0;
  let v = 0;
  for (const t of ticks) {
    const vol = t.volume ?? 1;
    pv += t.price * vol;
    v += vol;
  }
  return v > 0 ? pv / v : ticks[ticks.length - 1]?.price ?? 0;
}
