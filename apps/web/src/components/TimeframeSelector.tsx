"use client";

import { TIMEFRAMES, type TimeframeId } from "@/lib/timeframe";
import { useT } from "@/lib/i18n";

interface Props {
  value: TimeframeId;
  onChange: (id: TimeframeId) => void;
  className?: string;
}

export function TimeframeSelector({ value, onChange, className }: Props) {
  const { t } = useT();
  return (
    <div
      className={
        "flex flex-wrap items-center gap-1 " + (className ?? "")
      }
      role="radiogroup"
      aria-label={t("timeframe.label")}
    >
      <span className="text-xs text-muted mr-1">{t("timeframe.label")}:</span>
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.id}
          type="button"
          role="radio"
          aria-checked={value === tf.id}
          onClick={() => onChange(tf.id)}
          className={
            "px-2 py-0.5 text-[11px] rounded border transition " +
            (value === tf.id
              ? "bg-accent/20 border-accent text-accent"
              : "border-border text-muted hover:text-white")
          }
        >
          {t(`timeframe.${tf.id}` as const)}
        </button>
      ))}
    </div>
  );
}
