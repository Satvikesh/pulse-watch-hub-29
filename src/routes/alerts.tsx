import { createFileRoute } from "@tanstack/react-router";
import { Terminal } from "@/components/stockpulse/Terminal";
import { AlertsPanel } from "@/components/stockpulse/AlertsPanel";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — StockPulse" },
      { name: "description", content: "Manage real-time price alerts for your watchlist." },
      { property: "og:title", content: "Alerts — StockPulse" },
      { property: "og:description", content: "Manage real-time price alerts." },
    ],
  }),
  component: () => (
    <Terminal>
      <AlertsPanel />
    </Terminal>
  ),
});
