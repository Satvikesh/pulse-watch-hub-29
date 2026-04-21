import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { Candle, Period } from "@/lib/stockpulse/types";

// Custom candlestick shape: wick + body colored by direction
const Candlestick = (props: any) => {
  const { x = 0, width = 0, payload, yAxis } = props;
  if (!payload || !yAxis?.scale) return null;
  const { open, close, high, low } = payload;
  const isBull = close >= open;
  const color = isBull ? "hsl(var(--bull-hsl, 158 64% 52%))" : "hsl(var(--bear-hsl, 0 84% 60%))";
  const fill = isBull ? "var(--bull)" : "var(--bear)";
  const yHigh = yAxis.scale(high);
  const yLow = yAxis.scale(low);
  const yOpen = yAxis.scale(open);
  const yClose = yAxis.scale(close);
  const bodyTop = Math.min(yOpen, yClose);
  const bodyH = Math.max(1, Math.abs(yClose - yOpen));
  const cx = x + width / 2;
  const bodyW = Math.max(2, width * 0.7);
  return (
    <g>
      <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={fill} strokeWidth={1} />
      <rect x={cx - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} fill={fill} stroke={fill} />
    </g>
  );
};

const PERIODS: Period[] = ["1D", "5D", "1M", "3M", "6M", "1Y", "5Y"];
type Style = "line" | "area" | "candle" | "volume";

function ma(data: number[], n: number) {
  const out: (number | null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) out.push(null);
    else {
      let s = 0; for (let j = i - n + 1; j <= i; j++) s += data[j];
      out.push(+(s / n).toFixed(2));
    }
  }
  return out;
}

function fmtTime(iso: string, p: Period) {
  const d = new Date(iso);
  if (p === "1D" || p === "5D")
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function PriceChart({
  candles, prevClose, currency, period, onPeriodChange,
}: {
  candles: Candle[];
  prevClose?: number;
  currency: string;
  period: Period;
  onPeriodChange: (p: Period) => void;
}) {
  const [style, setStyle] = useState<Style>("area");

  const data = useMemo(() => {
    const closes = candles.map((c) => c.close);
    const ma20 = ma(closes, 20);
    const ma50 = ma(closes, 50);
    return candles.map((c, i) => ({
      ...c,
      label: fmtTime(c.time, period),
      ma20: ma20[i],
      ma50: ma50[i],
      // for fake "candle" rendering: low->high range and a body
      range: [c.low, c.high],
      body: [Math.min(c.open, c.close), Math.max(c.open, c.close)],
      bull: c.close >= c.open,
    }));
  }, [candles, period]);

  const sym = currency === "INR" ? "₹" : "$";
  const last = data.at(-1);
  const isUp = last && prevClose != null ? last.close >= prevClose : true;
  const stroke = isUp ? "var(--bull)" : "var(--bear)";

  return (
    <div className="chart-wrap">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`sp-btn ${period === p ? "active" : ""}`}
              style={{ padding: ".3rem .65rem", fontSize: ".7rem" }}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {(["line", "area", "candle", "volume"] as Style[]).map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`sp-btn ${style === s ? "active" : ""}`}
              style={{ padding: ".3rem .65rem", fontSize: ".7rem" }}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[380px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {style === "volume" ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="label" stroke="var(--text-dim)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--text-dim)" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "var(--text-dim)" }}
              />
              <Bar dataKey="volume" fill="var(--neon)" opacity={0.7} />
            </BarChart>
          ) : style === "candle" ? (
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="label" stroke="var(--text-dim)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--text-dim)" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "var(--text-dim)" }}
                formatter={(v: unknown, name: string) => name === "range" || name === "body" ? null : `${sym}${Number(v).toFixed(2)}`}
              />
              {prevClose != null && (
                <ReferenceLine y={prevClose} stroke="var(--text-dim)" strokeDasharray="4 4" />
              )}
              {/* wick */}
              <Bar dataKey="range" fill="var(--text-dim)" barSize={1} />
              {/* body — split by bull/bear via two stacked sets isn't trivial; use line for clarity */}
              <Line type="monotone" dataKey="close" stroke={stroke} strokeWidth={2} dot={false} />
            </ComposedChart>
          ) : (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sp-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.55} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="label" stroke="var(--text-dim)" tick={{ fontSize: 10 }} />
              <YAxis stroke="var(--text-dim)" tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
              <Tooltip
                contentStyle={{ background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "var(--text-dim)" }}
                formatter={(v: unknown) => `${sym}${Number(v).toFixed(2)}`}
              />
              {prevClose != null && (
                <ReferenceLine y={prevClose} stroke="var(--text-dim)" strokeDasharray="4 4" label={{ value: "prev", fill: "var(--text-dim)", fontSize: 10, position: "right" }} />
              )}
              {style === "area" ? (
                <Area type="monotone" dataKey="close" stroke={stroke} strokeWidth={2} fill="url(#sp-area)" />
              ) : (
                <Line type="monotone" dataKey="close" stroke={stroke} strokeWidth={2} dot={false} />
              )}
              <Line type="monotone" dataKey="ma20" stroke="var(--neon)" strokeWidth={1} dot={false} strokeDasharray="4 3" />
              <Line type="monotone" dataKey="ma50" stroke="#a78bfa" strokeWidth={1} dot={false} strokeDasharray="4 3" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 mono text-[10px] uppercase dim">
        <span><span className="inline-block h-2 w-3" style={{ background: stroke }} /> price</span>
        <span><span className="inline-block h-2 w-3" style={{ background: "var(--neon)" }} /> MA20</span>
        <span><span className="inline-block h-2 w-3" style={{ background: "#a78bfa" }} /> MA50</span>
        <span className="ml-auto">auto-refresh · 30s</span>
      </div>
    </div>
  );
}
