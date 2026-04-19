# Indicators

## Streaming (in-process, TS)

Computed tick-by-tick inside `apps/api/src/quant`:

- **Rolling mean/stdev/z-score** — `RollingStats`. Used for volume, spread, price impulse.
- **EWMA baseline** — `EwmaBaseline` with α=0.1.
- **True range / ATR proxy** — `trueRange(high, low, prevClose)`.

Low-latency, minimal memory; resets on process restart. State can be checkpointed to Redis in a future iteration.

## Batch (Python, pandas/numpy)

In `services/quant-engine/app/indicators.py`:

| Indicator | Function | Purpose |
|---|---|---|
| Rolling z-score | `rolling_zscore` | Volume / spread / return outliers |
| EWMA baseline | `ewma_baseline` | Smoothed level, anomaly gate |
| ATR | `atr` | Volatility regime |
| VWAP | `vwap` | Fair-price anchor |
| Correlation shock | `correlation_shock` | Regime break (EUR/USD vs DXY etc.) |
| Liquidity sweep | `liquidity_sweep` | Stop-hunt / false-breakout flag |
| OI interpretation | `open_interest_interpretation` | Regime: new longs / new shorts / short covering / long liquidation |

Every Python indicator has pure-function signature (arrays in → arrays out) and is covered by `services/quant-engine/app/tests/test_indicators.py`.

## Composite flow score (0–100)

See [ALERT_LOGIC.md](ALERT_LOGIC.md) for weights, thresholds, and category mapping.
