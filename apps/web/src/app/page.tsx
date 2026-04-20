"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import { cn, categoryClass, formatPrice, formatSymbol } from "@/lib/ui";
import { getMarketSocket } from "@/lib/ws";
import { useT } from "@/lib/i18n";
import type { FlowScore, MarketTick } from "@fxradar/shared-types";

type OverviewRow = {
  symbol: string;
  description: string;
  proxyFor?: string;
  price: number | null;
  timestamp: string | null;
  dataQuality: string;
  delayStatus: string;
  flowScore: number;
  category: string;
};

export default function MarketOverviewPage() {
  const { t } = useT();
  const { data, mutate } = useSWR<OverviewRow[]>(
    "/api/market/overview",
    (p: string) => apiFetch<OverviewRow[]>(p),
    { refreshInterval: 5000 },
  );
  const [live, setLive] = useState<Record<string, { price: number; score?: number; cat?: string }>>({});

  useEffect(() => {
    const s = getMarketSocket();
    s.on("tick", (t: MarketTick) => {
      setLive((prev) => ({ ...prev, [t.symbol]: { ...prev[t.symbol], price: t.price } }));
    });
    s.on("flow", (f: FlowScore) => {
      setLive((prev) => ({ ...prev, [f.symbol]: { ...prev[f.symbol], price: prev[f.symbol]?.price ?? 0, score: f.total, cat: f.category } }));
    });
    const iv = setInterval(() => mutate(), 10_000);
    return () => { s.off("tick"); s.off("flow"); clearInterval(iv); };
  }, [mutate]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">{t("overview.title")}</h1>
      <p className="text-sm text-muted mb-4">{t("overview.subtitle")}</p>
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-panel text-muted text-left">
            <tr>
              <th className="px-3 py-2">{t("overview.col.symbol")}</th>
              <th className="px-3 py-2">{t("overview.col.description")}</th>
              <th className="px-3 py-2">{t("overview.col.proxy")}</th>
              <th className="px-3 py-2 text-right">{t("overview.col.price")}</th>
              <th className="px-3 py-2 text-right">{t("overview.col.score")}</th>
              <th className="px-3 py-2">{t("overview.col.category")}</th>
              <th className="px-3 py-2">{t("overview.col.source")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(data ?? []).map((r) => {
              const l = live[r.symbol];
              const price = l?.price ?? r.price;
              const score = l?.score ?? r.flowScore;
              const cat = l?.cat ?? r.category;
              return (
                <tr key={r.symbol} className="hover:bg-panel/50">
                  <td className="px-3 py-2 font-mono">{formatSymbol(r.symbol)}</td>
                  <td className="px-3 py-2">{r.description}</td>
                  <td className="px-3 py-2 text-muted">{r.proxyFor}</td>
                  <td className="px-3 py-2 text-right font-mono">{formatPrice(price)}</td>
                  <td className="px-3 py-2 text-right font-mono">{(score ?? 0).toFixed(0)}/100</td>
                  <td className={cn("px-3 py-2 text-xs uppercase", categoryClass(cat))}>{cat}</td>
                  <td className="px-3 py-2 text-xs text-muted">
                    {r.delayStatus} · {r.dataQuality}
                  </td>
                </tr>
              );
            })}
            {!data && (
              <tr><td className="px-3 py-4 text-muted" colSpan={7}>{t("common.loading")}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
