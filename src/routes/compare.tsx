import { createFileRoute } from "@tanstack/react-router";
import { Terminal } from "@/components/stockpulse/Terminal";
import { CompareChart } from "@/components/stockpulse/CompareChart";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare — StockPulse" },
      { name: "description", content: "Compare normalized performance across multiple tickers." },
      { property: "og:title", content: "Compare — StockPulse" },
      { property: "og:description", content: "Compare normalized performance across tickers." },
    ],
  }),
  component: () => (
    <Terminal>
      <CompareChart />
    </Terminal>
  ),
});
