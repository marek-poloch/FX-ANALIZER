"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { Instrument, MarketTick } from "@fxradar/shared-types";

export default function LiquidityPage() {
  const { data: instruments } = useSWR<Instrument[]>("/api/instruments", (p: string) =>
    apiFetch<Instrument[]>(p),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Liquidity / Levels</h1>
      <p className="text-sm text-muted mb-4">
        Session ranges, VWAP, and liquidity sweep candidates. Demo mode shows the last ~500 ticks.
      </p>
      <div className="grid md:grid-cols-2 gap-3">
        {(instruments ?? []).map((i) => (
          <LiquidityCard key={i.symbol} symbol={i.symbol} />
        ))}
      </div>
    </div>
  );
}

function LiquidityCard({ symbol }: { symbol: string }) {
  const { data } = useSWR<MarketTick[]>(
    `/api/market/${symbol}/ticks?limit=500`,
    (p: string) => apiFetch<MarketTick[]>(p),
    { refreshInterval: 5000 },
  );
  if (!data || data.length === 0)
    return <div className="border border-border rounded-md p-3 text-sm text-muted">{symbol} — no data</div>;

  const prices = data.map((t) => t.price);
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const last = prices[prices.length - 1]!;
  const vwap = computeVwap(data);

  return (
    <div className="border border-border rounded-md p-3 bg-panel/50">
      <div className="flex items-baseline gap-3">
        <span className="font-mono font-semibold">{symbol}</span>
        <span className="text-xs text-muted ml-auto">{data.length} ticks</span>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2 text-xs">
        <Stat label="Last" value={last.toFixed(5)} />
        <Stat label="Session High" value={high.toFixed(5)} />
        <Stat label="Session Low" value={low.toFixed(5)} />
        <Stat label="VWAP" value={vwap.toFixed(5)} />
      </div>
    </div>
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
