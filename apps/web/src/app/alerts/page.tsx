"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import { cn, severityClass } from "@/lib/ui";
import { getAlertsSocket } from "@/lib/ws";
import type { Alert } from "@fxradar/shared-types";

export default function LiveRadarPage() {
  const { data, mutate } = useSWR<Alert[]>("/api/alerts", (p: string) => apiFetch<Alert[]>(p));
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const s = getAlertsSocket();
    s.on("alert", () => mutate());
    return () => { s.off("alert"); };
  }, [mutate]);

  const alerts = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Live Flow Radar</h1>
      <p className="text-sm text-muted mb-4">
        Ranked anomalies with composite flow score ≥ 31. Click "Explain" for detail.
      </p>

      <ul className="space-y-2">
        {alerts.length === 0 && (
          <li className="text-sm text-muted">No alerts yet — waiting for flow anomalies…</li>
        )}
        {alerts.map((a) => (
          <li key={a.id} className={cn("border rounded-md p-3", severityClass(a.severity))}>
            <div className="flex items-baseline gap-3">
              <span className="font-mono font-semibold">{a.symbol}</span>
              <span className="text-xs uppercase">{a.severity}</span>
              <span className="font-mono text-xs">{a.score.toFixed(0)}/100</span>
              <span className="text-xs text-muted ml-auto">{new Date(a.timestamp).toLocaleTimeString()}</span>
            </div>
            <div className="text-sm mt-1">{a.title}</div>
            <div className="text-xs text-muted mt-0.5">{a.description}</div>
            <button
              className="text-xs mt-2 underline text-accent"
              onClick={() => setExpanded((id) => (id === a.id ? null : a.id))}
            >
              {expanded === a.id ? "Hide" : "Explain"}
            </button>
            {expanded === a.id && (
              <div className="mt-2 text-xs space-y-1">
                <div><strong>Primary reason:</strong> {a.explanation.primaryReason}</div>
                {a.explanation.contributingFactors.length > 0 && (
                  <div><strong>Contributing:</strong> {a.explanation.contributingFactors.join("; ")}</div>
                )}
                <div><strong>Data used:</strong> {a.explanation.dataUsed.join(", ")}</div>
                {a.explanation.delayedDataSources.length > 0 && (
                  <div className="text-warn"><strong>Delayed sources:</strong> {a.explanation.delayedDataSources.join(", ")}</div>
                )}
                {a.explanation.unknowns.length > 0 && (
                  <div className="text-muted"><strong>Unknowns:</strong> {a.explanation.unknowns.join("; ")}</div>
                )}
                <div className="text-muted pt-1 border-t border-border/60">
                  Mode: {a.dataMode} · not investment advice
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
