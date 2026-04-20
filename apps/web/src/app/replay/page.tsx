"use client";

import useSWR from "swr";
import { useState } from "react";
import { apiFetch, API_URL } from "@/lib/api";
import { useT } from "@/lib/i18n";

interface ReplaySession {
  id: string;
  label: string;
  startTs: string;
  endTs: string;
  speed: number;
  state: string;
}

export default function ReplayPage() {
  const { t } = useT();
  const { data, mutate } = useSWR<ReplaySession[]>("/api/replay/sessions", (p: string) =>
    apiFetch<ReplaySession[]>(p),
  );
  const [label, setLabel] = useState("NFP 2025-10-03");
  const [speed, setSpeed] = useState(4);

  async function start() {
    const now = new Date();
    const start = new Date(now.getTime() - 3600_000);
    await fetch(`${API_URL}/api/replay/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ label, startTs: start.toISOString(), endTs: now.toISOString(), speed }),
    });
    mutate();
  }

  async function stop(id: string) {
    await fetch(`${API_URL}/api/replay/stop`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    mutate();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">{t("replay.title")}</h1>
      <p className="text-sm text-muted mb-4">{t("replay.subtitle")}</p>
      <div className="border border-border rounded-md p-3 bg-panel/50 mb-4 flex flex-wrap items-end gap-3">
        <label className="text-xs">
          <div className="text-muted mb-1">{t("replay.label")}</div>
          <input
            className="bg-bg border border-border rounded px-2 py-1 text-sm"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
        <label className="text-xs">
          <div className="text-muted mb-1">{t("replay.speed")}</div>
          <input
            type="number"
            min={1}
            className="bg-bg border border-border rounded px-2 py-1 text-sm w-20"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
        <button
          onClick={start}
          className="px-3 py-1.5 text-sm bg-accent/20 border border-accent text-accent rounded"
        >
          {t("replay.start")}
        </button>
      </div>
      <ul className="space-y-2">
        {(data ?? []).map((s) => (
          <li key={s.id} className="border border-border rounded-md p-3 bg-panel/50">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs">{s.label}</span>
              <span className="text-xs text-muted">{s.speed}×</span>
              <span className={`text-xs uppercase ${s.state === "running" ? "text-accent" : "text-muted"}`}>{s.state}</span>
              {s.state === "running" && (
                <button onClick={() => stop(s.id)} className="ml-auto text-xs underline text-bad">{t("common.stop")}</button>
              )}
            </div>
            <div className="text-xs text-muted mt-1">
              {new Date(s.startTs).toLocaleString()} → {new Date(s.endTs).toLocaleString()}
            </div>
          </li>
        ))}
        {(!data || data.length === 0) && <li className="text-sm text-muted">{t("replay.empty")}</li>}
      </ul>
    </div>
  );
}
