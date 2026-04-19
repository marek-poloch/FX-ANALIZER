# Alert logic

## Composite flow score (0–100)

Implementation: `apps/api/src/quant/flow-score.ts`.

| Component | Weight | Formula |
|-----------|-------:|---------|
| Volume shock | 20 | `clamp((|z| − 1) · 6.5, 0, 20)` where `z` = rolling volume z-score |
| Price impulse | 15 | `clamp(|return/atr| · 5, 0, 15)` |
| Spread shock | 10 | `clamp((|z| − 1) · 5, 0, 10)` |
| Order book imbalance | 15 | `imbalance · 30`, clamped to 15 |
| Liquidity sweep | 10 | `10` if boolean pattern fires else `0` |
| Cross-pair confirmation | 10 | `10` if same-side move on correlated basket |
| Macro / news confirmation | 10 | `10` if high-impact event within ±30 min |
| Sentiment contradiction | 5 | `5` if retail crowd is opposite the move |
| COT extreme positioning | 5 | `5` if 3Y percentile > 90 or < 10 |

## Categories

| Total | Category |
|---:|---|
| 0–30 | `noise` |
| 31–50 | `watch` |
| 51–70 | `significant` |
| 71–85 | `probable_institutional` |
| 86–100 | `major_event` |

## Severity

| Score | Severity |
|---:|---|
| < 51 | LOW |
| 51–70 | MEDIUM |
| ≥ 71 | HIGH |

## Alert lifecycle

1. Flow score crosses threshold (default 31, configurable per user).
2. Cooldown check per symbol (default 15 s).
3. Build `AlertExplanation`: primary reason, contributing factors, data used, delayed sources, unknowns.
4. Persist to `alerts` + `alert_explanations`.
5. Broadcast on `/alerts` WebSocket namespace.
6. Dispatch to user-selected notification channels.

## Explainability contract

Every alert carries:

```ts
{
  primaryReason: string;          // human-readable, first line
  contributingFactors: string[];  // all numeric reasons with z/ratio
  dataUsed: string[];             // adapters that contributed
  delayedDataSources: string[];   // anything tagged DELAYED in this window
  unknowns: string[];             // honest limitations ("no OTC spot flow visible")
}
```

The UI surfaces this verbatim — no black-box scoring.
