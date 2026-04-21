import { useId, useMemo } from "react";
import type { Candle } from "@/lib/stockpulse/types";

type CandlestickSvgChartProps = {
  candles: Candle[];
  prevClose?: number;
  currency: string;
};

function formatPrice(value: number, currency: string) {
  const symbol = currency === "INR" ? "₹" : "$";
  return `${symbol}${value.toFixed(2)}`;
}

export function CandlestickSvgChart({ candles, prevClose, currency }: CandlestickSvgChartProps) {
  const gradientId = useId().replace(/:/g, "");

  const chart = useMemo(() => {
    const width = 1000;
    const height = 380;
    const margin = { top: 18, right: 18, bottom: 28, left: 52 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (!candles.length) {
      return {
        width,
        height,
        margin,
        innerWidth,
        innerHeight,
        yTicks: [],
        xTicks: [],
        candles: [],
        yScale: () => margin.top + innerHeight / 2,
      };
    }

    const lows = candles.map((c) => c.low);
    const highs = candles.map((c) => c.high);
    const rawMin = Math.min(...lows, ...(prevClose != null ? [prevClose] : []));
    const rawMax = Math.max(...highs, ...(prevClose != null ? [prevClose] : []));
    const spread = Math.max(rawMax - rawMin, rawMax * 0.01, 1);
    const min = rawMin - spread * 0.08;
    const max = rawMax + spread * 0.08;

    const yScale = (value: number) => margin.top + ((max - value) / (max - min || 1)) * innerHeight;
    const xStep = innerWidth / candles.length;
    const candleWidth = Math.max(4, Math.min(14, xStep * 0.62));

    const plottedCandles = candles.map((candle, index) => {
      const x = margin.left + xStep * index + xStep / 2;
      const yOpen = yScale(candle.open);
      const yClose = yScale(candle.close);
      const bodyTop = Math.min(yOpen, yClose);
      const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

      return {
        ...candle,
        x,
        wickTop: yScale(candle.high),
        wickBottom: yScale(candle.low),
        bodyTop,
        bodyHeight,
        bodyY: candle.close >= candle.open && bodyHeight === 2 ? bodyTop - 1 : bodyTop,
        candleWidth,
        isBull: candle.close >= candle.open,
      };
    });

    const yTicks = Array.from({ length: 5 }, (_, index) => {
      const value = min + ((max - min) * index) / 4;
      return {
        value,
        y: yScale(value),
      };
    }).reverse();

    const xTickCount = Math.min(7, candles.length);
    const xTicks = Array.from({ length: xTickCount }, (_, index) => {
      const candleIndex = Math.min(
        candles.length - 1,
        Math.round((index * (candles.length - 1)) / Math.max(1, xTickCount - 1)),
      );
      const candle = candles[candleIndex];
      const date = new Date(candle.time);
      const label = candles.length > 40
        ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
        : date.toLocaleDateString([], { month: "short", day: "numeric" });

      return {
        x: margin.left + xStep * candleIndex + xStep / 2,
        label,
      };
    });

    return { width, height, margin, innerWidth, innerHeight, yTicks, xTicks, candles: plottedCandles, yScale };
  }, [candles, prevClose]);

  if (!candles.length) {
    return <div className="flex h-full items-center justify-center text-sm dim">No chart data</div>;
  }

  return (
    <div className="h-full w-full">
      <svg viewBox={`0 0 ${chart.width} ${chart.height}`} className="h-full w-full" role="img" aria-label="Candlestick price chart">
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="color-mix(in oklab, var(--neon) 18%, transparent)" />
            <stop offset="100%" stopColor="color-mix(in oklab, var(--bull) 12%, transparent)" />
          </linearGradient>
        </defs>

        <rect
          x={chart.margin.left}
          y={chart.margin.top}
          width={chart.innerWidth}
          height={chart.innerHeight}
          fill={`url(#${gradientId})`}
          opacity="0.18"
          rx="10"
        />

        {chart.yTicks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={chart.margin.left}
              x2={chart.margin.left + chart.innerWidth}
              y1={tick.y}
              y2={tick.y}
              stroke="var(--border)"
              strokeDasharray="4 5"
              opacity="0.45"
            />
            <text x={chart.margin.left - 8} y={tick.y + 4} textAnchor="end" fontSize="11" fill="var(--text-dim)">
              {formatPrice(tick.value, currency)}
            </text>
          </g>
        ))}

        {chart.xTicks.map((tick) => (
          <g key={`${tick.x}-${tick.label}`}>
            <line
              x1={tick.x}
              x2={tick.x}
              y1={chart.margin.top}
              y2={chart.margin.top + chart.innerHeight}
              stroke="var(--border)"
              strokeDasharray="3 6"
              opacity="0.25"
            />
            <text x={tick.x} y={chart.height - 8} textAnchor="middle" fontSize="11" fill="var(--text-dim)">
              {tick.label}
            </text>
          </g>
        ))}

        {prevClose != null && (
          <g>
            <line
              x1={chart.margin.left}
              x2={chart.margin.left + chart.innerWidth}
              y1={chart.yScale(prevClose)}
              y2={chart.yScale(prevClose)}
              stroke="var(--text-dim)"
              strokeDasharray="6 4"
              opacity="0.8"
            />
            <text
              x={chart.margin.left + chart.innerWidth - 4}
              y={chart.yScale(prevClose) - 6}
              textAnchor="end"
              fontSize="11"
              fill="var(--text-dim)"
            >
              Prev close
            </text>
          </g>
        )}

        {chart.candles.map((candle) => (
          <g key={candle.time}>
            <line
              x1={candle.x}
              x2={candle.x}
              y1={candle.wickTop}
              y2={candle.wickBottom}
              stroke={candle.isBull ? "var(--bull)" : "var(--bear)"}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x={candle.x - candle.candleWidth / 2}
              y={candle.bodyY}
              width={candle.candleWidth}
              height={candle.bodyHeight}
              rx="1"
              fill={candle.isBull ? "var(--bull)" : "var(--bear)"}
              stroke={candle.isBull ? "var(--bull)" : "var(--bear)"}
              opacity="0.95"
            >
              <title>
                {`${new Date(candle.time).toLocaleString()}\nOpen: ${formatPrice(candle.open, currency)}\nHigh: ${formatPrice(candle.high, currency)}\nLow: ${formatPrice(candle.low, currency)}\nClose: ${formatPrice(candle.close, currency)}`}
              </title>
            </rect>
          </g>
        ))}
      </svg>
    </div>
  );
}