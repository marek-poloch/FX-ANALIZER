"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import { getNewsSocket } from "@/lib/ws";
import type { NewsItem } from "@fxradar/shared-types";

const CURRENCIES = ["ALL", "USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD"] as const;

export default function NewsPage() {
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("ALL");
  const path = currency === "ALL" ? "/api/news" : `/api/news?currency=${currency}`;
  const { data, mutate } = useSWR<NewsItem[]>(path, (p: string) => apiFetch<NewsItem[]>(p));

  useEffect(() => {
    const s = getNewsSocket();
    s.on("news", () => mutate());
    return () => { s.off("news"); };
  }, [mutate]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">News Feed</h1>
      <p className="text-sm text-muted mb-4">Headlines tagged by affected currency.</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {CURRENCIES.map((c) => (
          <button
            key={c}
            onClick={() => setCurrency(c)}
            className={`px-2 py-1 text-xs rounded border ${
              currency === c ? "bg-accent/20 border-accent text-accent" : "border-border text-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {(data ?? []).map((n) => (
          <li key={n.id} className="border border-border rounded-md p-3 bg-panel/50">
            <div className="flex items-baseline gap-3">
              <span className="text-xs text-muted">{new Date(n.timestamp).toLocaleTimeString()}</span>
              <span className="text-xs text-muted">{n.source}</span>
              <span className="ml-auto flex gap-1">
                {n.currencies.map((c) => (
                  <span key={c} className="text-[10px] px-1.5 py-0.5 rounded bg-panel border border-border">{c}</span>
                ))}
              </span>
            </div>
            <div className="text-sm mt-1">{n.title}</div>
            {n.tags.length > 0 && (
              <div className="text-xs text-muted mt-1">tags: {n.tags.join(", ")}</div>
            )}
          </li>
        ))}
        {(!data || data.length === 0) && <li className="text-sm text-muted">No news yet.</li>}
      </ul>
    </div>
  );
}
