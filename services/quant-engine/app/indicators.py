"""Core indicators used by the alert engine.

Each function is pure — takes arrays, returns arrays — so unit tests are
trivial and the logic can be reused offline in replay / backtesting.
"""
from __future__ import annotations

from typing import Literal

import numpy as np
import pandas as pd


def rolling_zscore(series: pd.Series, window: int = 50) -> pd.Series:
    mean = series.rolling(window).mean()
    std = series.rolling(window).std(ddof=1)
    return (series - mean) / std.replace(0, np.nan)


def ewma_baseline(series: pd.Series, alpha: float = 0.1) -> pd.Series:
    return series.ewm(alpha=alpha, adjust=False).mean()


def atr(high: np.ndarray, low: np.ndarray, close: np.ndarray, period: int = 14) -> np.ndarray:
    prev_close = np.concatenate(([close[0]], close[:-1]))
    tr = np.maximum.reduce([
        high - low,
        np.abs(high - prev_close),
        np.abs(low - prev_close),
    ])
    tr_series = pd.Series(tr)
    return tr_series.ewm(alpha=1 / period, adjust=False).mean().to_numpy()


def vwap(price: np.ndarray, volume: np.ndarray) -> np.ndarray:
    cum_pv = np.cumsum(price * volume)
    cum_v = np.cumsum(volume)
    with np.errstate(divide="ignore", invalid="ignore"):
        out = np.where(cum_v > 0, cum_pv / cum_v, price)
    return out


def correlation_shock(a: np.ndarray, b: np.ndarray, window: int = 60) -> tuple[np.ndarray, float]:
    sa = pd.Series(a)
    sb = pd.Series(b)
    rolling = sa.rolling(window).corr(sb)
    # Shock score: absolute deviation of latest correlation from median
    if rolling.dropna().empty:
        return rolling.fillna(0).to_numpy(), 0.0
    median = float(rolling.median(skipna=True))
    latest = float(rolling.dropna().iloc[-1])
    shock = abs(latest - median)
    return rolling.fillna(0).to_numpy(), shock


def liquidity_sweep(
    high: np.ndarray,
    low: np.ndarray,
    close: np.ndarray,
    volume: np.ndarray,
    spread: np.ndarray,
    lookback: int = 20,
) -> np.ndarray:
    """Flag bars where a local extreme was pierced then quickly reversed on
    elevated volume and wider spread — heuristic stop-hunt proxy."""
    n = len(close)
    flags = np.zeros(n, dtype=bool)
    if n <= lookback:
        return flags
    rolling_high = pd.Series(high).rolling(lookback).max().to_numpy()
    rolling_low = pd.Series(low).rolling(lookback).min().to_numpy()
    vol_mean = pd.Series(volume).rolling(lookback).mean().to_numpy()
    spread_mean = pd.Series(spread).rolling(lookback).mean().to_numpy()

    for i in range(lookback, n):
        pierced_high = high[i] > rolling_high[i - 1] and close[i] < rolling_high[i - 1]
        pierced_low = low[i] < rolling_low[i - 1] and close[i] > rolling_low[i - 1]
        volume_spike = volume[i] > 1.8 * (vol_mean[i] or 1)
        spread_wide = spread[i] > 1.5 * (spread_mean[i] or 1)
        if (pierced_high or pierced_low) and volume_spike and spread_wide:
            flags[i] = True
    return flags


def open_interest_interpretation(
    price_change: float, oi_change: float
) -> tuple[Literal["new_longs", "new_shorts", "short_covering", "long_liquidation", "flat"], str]:
    if abs(price_change) < 1e-9 or abs(oi_change) < 1e-9:
        return "flat", "No meaningful price or OI change."
    if price_change > 0 and oi_change > 0:
        return "new_longs", "Price up + OI up → fresh long positioning."
    if price_change < 0 and oi_change > 0:
        return "new_shorts", "Price down + OI up → fresh short positioning."
    if price_change > 0 and oi_change < 0:
        return "short_covering", "Price up + OI down → short covering rally."
    return "long_liquidation", "Price down + OI down → long liquidation."
