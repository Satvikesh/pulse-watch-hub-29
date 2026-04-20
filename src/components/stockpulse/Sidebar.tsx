import { useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import { useQuotes } from "@/lib/stockpulse/api";

export function Sidebar({
  watchlist, active, onSelect, onAdd, onRemove,
}: {
  watchlist: string[];
  active: string;
  onSelect: (t: string) => void;
  onAdd: (t: string) => void;
  onRemove: (t: string) => void;
}) {
  const [input, setInput] = useState("");
  const { data } = useQuotes(watchlist);

  return (
    <aside className="sp-panel w-full p-3 lg:w-72">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest dim">
        <Star className="h-3.5 w-3.5" /> Watchlist
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = input.trim().toUpperCase();
          if (v) { onAdd(v); setInput(""); }
        }}
        className="mb-3 flex gap-1.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add ticker (e.g. AAPL)"
          className="mono flex-1 rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-2 py-1.5 text-xs outline-none focus:border-[color:var(--neon)]"
        />
        <button className="sp-btn" type="submit" aria-label="add">
          <Plus className="h-4 w-4" />
        </button>
      </form>

      <div className="space-y-1">
        {watchlist.map((t) => {
          const q = data?.[t];
          const up = (q?.change ?? 0) >= 0;
          const isActive = active === t;
          return (
            <div
              key={t}
              className={`wl-card group cursor-pointer ${isActive ? "active" : ""}`}
              onClick={() => onSelect(t)}
            >
              <div className="flex items-center justify-between">
                <span className="mono text-sm font-semibold">{t}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(t); }}
                  className="opacity-0 transition group-hover:opacity-100 dim hover:text-[color:var(--bear)]"
                  aria-label="remove"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {q ? (
                <div className="mt-0.5 flex items-center justify-between mono text-xs">
                  <span>{q.currency === "INR" ? "₹" : "$"}{q.price.toFixed(2)}</span>
                  <span className={up ? "bull" : "bear"}>
                    {up ? "▲" : "▼"} {Math.abs(q.change_pct).toFixed(2)}%
                  </span>
                </div>
              ) : (
                <div className="mt-0.5 mono text-xs dim">—</div>
              )}
            </div>
          );
        })}
        {watchlist.length === 0 && (
          <div className="rounded-md border border-dashed border-[color:var(--border)] p-4 text-center text-xs dim">
            Add a ticker to start
          </div>
        )}
      </div>
    </aside>
  );
}
