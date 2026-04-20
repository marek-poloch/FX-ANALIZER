"use client";

import useSWR from "swr";
import { use, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatSymbol } from "@/lib/ui";
import { useT } from "@/lib/i18n";
import { TimeframeSelector } from "@/components/TimeframeSelector";
import {
  DEFAULT_TIMEFRAME,
  filterTicksByTimeframe,
  type TimeframeId,
} from "@/lib/timeframe";
import type { MarketTick, SentimentSnapshot, CotReport } from "@fxradar/shared-types";

interface Props {
  params: Promise<{ symbol: string }>;
}

export default function InstrumentDetailPage({ params }: Props) {
  const { t } = useT();
  const { symbol } = use(params);
  const [tf, setTf] = useState<TimeframeId>(DEFAULT_TIMEFRAME);
  const { data: ticks } = useSWR<MarketTick[]>(
    `/api/market/${symbol}/ticks?limit=10000`,
    (p: string) => apiFetch<MarketTick[]>(p),
    { refreshInterval: 2000 },
  );
  const windowed = useMemo(
    () => filterTicksByTimeframe(ticks ?? [], tf),
    [ticks, tf],
  );
  const { data: sentiment } = useSWR<SentimentSnapshot[]>(
    `/api/sentiment/${symbol}`,
    (p: string) => apiFetch<SentimentSnapshot[]>(p),
  );
  const { data: cot } = useSWR<CotReport[]>(
    `/api/cot/${symbol}`,
    (p: string) => apiFetch<CotReport[]>(p),
  );

  const last = windowed[windowed.length - 1];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1 font-mono">{formatSymbol(symbol)}</h1>
      <p className="text-sm text-muted mb-3">
        {t("instrument.price")}: {last?.price?.toFixed(5) ?? "—"} · {last?.dataQuality ?? "—"} · {last?.delayStatus ?? "—"}
      </p>
      <div className="mb-4">
        <TimeframeSelector value={tf} onChange={setTf} />
      </div>

      <Sparkline ticks={windowed} />

      <div className="grid md:grid-cols-2 gap-3 mt-6">
        <div className="border border-border rounded-md p-3 bg-panel/50">
          <h2 className="text-sm font-semibold mb-2">{t("instrument.sentiment")}</h2>
          {(sentiment ?? []).length === 0 ? (
            <div className="text-xs text-muted">{t("instrument.noSentiment")}</div>
          ) : (
            sentiment!.map((s) => (
              <div key={s.source} className="text-xs mb-2">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold">{s.source}</span>
                  <span className="text-muted">{t("instrument.delay")} {s.delayMinutes}m · {s.representativeness}</span>
                </div>
                <div className="flex h-2 rounded overflow-hidden mt-1 border border-border">
                  <div className="bg-good" style={{ width: `${s.longPct}%` }} />
                  <div className="bg-bad" style={{ width: `${s.shortPct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted mt-0.5">
                  <span>{t("instrument.long")} {s.longPct.toFixed(0)}%</span>
                  <span>{t("instrument.short")} {s.shortPct.toFixed(0)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="border border-border rounded-md p-3 bg-panel/50">
          <h2 className="text-sm font-semibold mb-2">{t("instrument.cot")}</h2>
          {(cot ?? []).length === 0 ? (
            <div className="text-xs text-muted">{t("instrument.noCot")}</div>
          ) : (
            cot!.map((c) => (
              <div key={c.reportDate} className="text-xs grid grid-cols-2 gap-1">
                <span className="text-muted">{t("instrument.reportDate")}</span><span className="font-mono">{c.reportDate}</span>
                <span className="text-muted">{t("instrument.commercialsNet")}</span><span className="font-mono">{c.commercialsNet.toFixed(0)}</span>
                <span className="text-muted">{t("instrument.nonCommercialsNet")}</span><span className="font-mono">{c.nonCommercialsNet.toFixed(0)}</span>
                <span className="text-muted">{t("instrument.weeklyChange")}</span><span className="font-mono">{c.weeklyChange.toFixed(0)}</span>
                {c.percentileRank3y != null && (
                  <>
                    <span className="text-muted">{t("instrument.percentile3y")}</span>
                    <span className="font-mono">{(c.percentileRank3y * 100).toFixed(0)}%</span>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Sparkline({ ticks }: { ticks: MarketTick[] }) {
  if (ticks.length < 2) {
    return <div className="h-40 border border-border rounded-md bg-panel/50" />;
  }
  const prices = ticks.map((t) => t.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const w = 800;
  const h = 160;
  const range = max - min || 1;
  const pts = prices
    .map((p, i) => `${(i / (prices.length - 1)) * w},${h - ((p - min) / range) * h}`)
    .join(" ");
  return (
    <div className="border border-border rounded-md p-2 bg-panel/50">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
        <polyline points={pts} fill="none" stroke="#22d3ee" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
