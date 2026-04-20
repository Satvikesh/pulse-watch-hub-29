import { useEffect, useRef, useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/lib/stockpulse/storage";
import { useQuotes } from "@/lib/stockpulse/api";
import type { Alert } from "@/lib/stockpulse/types";

export function AlertsPanel() {
  const [alerts, setAlerts] = useLocalStorage<Alert[]>("sp:alerts", []);
  const [ticker, setTicker] = useState("");
  const [price, setPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");

  const tickers = Array.from(new Set(alerts.map((a) => a.ticker)));
  const { data: quotes } = useQuotes(tickers);
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!quotes) return;
    setAlerts((prev) =>
      prev.map((a) => {
        const q = quotes[a.ticker];
        if (!q || a.triggered) return a;
        const hit = a.direction === "above" ? q.price >= a.price : q.price <= a.price;
        if (hit && !firedRef.current.has(a.id)) {
          firedRef.current.add(a.id);
          toast.success(`${a.ticker} ${a.direction} ${a.price}`, {
            description: `Now at ${q.currency === "INR" ? "₹" : "$"}${q.price.toFixed(2)}`,
          });
          return { ...a, triggered: true };
        }
        return a;
      })
    );
  }, [quotes, setAlerts]);

  return (
    <div className="sp-panel p-4">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest dim">
        <Bell className="h-3.5 w-3.5" /> Price Alerts
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const t = ticker.trim().toUpperCase();
          const p = parseFloat(price);
          if (!t || !Number.isFinite(p)) return;
          setAlerts((prev) => [
            ...prev,
            { id: crypto.randomUUID(), ticker: t, direction, price: p, triggered: false, createdAt: Date.now() },
          ]);
          setTicker(""); setPrice("");
        }}
        className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        <input
          value={ticker} onChange={(e) => setTicker(e.target.value)}
          placeholder="TICKER"
          className="mono rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]"
        />
        <select
          value={direction} onChange={(e) => setDirection(e.target.value as "above" | "below")}
          className="mono rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]"
        >
          <option value="above">Above</option>
          <option value="below">Below</option>
        </select>
        <input
          value={price} onChange={(e) => setPrice(e.target.value)}
          placeholder="Price" inputMode="decimal"
          className="mono rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2 text-sm outline-none focus:border-[color:var(--neon)]"
        />
        <button className="sp-btn primary justify-center" type="submit">Add Alert</button>
      </form>

      {alerts.length === 0 ? (
        <div className="rounded-md border border-dashed border-[color:var(--border)] p-6 text-center text-sm dim">
          No alerts yet
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => {
            const q = quotes?.[a.ticker];
            return (
              <div key={a.id} className="flex items-center justify-between rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-3 py-2">
                <div className="flex items-center gap-3 mono text-sm">
                  <span className="font-semibold">{a.ticker}</span>
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${a.direction === "above" ? "bull" : "bear"}`}
                    style={{
                      borderWidth: 1, borderStyle: "solid",
                      borderColor: a.direction === "above" ? "color-mix(in oklab, var(--bull) 50%, transparent)" : "color-mix(in oklab, var(--bear) 50%, transparent)",
                      background: a.direction === "above" ? "color-mix(in oklab, var(--bull) 12%, transparent)" : "color-mix(in oklab, var(--bear) 12%, transparent)",
                    }}>
                    {a.direction.toUpperCase()} {a.price}
                  </span>
                  {q && <span className="dim">now {q.currency === "INR" ? "₹" : "$"}{q.price.toFixed(2)}</span>}
                  {a.triggered && <span className="bull text-xs">✓ TRIGGERED</span>}
                </div>
                <button
                  className="dim hover:text-[color:var(--bear)]"
                  onClick={() => setAlerts((p) => p.filter((x) => x.id !== a.id))}
                  aria-label="delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
