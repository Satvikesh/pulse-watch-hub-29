import { useQuotes } from "@/lib/stockpulse/api";
import { ArrowDown, ArrowUp } from "lucide-react";

export function TickerTape({ tickers }: { tickers: string[] }) {
  const { data } = useQuotes(tickers);
  if (!data) return <div className="tape-wrap h-9" />;
  const items = tickers.map((t) => data[t]).filter(Boolean);
  if (!items.length) return <div className="tape-wrap h-9" />;

  const row = (
    <div className="tape-track mono text-xs">
      {[...items, ...items].map((q, i) => {
        const up = q.change >= 0;
        return (
          <span key={`${q.ticker}-${i}`} className="inline-flex items-center gap-2">
            <span className="font-semibold">{q.ticker}</span>
            <span className="dim">{q.currency === "INR" ? "₹" : "$"}{q.price.toFixed(2)}</span>
            <span className={up ? "bull" : "bear"}>
              {up ? <ArrowUp className="inline h-3 w-3" /> : <ArrowDown className="inline h-3 w-3" />}
              {Math.abs(q.change_pct).toFixed(2)}%
            </span>
            <span className="dim">·</span>
          </span>
        );
      })}
    </div>
  );

  return <div className="tape-wrap"><div className="whitespace-nowrap">{row}</div></div>;
}
