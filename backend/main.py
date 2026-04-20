"""StockPulse backend — FastAPI wrapper around yfinance.

Run:  uvicorn main:app --reload --port 8000
Then in the React app set:  VITE_STOCKPULSE_API=http://localhost:8000
"""
from __future__ import annotations

import time
from typing import Dict, List, Optional

import pandas as pd
import yfinance as yf
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="StockPulse API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PERIOD_MAP = {
    "1D": ("1d", "5m"),
    "5D": ("5d", "30m"),
    "1M": ("1mo", "1d"),
    "3M": ("3mo", "1d"),
    "6M": ("6mo", "1d"),
    "1Y": ("1y", "1d"),
    "5Y": ("5y", "1wk"),
}


def _retry(fn, attempts=3, delay=0.4):
    last = None
    for i in range(attempts):
        try:
            return fn()
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(delay * (i + 1))
    raise last  # type: ignore[misc]


def fetch_quote(ticker: str) -> dict:
    def _do():
        t = yf.Ticker(ticker)
        info = t.fast_info
        hist = t.history(period="2d", interval="1d")
        if hist.empty:
            raise ValueError(f"no data for {ticker}")
        last = hist.iloc[-1]
        prev_close = float(hist.iloc[-2]["Close"]) if len(hist) > 1 else float(last["Open"])
        price = float(getattr(info, "last_price", None) or last["Close"])
        change = price - prev_close
        change_pct = (change / prev_close) * 100 if prev_close else 0.0
        currency = getattr(info, "currency", None) or "USD"
        return {
            "ticker": ticker,
            "price": round(price, 2),
            "open": round(float(last["Open"]), 2),
            "high": round(float(last["High"]), 2),
            "low": round(float(last["Low"]), 2),
            "prev_close": round(prev_close, 2),
            "volume": int(last["Volume"]),
            "change": round(change, 2),
            "change_pct": round(change_pct, 2),
            "currency": currency,
        }
    return _retry(_do)


def fetch_candles(ticker: str, period: str) -> List[dict]:
    if period not in PERIOD_MAP:
        raise HTTPException(400, f"invalid period: {period}")
    yperiod, interval = PERIOD_MAP[period]

    def _do():
        df = yf.Ticker(ticker).history(period=yperiod, interval=interval)
        if df.empty:
            raise ValueError(f"no candles for {ticker}")
        df = df.reset_index()
        time_col = "Datetime" if "Datetime" in df.columns else "Date"
        df[time_col] = pd.to_datetime(df[time_col]).dt.tz_localize(None)
        return [
            {
                "time": r[time_col].isoformat(),
                "open": round(float(r["Open"]), 2),
                "high": round(float(r["High"]), 2),
                "low": round(float(r["Low"]), 2),
                "close": round(float(r["Close"]), 2),
                "volume": int(r["Volume"]),
            }
            for _, r in df.iterrows()
        ]
    return _retry(_do)


@app.get("/api/quote")
def quote(ticker: str = Query(..., min_length=1, max_length=20)):
    try:
        return fetch_quote(ticker.upper())
    except Exception as e:  # noqa: BLE001
        raise HTTPException(502, str(e))


@app.get("/api/quotes")
def quotes(tickers: str = Query(..., description="Comma-separated tickers")):
    out: Dict[str, Optional[dict]] = {}
    for t in tickers.split(","):
        t = t.strip().upper()
        if not t:
            continue
        try:
            out[t] = fetch_quote(t)
        except Exception:  # noqa: BLE001
            out[t] = None
    return out


@app.get("/api/candles")
def candles(ticker: str = Query(..., min_length=1, max_length=20), period: str = "1D"):
    try:
        return fetch_candles(ticker.upper(), period)
    except HTTPException:
        raise
    except Exception as e:  # noqa: BLE001
        raise HTTPException(502, str(e))


@app.get("/health")
def health():
    return {"ok": True}
