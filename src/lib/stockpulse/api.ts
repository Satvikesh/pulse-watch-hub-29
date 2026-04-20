import { useQuery } from "@tanstack/react-query";
import type { Candle, Period, Quote } from "./types";
import { mockCandles, mockQuote } from "./mock";

const API_BASE = (import.meta.env.VITE_STOCKPULSE_API as string | undefined)?.replace(/\/$/, "");

export const isLiveBackend = Boolean(API_BASE);

async function fetchJson<T>(path: string): Promise<T> {
  if (!API_BASE) throw new Error("backend-not-configured");
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`http ${res.status}`);
  return (await res.json()) as T;
}

export function useQuote(ticker: string) {
  return useQuery({
    queryKey: ["quote", ticker],
    queryFn: async (): Promise<Quote> => {
      if (API_BASE) {
        try { return await fetchJson<Quote>(`/api/quote?ticker=${encodeURIComponent(ticker)}`); }
        catch { return mockQuote(ticker); }
      }
      return mockQuote(ticker);
    },
    refetchInterval: 15000,
    staleTime: 10000,
    enabled: !!ticker,
  });
}

export function useQuotes(tickers: string[]) {
  return useQuery({
    queryKey: ["quotes", tickers.join(",")],
    queryFn: async (): Promise<Record<string, Quote>> => {
      if (API_BASE && tickers.length) {
        try {
          return await fetchJson<Record<string, Quote>>(
            `/api/quotes?tickers=${encodeURIComponent(tickers.join(","))}`
          );
        } catch { /* fallthrough */ }
      }
      return Object.fromEntries(tickers.map((t) => [t, mockQuote(t)]));
    },
    refetchInterval: 15000,
    staleTime: 10000,
    enabled: tickers.length > 0,
  });
}

export function useCandles(ticker: string, period: Period) {
  return useQuery({
    queryKey: ["candles", ticker, period],
    queryFn: async (): Promise<Candle[]> => {
      if (API_BASE) {
        try { return await fetchJson<Candle[]>(`/api/candles?ticker=${encodeURIComponent(ticker)}&period=${period}`); }
        catch { return mockCandles(ticker, period); }
      }
      return mockCandles(ticker, period);
    },
    refetchInterval: period === "1D" ? 30000 : 60000,
    staleTime: 20000,
    enabled: !!ticker,
  });
}
