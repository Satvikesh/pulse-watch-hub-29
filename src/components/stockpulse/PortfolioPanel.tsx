import { useState } from "react";
import { Briefcase, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/lib/stockpulse/storage";
import { useQuotes } from "@/lib/stockpulse/api";
import type { Holding } from "@/lib/stockpulse/types";

function fmt(n: number, cur = "USD") {
  return `${cur === "INR" ? "₹" : "$"}${n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

export function PortfolioPanel() {
  const [holdings, setHoldings] = useLocalStorage<Holding[]>("sp:holdings", []);
  const [ticker, setTicker] = useState("");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");

  const tickers = Array.from(new Set(holdings.map((h) => h.ticker)));
  const { data: quotes } = useQuotes(tickers);

  let totalValue = 0, totalCost = 0;
  const rows = holdings.map((h) => {
    const q = quotes?.[h.ticker];
    const value = q ? q.price * h.qty : 0;
    const costTotal = h.avgCost * h.qty;
    const pl = value - costTotal;
    const plPct = costTotal ? (pl / costTotal) * 100 : 0;
    totalValue += value;
    totalCost += costTotal;
    return { h, q, value, costTotal, pl, plPct };
  });
  const totalPl = totalValue - totalCost;
  const totalPlPct = totalCost ? (totalPl / totalCost) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="summary-card"><div className="mono text-[10px] uppercase dim">Holdings</div><div className="mono mt-1 text-xl font-semibold">{holdings.length}</div></div>
        <div className="summary-card" style={{ animationDelay: ".05s" }}><div className="mono text-[10px] uppercase dim">Cost Basis</div><div className="mono mt-1 text-xl font-semibold">{fmt(totalCost)}</div></div>
        <div className="summary-card" style={{ animationDelay: ".1s" }}><div className="mono text-[10px] uppercase dim">Market Value</div><div className="mono mt-1 text-xl font-semibold">{fmt(totalValue)}</div></div>
        <div className="summary-card" style={{ animationDelay: ".15s" }}>
          <div className="mono text-[10px] uppercase dim">Total P/L</div>
          <div className={`mono mt-1 text-xl font-semibold ${totalPl >= 0 ? "bull" : "bear"}`}>
            {totalPl >= 0 ? "+" : ""}{fmt(totalPl)} ({totalPlPct.toFixed(2)}%)
          </div>
        </div>
      </div>

      <div className="sp-panel p-4">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest dim">
          <Briefcase className="h-3.5 w-3.5" /> Holdings
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const t = ticker.trim().toUpperCase();
            const q = parseFloat(qty); const c = parseFloat(cost);
            if (!t || !Number.isFinite(q) || !Number.isFinite(c)) return;
            setHoldings((p) => [...p, { id: crypto.randomUUID(), ticker: t, qty: q, avgCost: c }]);
            setTicker(""); setQty(""); setCost("");
          }}
          className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
        >
          <input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="TICKER"
            className="mono rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]" />
          <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Qty" inputMode="decimal"
            className="mono rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]" />
          <input value={cost} onChange={(e) => setCost(e.target.value)} placeholder="Avg Cost" inputMode="decimal"
            className="mono rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]" />
          <button className="sp-btn primary justify-center" type="submit">Add</button>
        </form>

        {rows.length === 0 ? (
          <div className="rounded-md border border-dashed border-[color:var(--border)] p-6 text-center text-sm dim">
            No holdings yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full mono text-sm">
              <thead className="text-left text-[10px] uppercase tracking-widest dim">
                <tr><th className="py-2">Ticker</th><th>Qty</th><th>Avg Cost</th><th>Price</th><th>Value</th><th>P/L</th><th></th></tr>
              </thead>
              <tbody>
                {rows.map(({ h, q, value, pl, plPct }) => (
                  <tr key={h.id} className="border-t border-[color:var(--border)]">
                    <td className="py-2 font-semibold">{h.ticker}</td>
                    <td>{h.qty}</td>
                    <td>{fmt(h.avgCost, q?.currency)}</td>
                    <td>{q ? fmt(q.price, q.currency) : "—"}</td>
                    <td>{fmt(value, q?.currency)}</td>
                    <td className={pl >= 0 ? "bull" : "bear"}>
                      {pl >= 0 ? "+" : ""}{fmt(pl, q?.currency)} ({plPct.toFixed(2)}%)
                    </td>
                    <td className="text-right">
                      <button onClick={() => setHoldings((p) => p.filter((x) => x.id !== h.id))}
                        className="dim hover:text-[color:var(--bear)]" aria-label="remove">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
