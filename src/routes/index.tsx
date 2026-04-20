import { createFileRoute } from "@tanstack/react-router";
import { Terminal } from "@/components/stockpulse/Terminal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockPulse — Real-Time Stock Terminal" },
      { name: "description", content: "Bloomberg-style real-time stock tracker with watchlist, alerts, portfolio, and compare." },
      { property: "og:title", content: "StockPulse — Real-Time Stock Terminal" },
      { property: "og:description", content: "Bloomberg-style real-time stock tracker with watchlist, alerts, portfolio, and compare." },
    ],
  }),
  component: Index,
});

function Index() {
  return <Terminal />;
}
