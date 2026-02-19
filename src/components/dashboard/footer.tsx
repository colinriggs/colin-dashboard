"use client";

import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-card/30 mt-8">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground/60">
          <div className="flex items-center gap-1.5">
            <Bot className="h-3.5 w-3.5" />
            <span>Powered by Clawdbot</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Last updated: Feb 19, 2026 15:08 PST</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Static snapshot — live API coming soon</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
