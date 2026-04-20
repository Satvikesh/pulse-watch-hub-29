import { createFileRoute } from "@tanstack/react-router";
import { Terminal } from "@/components/stockpulse/Terminal";
import { PortfolioPanel } from "@/components/stockpulse/PortfolioPanel";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — StockPulse" },
      { name: "description", content: "Track holdings and live P/L across your portfolio." },
      { property: "og:title", content: "Portfolio — StockPulse" },
      { property: "og:description", content: "Track holdings and live P/L." },
    ],
  }),
  component: () => (
    <Terminal>
      <PortfolioPanel />
    </Terminal>
  ),
});
