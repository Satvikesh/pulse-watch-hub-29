import { useEffect, useState } from "react";
import { Activity, AlertTriangle } from "lucide-react";
import { isLiveBackend } from "@/lib/stockpulse/api";

function timeIn(tz: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz,
  }).format(new Date());
}

function isMarketOpen(tz: string, openH: number, closeH: number): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit", minute: "2-digit", weekday: "short", hour12: false, timeZone: tz,
  }).formatToParts(new Date());
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0", 10);
  const day = parts.find((p) => p.type === "weekday")?.value ?? "";
  if (day === "Sat" || day === "Sun") return false;
  const t = hour + minute / 60;
  return t >= openH && t < closeH;
}

export function MarketStatusBar() {
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const nseOpen = isMarketOpen("Asia/Kolkata", 9.25, 15.5);
  const usOpen = isMarketOpen("America/New_York", 9.5, 16);

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 text-xs mono">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-[color:var(--neon)]" />
        <span className="font-semibold tracking-widest text-[color:var(--neon)]">STOCKPULSE</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`mkt-dot ${nseOpen ? "live bull" : "dim"}`} style={{ backgroundColor: nseOpen ? "var(--bull)" : "var(--text-dim)", color: nseOpen ? "var(--bull)" : "var(--text-dim)" }} />
        <span className="dim">NSE</span>
        <span>{timeIn("Asia/Kolkata")} IST</span>
        <span className={nseOpen ? "bull" : "dim"}>{nseOpen ? "OPEN" : "CLOSED"}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`mkt-dot ${usOpen ? "live bull" : "dim"}`} style={{ backgroundColor: usOpen ? "var(--bull)" : "var(--text-dim)", color: usOpen ? "var(--bull)" : "var(--text-dim)" }} />
        <span className="dim">NYSE</span>
        <span>{timeIn("America/New_York")} EST</span>
        <span className={usOpen ? "bull" : "dim"}>{usOpen ? "OPEN" : "CLOSED"}</span>
      </div>
      {!isLiveBackend && (
        <div className="ml-auto flex items-center gap-2 rounded-md border border-[color:var(--border)] bg-[color:var(--panel)] px-2 py-1 text-[10px] uppercase tracking-wider dim">
          <AlertTriangle className="h-3 w-3" /> mock data — set VITE_STOCKPULSE_API
        </div>
      )}
    </div>
  );
}
