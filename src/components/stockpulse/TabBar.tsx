import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, Bell, Briefcase, GitCompare } from "lucide-react";

const TABS = [
  { to: "/", label: "Chart", icon: BarChart3 },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/portfolio", label: "Portfolio", icon: Briefcase },
  { to: "/compare", label: "Compare", icon: GitCompare },
] as const;

export function TabBar() {
  const loc = useLocation();
  return (
    <div className="flex flex-wrap gap-1.5 px-1">
      {TABS.map((t) => {
        const active = loc.pathname === t.to;
        const Icon = t.icon;
        return (
          <Link key={t.to} to={t.to} className={`sp-btn ${active ? "active" : ""}`}>
            <Icon className="h-4 w-4" /> {t.label}
          </Link>
        );
      })}
    </div>
  );
}
