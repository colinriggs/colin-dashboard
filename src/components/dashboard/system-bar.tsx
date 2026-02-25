"use client";

import { useGateway } from "@/hooks/use-gateway";
import {
  Server,
  Cpu,
  Monitor,
  Hash,
  DollarSign,
  MessageSquare,
} from "lucide-react";

interface SessionStatusData {
  host?: string;
  os?: string;
  model?: string;
  channel?: string;
  arch?: string;
  runtime?: string;
  cost?: number;
  costStr?: string;
  totalTokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  [key: string]: unknown;
}

function formatTokens(n?: number): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function SystemBar() {
  const { data } = useGateway<SessionStatusData>({
    tool: "session_status",
    pollInterval: 60_000,
  });

  const info = (data as SessionStatusData) || {};

  const items = [
    {
      icon: Server,
      label: "Host",
      value: info.host || "Mac mini",
    },
    {
      icon: Monitor,
      label: "OS",
      value: info.os
        ? `${info.os} (${info.arch || "arm64"})`
        : "Darwin (arm64)",
    },
    {
      icon: Cpu,
      label: "Model",
      value: info.model || "claude-opus-4-6",
    },
    {
      icon: MessageSquare,
      label: "Channel",
      value: info.channel || "Slack",
    },
    {
      icon: Hash,
      label: "Gateway",
      value: "127.0.0.1:18789",
    },
    {
      icon: DollarSign,
      label: "Cost",
      value: info.costStr || (info.cost ? `$${info.cost.toFixed(4)}` : "—"),
    },
  ];

  return (
    <div className="border-t border-emerald-900/30 bg-[#080c08]/80 backdrop-blur-sm">
      <div className="max-w-[1800px] mx-auto px-4 py-2">
        <div className="flex items-center gap-4 overflow-x-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 whitespace-nowrap shrink-0"
              >
                <Icon className="h-3 w-3 text-emerald-800" />
                <span className="text-emerald-600">{item.label}:</span>
                <span className="text-emerald-400/70">{item.value}</span>
              </div>
            );
          })}

          {/* Token usage if available */}
          {(info.inputTokens || info.totalTokens) && (
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 whitespace-nowrap shrink-0 ml-auto">
              <span className="text-emerald-600">Tokens:</span>
              <span className="text-emerald-400/70">
                ↓{formatTokens(info.inputTokens)} ↑
                {formatTokens(info.outputTokens)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
