# StockPulse Backend

FastAPI service wrapping `yfinance` for the React frontend.

## Run locally

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Then in your Lovable project, set the env var so the frontend talks to the backend:

```
VITE_STOCKPULSE_API=http://localhost:8000
```

(In the Lovable preview you'll need to deploy the backend to a public URL —
e.g. Render, Railway, Fly.io — and use that URL instead.)

## Endpoints

- `GET /api/quote?ticker=AAPL`
- `GET /api/quotes?tickers=AAPL,NVDA,TCS.NS`
- `GET /api/candles?ticker=AAPL&period=1D` — periods: `1D 5D 1M 3M 6M 1Y 5Y`
- `GET /health`

## Deploy (Render — 4 lines)

1. Push `backend/` to a Git repo
2. Create a new Web Service on Render, point at the repo, root = `backend`
3. Build: `pip install -r requirements.txt`  · Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Copy the URL into `VITE_STOCKPULSE_API` in your Lovable project
