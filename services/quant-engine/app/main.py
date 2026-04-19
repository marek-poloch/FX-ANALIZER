"""FastAPI service exposing heavier quant computations.

Endpoints:
  GET  /health
  POST /compute/zscore
  POST /compute/atr
  POST /compute/vwap
  POST /compute/correlation
  POST /compute/liquidity-sweep
  POST /compute/open-interest
"""
from __future__ import annotations

import os
from typing import Literal

import numpy as np
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field

from .indicators import (
    atr,
    correlation_shock,
    liquidity_sweep,
    open_interest_interpretation,
    rolling_zscore,
    vwap,
)

app = FastAPI(title="FX Whale Radar — Quant Engine", version="0.1.0")


@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "fxradar-quant-engine",
        "data_mode": os.getenv("DATA_MODE", "demo"),
    }


# ------------------------------- models -------------------------------------


class ZScoreReq(BaseModel):
    values: list[float] = Field(..., min_length=2)
    window: int = 50


class ZScoreRes(BaseModel):
    z_scores: list[float]
    percentile_rank: list[float]


class AtrReq(BaseModel):
    high: list[float]
    low: list[float]
    close: list[float]
    period: int = 14


class VwapReq(BaseModel):
    price: list[float]
    volume: list[float]


class CorrReq(BaseModel):
    series_a: list[float]
    series_b: list[float]
    window: int = 60


class LiquiditySweepReq(BaseModel):
    high: list[float]
    low: list[float]
    close: list[float]
    volume: list[float]
    spread: list[float]
    lookback: int = 20


class OiReq(BaseModel):
    price_change: float
    oi_change: float


class OiRes(BaseModel):
    regime: Literal["new_longs", "new_shorts", "short_covering", "long_liquidation", "flat"]
    description: str


# ------------------------------- endpoints ----------------------------------


@app.post("/compute/zscore", response_model=ZScoreRes)
def compute_zscore(req: ZScoreReq) -> ZScoreRes:
    s = pd.Series(req.values)
    z = rolling_zscore(s, window=req.window)
    rank = s.rolling(req.window).rank(pct=True)
    return ZScoreRes(
        z_scores=z.fillna(0).tolist(),
        percentile_rank=rank.fillna(0.5).tolist(),
    )


@app.post("/compute/atr")
def compute_atr(req: AtrReq) -> dict:
    result = atr(
        high=np.asarray(req.high),
        low=np.asarray(req.low),
        close=np.asarray(req.close),
        period=req.period,
    )
    return {"atr": result.tolist()}


@app.post("/compute/vwap")
def compute_vwap(req: VwapReq) -> dict:
    result = vwap(np.asarray(req.price), np.asarray(req.volume))
    return {"vwap": result.tolist()}


@app.post("/compute/correlation")
def compute_correlation(req: CorrReq) -> dict:
    rolling_corr, shock_score = correlation_shock(
        np.asarray(req.series_a), np.asarray(req.series_b), window=req.window
    )
    return {"rolling_corr": rolling_corr.tolist(), "shock_score": shock_score}


@app.post("/compute/liquidity-sweep")
def compute_liquidity_sweep(req: LiquiditySweepReq) -> dict:
    flags = liquidity_sweep(
        high=np.asarray(req.high),
        low=np.asarray(req.low),
        close=np.asarray(req.close),
        volume=np.asarray(req.volume),
        spread=np.asarray(req.spread),
        lookback=req.lookback,
    )
    return {"sweep_flags": flags.astype(int).tolist()}


@app.post("/compute/open-interest", response_model=OiRes)
def compute_oi(req: OiReq) -> OiRes:
    regime, desc = open_interest_interpretation(req.price_change, req.oi_change)
    return OiRes(regime=regime, description=desc)
