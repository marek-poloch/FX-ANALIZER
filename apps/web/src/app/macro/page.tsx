"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api";
import type { MacroEvent } from "@fxradar/shared-types";

export default function MacroCalendarPage() {
  const { data } = useSWR<MacroEvent[]>("/api/macro/calendar", (p: string) =>
    apiFetch<MacroEvent[]>(p),
  );
  const events = (data ?? []).slice().sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Macro Calendar</h1>
      <p className="text-sm text-muted mb-4">Upcoming high-impact events that alter flow bias.</p>
      <div className="space-y-2">
        {events.map((e) => (
          <div key={e.id} className="border border-border rounded-md p-3 bg-panel/50">
            <div className="flex items-baseline gap-3">
              <span className="font-mono">{e.currency}</span>
              <span className={
                e.impact === "high" ? "text-bad text-xs uppercase"
                : e.impact === "medium" ? "text-warn text-xs uppercase"
                : "text-muted text-xs uppercase"
              }>
                {e.impact}
              </span>
              <span className="ml-auto text-xs text-muted">
                {new Date(e.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="text-sm mt-1">{e.name}</div>
            <div className="text-xs text-muted">
              Forecast: {e.forecast ?? "—"} · Previous: {e.previous ?? "—"} · Actual: {e.actual ?? "—"}
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="text-sm text-muted">No events.</div>}
      </div>
    </div>
  );
}
