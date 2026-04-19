"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";

export default function SettingsPage() {
  const [minScore, setMinScore] = useState(50);
  const [minSeverity, setMinSeverity] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [channels, setChannels] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  function toggleChannel(name: string) {
    setChannels((c) => (c.includes(name) ? c.filter((x) => x !== name) : [...c, name]));
  }

  async function save() {
    setStatus("Saving…");
    const res = await fetch(`${API_URL}/api/alerts/config`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userId: "local", minScore, minSeverity, channels }),
    });
    setStatus(res.ok ? "Saved ✓" : `Error: ${res.status}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-1">Alert Configuration</h1>
      <p className="text-sm text-muted mb-4">
        Configure alert thresholds and notification channels. Demo mode keeps config in memory.
      </p>
      <div className="border border-border rounded-md p-4 bg-panel/50 space-y-4 max-w-lg">
        <label className="block text-sm">
          <div className="text-muted mb-1">Minimum score (0–100)</div>
          <input
            type="range"
            min={0}
            max={100}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-full"
          />
          <div className="font-mono text-xs">{minScore}</div>
        </label>
        <label className="block text-sm">
          <div className="text-muted mb-1">Minimum severity</div>
          <select
            value={minSeverity}
            onChange={(e) => setMinSeverity(e.target.value as "LOW" | "MEDIUM" | "HIGH")}
            className="bg-bg border border-border rounded px-2 py-1 text-sm"
          >
            <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
          </select>
        </label>
        <div className="text-sm">
          <div className="text-muted mb-1">Notification channels</div>
          <div className="flex flex-wrap gap-2">
            {["telegram", "email", "discord", "slack", "webhook"].map((ch) => (
              <button
                key={ch}
                onClick={() => toggleChannel(ch)}
                className={`text-xs px-2 py-1 rounded border ${
                  channels.includes(ch)
                    ? "bg-accent/20 border-accent text-accent"
                    : "border-border text-muted"
                }`}
              >
                {ch}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={save}
          className="px-3 py-1.5 text-sm bg-accent/20 border border-accent text-accent rounded"
        >
          Save
        </button>
        {status && <div className="text-xs text-muted">{status}</div>}
      </div>
    </div>
  );
}
