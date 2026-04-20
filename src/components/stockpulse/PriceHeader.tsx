import { ArrowDown, ArrowUp } from "lucide-react";
import type { Quote } from "@/lib/stockpulse/types";

function fmt(n: number, cur: string) {
  return `${cur === "INR" ? "₹" : "$"}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PriceHeader({ quote }: { quote: Quote }) {
  const up = quote.change >= 0;
  return (
    <div className={`price-header sp-panel p-5 ${up ? "up" : "down"}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mono text-xs uppercase tracking-[0.2em] dim">{quote.name ?? quote.ticker}</div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="mono text-3xl font-bold tracking-tight">{quote.ticker}</span>
            <span className={`mono text-xs uppercase ${up ? "bull" : "bear"}`}>
              {up ? "BULLISH" : "BEARISH"}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div
            key={quote.price}
            className={`ph-price mono text-5xl font-bold leading-none ${up ? "bull" : "bear"}`}
          >
            {fmt(quote.price, quote.currency)}
          </div>
          <div className={`mt-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 mono text-xs font-semibold ${up ? "bull" : "bear"}`}
            style={{
              borderColor: up ? "color-mix(in oklab, var(--bull) 50%, transparent)" : "color-mix(in oklab, var(--bear) 50%, transparent)",
              background: up ? "color-mix(in oklab, var(--bull) 12%, transparent)" : "color-mix(in oklab, var(--bear) 12%, transparent)",
            }}
          >
            {up ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
            {up ? "+" : ""}{quote.change.toFixed(2)} ({up ? "+" : ""}{quote.change_pct.toFixed(2)}%)
          </div>
        </div>
      </div>
    </div>
  );
}
