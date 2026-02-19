"use client";

import { Timer, Layers, Plug, Activity } from "lucide-react";
import { cronJobs, sessions, connectedServices } from "@/lib/data";

const stats = [
  {
    icon: Timer,
    label: "Cron Jobs",
    value: `${cronJobs.filter((j) => j.enabled).length} active`,
    total: `of ${cronJobs.length}`,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Layers,
    label: "Sessions",
    value: `${sessions.filter((s) => s.status === "active").length} running`,
    total: `${sessions.length} total`,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Plug,
    label: "Services",
    value: `${connectedServices.filter((s) => s.status === "connected").length} connected`,
    total: `${connectedServices.filter((s) => s.status === "warning").length} warning`,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Activity,
    label: "Tokens Today",
    value: "~73K",
    total: "input + output",
    color: "text-[var(--color-lobster-light)]",
    bg: "bg-[var(--color-lobster-glow)]",
  },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border/30 hover:border-border/60 transition-colors"
        >
          <div className={`p-2.5 rounded-lg ${stat.bg}`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-sm font-semibold">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground/50">{stat.total}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
