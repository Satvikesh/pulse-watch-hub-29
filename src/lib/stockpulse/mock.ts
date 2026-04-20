import type { Candle, Period, Quote } from "./types";

const SEEDS: Record<string, { base: number; currency: string; name: string }> = {
  AAPL:        { base: 232.5, currency: "USD", name: "Apple Inc." },
  NVDA:        { base: 198.4, currency: "USD", name: "NVIDIA Corp." },
  MSFT:        { base: 442.1, currency: "USD", name: "Microsoft Corp." },
  TSLA:        { base: 251.3, currency: "USD", name: "Tesla Inc." },
  GOOGL:       { base: 184.6, currency: "USD", name: "Alphabet Inc." },
  "TCS.NS":    { base: 2580,  currency: "INR", name: "Tata Consultancy" },
  "INFY.NS":   { base: 1314,  currency: "INR", name: "Infosys Ltd." },
  "WIPRO.NS":  { base: 545,   currency: "INR", name: "Wipro Ltd." },
  "HDFCBANK.NS":{ base: 1684, currency: "INR", name: "HDFC Bank" },
  "RELIANCE.NS":{ base: 1287, currency: "INR", name: "Reliance Industries" },
};

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function rng(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function mockQuote(ticker: string, tickSeed = 0): Quote {
  const seed = SEEDS[ticker] ?? { base: 100 + (hash(ticker) % 400), currency: "USD", name: ticker };
  const r = rng(hash(ticker) + Math.floor(Date.now() / 15000) + tickSeed);
  const driftPct = (r() - 0.5) * 0.04;
  const price = +(seed.base * (1 + driftPct)).toFixed(2);
  const prev_close = +(seed.base * (1 + (r() - 0.5) * 0.01)).toFixed(2);
  const open = +(prev_close * (1 + (r() - 0.5) * 0.01)).toFixed(2);
  const high = +(Math.max(open, price) * (1 + r() * 0.012)).toFixed(2);
  const low = +(Math.min(open, price) * (1 - r() * 0.012)).toFixed(2);
  const volume = Math.floor(1_000_000 + r() * 9_000_000);
  const change = +(price - prev_close).toFixed(2);
  const change_pct = +((change / prev_close) * 100).toFixed(2);
  return {
    ticker, price, open, high, low, prev_close, volume,
    change, change_pct, currency: seed.currency, name: seed.name,
  };
}

const PERIOD_POINTS: Record<Period, number> = {
  "1D": 78, "5D": 130, "1M": 22, "3M": 65, "6M": 130, "1Y": 252, "5Y": 260,
};

export function mockCandles(ticker: string, period: Period): Candle[] {
  const seed = SEEDS[ticker] ?? { base: 100 + (hash(ticker) % 400), currency: "USD", name: ticker };
  const n = PERIOD_POINTS[period];
  const r = rng(hash(ticker + period));
  let price = seed.base * (0.92 + r() * 0.04);
  const out: Candle[] = [];
  const now = Date.now();
  const stepMs =
    period === "1D" ? 5 * 60_000 :
    period === "5D" ? 30 * 60_000 :
    period === "1M" ? 24 * 3600_000 :
    period === "3M" ? 24 * 3600_000 :
    period === "6M" ? 24 * 3600_000 :
    period === "1Y" ? 24 * 3600_000 :
    7 * 24 * 3600_000;
  for (let i = n - 1; i >= 0; i--) {
    const drift = (r() - 0.49) * price * 0.018;
    const open = price;
    const close = +(price + drift).toFixed(2);
    const high = +(Math.max(open, close) * (1 + r() * 0.008)).toFixed(2);
    const low = +(Math.min(open, close) * (1 - r() * 0.008)).toFixed(2);
    const volume = Math.floor(500_000 + r() * 5_000_000);
    out.push({
      time: new Date(now - i * stepMs).toISOString(),
      open: +open.toFixed(2), high, low, close, volume,
    });
    price = close;
  }
  return out;
}
