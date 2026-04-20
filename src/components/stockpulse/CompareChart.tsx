import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import { useQueries } from "@tanstack/react-query";
import type { Candle, Period } from "@/lib/stockpulse/types";
import { mockCandles } from "@/lib/stockpulse/mock";
import { Plus, X } from "lucide-react";
import { useLocalStorage } from "@/lib/stockpulse/storage";

const COLORS = ["var(--neon)", "var(--bull)", "var(--bear)", "#a78bfa", "#f59e0b", "#ec4899"];
const PERIODS: Period[] = ["1M", "3M", "6M", "1Y", "5Y"];

const API_BASE = (import.meta.env.VITE_STOCKPULSE_API as string | undefined)?.replace(/\/$/, "");

export function CompareChart() {
  const [tickers, setTickers] = useLocalStorage<string[]>("sp:compare", ["AAPL", "NVDA", "MSFT"]);
  const [period, setPeriod] = useState<Period>("3M");
  const [input, setInput] = useState("");

  const queries = useQueries({
    queries: tickers.map((t) => ({
      queryKey: ["candles", t, period],
      queryFn: async (): Promise<Candle[]> => {
        if (API_BASE) {
          try {
            const r = await fetch(`${API_BASE}/api/candles?ticker=${t}&period=${period}`);
            if (r.ok) return r.json();
          } catch { /* fall through */ }
        }
        return mockCandles(t, period);
      },
      staleTime: 30000,
      refetchInterval: 60000,
    })),
  });

  const data = useMemo(() => {
    const series = queries.map((q, i) => ({ ticker: tickers[i], candles: q.data ?? [] }));
    if (!series.length || series.some((s) => s.candles.length === 0)) return [];
    const len = Math.min(...series.map((s) => s.candles.length));
    const out: Record<string, number | string>[] = [];
    for (let i = 0; i < len; i++) {
      const point: Record<string, number | string> = {
        label: new Date(series[0].candles[i].time).toLocaleDateString([], { month: "short", day: "numeric" }),
      };
      series.forEach((s) => {
        const base = s.candles[0].close;
        point[s.ticker] = +(((s.candles[i].close - base) / base) * 100).toFixed(2);
      });
      out.push(point);
    }
    return out;
  }, [queries, tickers]);

  return (
    <div className="space-y-3">
      <div className="sp-panel p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {tickers.map((t, i) => (
              <span key={t} className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-2 py-1 mono text-xs">
                <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {t}
                <button onClick={() => setTickers((p) => p.filter((x) => x !== t))} className="dim hover:text-[color:var(--bear)]">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <form
              onSubmit={(e) => { e.preventDefault(); const v = input.trim().toUpperCase(); if (v && !tickers.includes(v) && tickers.length < 6) { setTickers((p) => [...p, v]); setInput(""); } }}
              className="flex gap-1"
            >
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add"
                className="mono w-20 rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-2 py-1 text-xs outline-none focus:border-[color:var(--neon)]" />
              <button className="sp-btn" type="submit" style={{ padding: ".25rem .5rem" }}><Plus className="h-3.5 w-3.5" /></button>
            </form>
          </div>
          <div className="flex gap-1">
            {PERIODS.map((p) => (
              <button key={p} onClick={() => setPeriod(p)} className={`sp-btn ${period === p ? "active" : ""}`} style={{ padding: ".3rem .65rem", fontSize: ".7rem" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="chart-wrap">
        <div className="mb-2 mono text-xs dim">Normalized % from period start</div>
        <div className="h-[440px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="label" stroke="var(--text-dim)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--text-dim)" tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "var(--text-dim)" }}
                formatter={(v: unknown, name) => [`${Number(v).toFixed(2)}%`, name]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {tickers.map((t, i) => (
                <Line key={t} type="monotone" dataKey={t} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
