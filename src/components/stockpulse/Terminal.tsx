import { useState } from "react";
import { useLocalStorage } from "@/lib/stockpulse/storage";
import { useCandles, useQuote } from "@/lib/stockpulse/api";
import { Sidebar } from "./Sidebar";
import { PriceHeader } from "./PriceHeader";
import { OHLCVStrip } from "./OHLCVStrip";
import { PriceChart } from "./PriceChart";
import { TickerTape } from "./TickerTape";
import { TabBar } from "./TabBar";
import type { Period } from "@/lib/stockpulse/types";
import { mockQuote } from "@/lib/stockpulse/mock";

const DEFAULT_WL = ["AAPL", "NVDA", "MSFT", "TCS.NS", "INFY.NS", "WIPRO.NS"];

export function Terminal({ children }: { children?: React.ReactNode }) {
  const [watchlist, setWatchlist] = useLocalStorage<string[]>("sp:watchlist", DEFAULT_WL);
  const [active, setActive] = useLocalStorage<string>("sp:active", "AAPL");
  const [period, setPeriod] = useState<Period>("1D");

  const { data: quote } = useQuote(active);
  const { data: candles } = useCandles(active, period);

  const q = quote ?? mockQuote(active);

  return (
    <div className="space-y-4">
      <TickerTape tickers={watchlist} />
      <div className="px-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <Sidebar
            watchlist={watchlist}
            active={active}
            onSelect={setActive}
            onAdd={(t) => !watchlist.includes(t) && setWatchlist((p) => [...p, t])}
            onRemove={(t) => {
              setWatchlist((p) => p.filter((x) => x !== t));
              if (active === t && watchlist.length > 1) {
                setActive(watchlist.find((x) => x !== t) ?? "AAPL");
              }
            }}
          />
          <main className="flex-1 space-y-4">
            <TabBar />
            {children ?? (
              <>
                <PriceHeader quote={q} />
                <OHLCVStrip q={q} />
                <PriceChart
                  candles={candles ?? []}
                  prevClose={q.prev_close}
                  currency={q.currency}
                  period={period}
                  onPeriodChange={setPeriod}
                />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
