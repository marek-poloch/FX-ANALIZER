import numpy as np
import pandas as pd

from app.indicators import (
    atr,
    correlation_shock,
    liquidity_sweep,
    open_interest_interpretation,
    rolling_zscore,
    vwap,
)


def test_rolling_zscore_returns_zero_mean():
    s = pd.Series(np.random.default_rng(42).standard_normal(300))
    z = rolling_zscore(s, window=50).dropna()
    assert abs(z.mean()) < 0.5


def test_atr_positive():
    n = 100
    high = np.linspace(1, 2, n) + 0.01
    low = np.linspace(1, 2, n) - 0.01
    close = np.linspace(1, 2, n)
    out = atr(high, low, close, period=14)
    assert np.all(out >= 0)
    assert out.shape == (n,)


def test_vwap_matches_weighted_average():
    price = np.array([10.0, 20.0, 30.0])
    volume = np.array([1.0, 1.0, 1.0])
    out = vwap(price, volume)
    assert abs(out[-1] - 20.0) < 1e-9


def test_correlation_shock_handles_constant():
    a = np.ones(100)
    b = np.ones(100)
    _, shock = correlation_shock(a, b, window=20)
    assert shock == 0.0 or np.isnan(shock)


def test_liquidity_sweep_flags_pattern():
    n = 60
    rng = np.random.default_rng(1)
    high = 1 + rng.normal(0, 0.001, n)
    low = 1 + rng.normal(0, 0.001, n)
    close = 1 + rng.normal(0, 0.001, n)
    volume = np.full(n, 100.0)
    spread = np.full(n, 0.0001)

    # inject a sweep at index 40
    high[40] = high[:40].max() + 0.01
    close[40] = high[:40].max() - 0.005
    volume[40] = 400.0
    spread[40] = 0.0004

    flags = liquidity_sweep(high, low, close, volume, spread, lookback=20)
    assert flags[40]


def test_open_interest_regimes():
    assert open_interest_interpretation(1.0, 1.0)[0] == "new_longs"
    assert open_interest_interpretation(-1.0, 1.0)[0] == "new_shorts"
    assert open_interest_interpretation(1.0, -1.0)[0] == "short_covering"
    assert open_interest_interpretation(-1.0, -1.0)[0] == "long_liquidation"
    assert open_interest_interpretation(0.0, 1.0)[0] == "flat"
