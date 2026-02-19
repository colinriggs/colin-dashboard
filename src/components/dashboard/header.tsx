"use client";

import { Activity, Cpu } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-4xl" role="img" aria-label="lobster">
                🦞
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-card animate-pulse-glow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Colin Control Center
              </h1>
              <p className="text-sm text-muted-foreground">
                360° operational overview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Cpu className="h-4 w-4" />
              <span>claude-opus-4-6</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1.5">
              <Activity className="h-3.5 w-3.5 text-green-500 animate-pulse-glow" />
              <span className="text-xs font-medium text-green-400">
                Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
