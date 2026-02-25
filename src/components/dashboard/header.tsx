"use client";

import { useGateway } from "@/hooks/use-gateway";
import { Activity, Cpu, Radio, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function Header() {
  const { data, error } = useGateway<Record<string, unknown>>({
    tool: "session_status",
    pollInterval: 30_000,
  });

  const [uptime, setUptime] = useState("—");
  const connected = !error;

  // Simple uptime counter
  const [startTime] = useState(() => new Date());
  useEffect(() => {
    const tick = () => {
      const diff = Date.now() - startTime.getTime();
      const mins = Math.floor(diff / 60000);
      const hrs = Math.floor(mins / 60);
      if (hrs > 0) {
        setUptime(`${hrs}h ${mins % 60}m`);
      } else {
        setUptime(`${mins}m`);
      }
    };
    tick();
    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, [startTime]);

  const model = (data as Record<string, unknown>)?.model as string || "claude-opus-4-6";

  return (
    <header className="border-b border-emerald-900/30 bg-[#0a0f0a]/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Identity */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-800/50 flex items-center justify-center">
                <Radio className="h-5 w-5 text-emerald-400" />
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0f0a] ${
                  connected
                    ? "bg-emerald-400 animate-pulse-glow"
                    : "bg-red-500"
                }`}
              />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-emerald-50 font-mono">
                COLIN ATC
              </h1>
              <p className="text-[11px] text-emerald-600 font-mono uppercase tracking-widest">
                Air Traffic Control • Colin Nathan-Riggs
              </p>
            </div>
          </div>

          {/* Center: Status indicators */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-emerald-500/70">
              <Cpu className="h-3.5 w-3.5" />
              <span>{model}</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500/70">
              <Activity className="h-3.5 w-3.5" />
              <span>UP {uptime}</span>
            </div>
          </div>

          {/* Right: Connection status */}
          <div
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-mono ${
              connected
                ? "bg-emerald-950/50 border border-emerald-800/30 text-emerald-400"
                : "bg-red-950/50 border border-red-800/30 text-red-400"
            }`}
          >
            {connected ? (
              <>
                <Wifi className="h-3.5 w-3.5" />
                <span>GW CONNECTED</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5" />
                <span>GW OFFLINE</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
