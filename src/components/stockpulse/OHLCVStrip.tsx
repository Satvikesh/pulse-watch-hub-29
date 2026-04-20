import type { Quote } from "@/lib/stockpulse/types";

function fmt(n: number, cur: string) {
  return `${cur === "INR" ? "₹" : "$"}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtVol(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
  return String(n);
}

export function OHLCVStrip({ q }: { q: Quote }) {
  const cells = [
    { label: "OPEN", value: fmt(q.open, q.currency) },
    { label: "HIGH", value: fmt(q.high, q.currency), tone: "bull" },
    { label: "LOW", value: fmt(q.low, q.currency), tone: "bear" },
    { label: "PREV CLOSE", value: fmt(q.prev_close, q.currency) },
    { label: "VOLUME", value: fmtVol(q.volume) },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {cells.map((c, i) => (
        <div key={c.label} className="summary-card" style={{ animationDelay: `${0.04 * i}s` }}>
          <div className="mono text-[10px] uppercase tracking-widest dim">{c.label}</div>
          <div className={`mono mt-1 text-lg font-semibold ${c.tone === "bull" ? "bull" : c.tone === "bear" ? "bear" : ""}`}>
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}
