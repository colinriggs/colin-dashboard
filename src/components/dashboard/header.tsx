"use client";

import { useGateway } from "@/hooks/use-gateway";
import { useTheme, THEMES, THEME_META } from "@/lib/theme";
import {
  Activity,
  Cpu,
  Radio,
  Wifi,
  WifiOff,
  BookOpen,
  DollarSign,
  ArrowDownUp,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";

interface StatusData {
  text?: string;
  model?: string;
  [key: string]: unknown;
}

interface ContextInfo {
  current: number;
  max: number;
  percentage: number;
}

interface UsageInfo {
  cost: string;
}

interface TokenInfo {
  input: string;
  output: string;
}

function parseContextGauge(text?: string): ContextInfo | null {
  if (!text) return null;
  const match = text.match(
    /Context:\s*([\d.]+)k?\s*\/\s*([\d.]+)k?\s*\((\d+)%\)/i
  );
  if (!match) return null;
  const currentRaw = parseFloat(match[1]);
  const maxRaw = parseFloat(match[2]);
  const percentage = parseInt(match[3], 10);
  return {
    current: currentRaw,
    max: maxRaw,
    percentage,
  };
}

function parseUsage(text?: string): UsageInfo | null {
  if (!text) return null;
  const match = text.match(/Usage:\s*(\$[\d.]+)/i);
  if (!match) return null;
  return { cost: match[1] };
}

function parseTokens(text?: string): TokenInfo | null {
  if (!text) return null;
  const match = text.match(
    /Tokens:\s*([\d.]+[kKmM]?)\s*in\s*\/\s*([\d.]+[kKmM]?)\s*out/i
  );
  if (!match) return null;
  return { input: match[1], output: match[2] };
}

function getGaugeColor(pct: number): string {
  if (pct < 50) return "bg-emerald-500";
  if (pct < 75) return "bg-amber-500";
  return "bg-red-500";
}

function getGaugeTextColor(pct: number): string {
  if (pct < 50) return "text-emerald-400";
  if (pct < 75) return "text-amber-400";
  return "text-red-400";
}

export function Header() {
  const { data, error } = useGateway<StatusData>({
    tool: "session_status",
    pollInterval: 30_000,
  });

  const { theme, setTheme } = useTheme();
  const [uptime, setUptime] = useState("—");
  const connected = !error;

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

  const statusText = useMemo(() => {
    if (!data) return undefined;
    const d = data as Record<string, unknown>;
    if (typeof d.statusText === "string") return d.statusText;
    if (typeof d.text === "string") return d.text;
    if (d.result && typeof (d.result as Record<string, unknown>).text === "string")
      return (d.result as Record<string, unknown>).text as string;
    if (d.result && typeof (d.result as Record<string, unknown>).statusText === "string")
      return (d.result as Record<string, unknown>).statusText as string;
    return JSON.stringify(d);
  }, [data]);

  const model =
    (data as Record<string, unknown>)?.model as string || "claude-opus-4-6";

  const contextInfo = useMemo(
    () => parseContextGauge(statusText),
    [statusText]
  );
  const usageInfo = useMemo(() => parseUsage(statusText), [statusText]);
  const tokenInfo = useMemo(() => parseTokens(statusText), [statusText]);

  return (
    <header className="border-b border-th-border bg-th-bg-secondary backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Identity */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-th-card border border-th-border-subtle flex items-center justify-center">
                <Radio className="h-5 w-5 text-th-accent" />
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-th-bg ${
                  connected
                    ? "bg-emerald-400 animate-pulse-glow"
                    : "bg-red-500"
                }`}
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-th-text">
                Colin
              </h1>
              <p className="text-[11px] text-th-text-faint tracking-wide">
                Dashboard
              </p>
            </div>
          </div>

          {/* Center: Status indicators + Context Gauge */}
          <div className="hidden md:flex items-center gap-5 text-xs">
            <div className="flex items-center gap-1.5 text-th-text-muted">
              <Cpu className="h-3.5 w-3.5" />
              <span className="font-mono">{model}</span>
            </div>
            <div className="flex items-center gap-1.5 text-th-text-muted">
              <Activity className="h-3.5 w-3.5" />
              <span className="font-mono">UP {uptime}</span>
            </div>

            {/* Context Gauge */}
            {contextInfo && (
              <div className="flex items-center gap-2">
                <BookOpen
                  className={`h-3.5 w-3.5 ${getGaugeTextColor(
                    contextInfo.percentage
                  )}`}
                />
                <div className="flex items-center gap-1.5">
                  <div className="w-24 h-2 bg-th-border rounded-full overflow-hidden border border-th-border-subtle">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getGaugeColor(
                        contextInfo.percentage
                      )}`}
                      style={{ width: `${Math.min(contextInfo.percentage, 100)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[10px] font-mono ${getGaugeTextColor(
                      contextInfo.percentage
                    )}`}
                  >
                    {contextInfo.current}k/{contextInfo.max}k
                  </span>
                </div>
              </div>
            )}

            {/* Cost */}
            {usageInfo && (
              <div className="flex items-center gap-1.5 text-amber-400/80">
                <DollarSign className="h-3.5 w-3.5" />
                <span className="font-mono font-semibold">{usageInfo.cost}</span>
              </div>
            )}

            {/* Tokens */}
            {tokenInfo && (
              <div className="flex items-center gap-1.5 text-th-text-muted">
                <ArrowDownUp className="h-3.5 w-3.5" />
                <span className="font-mono">
                  ↓{tokenInfo.input} ↑{tokenInfo.output}
                </span>
              </div>
            )}
          </div>

          {/* Right: Theme Switcher + Connection Status */}
          <div className="flex items-center gap-3">
            {/* Theme Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-md bg-th-card border border-th-border-subtle">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    theme === t
                      ? "border-th-text scale-110 shadow-sm"
                      : "border-transparent hover:border-th-text-faint opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: THEME_META[t].color }}
                  title={THEME_META[t].label}
                />
              ))}
            </div>

            {/* Connection status */}
            <div
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
                connected
                  ? "bg-emerald-950/40 border border-emerald-800/30 text-emerald-400"
                  : "bg-red-950/40 border border-red-800/30 text-red-400"
              }`}
            >
              {connected ? (
                <>
                  <Wifi className="h-3.5 w-3.5" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
