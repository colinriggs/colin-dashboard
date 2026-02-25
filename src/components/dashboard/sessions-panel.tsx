"use client";

import { useState } from "react";
import { useGateway } from "@/hooks/use-gateway";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SessionDetailDrawer } from "./session-detail-drawer";
import {
  Layers,
  MessageSquare,
  Bot,
  Clock,
  RefreshCw,
  CircleDot,
  Loader2,
} from "lucide-react";

interface SessionMessage {
  role?: string;
  text?: string;
  content?: string | unknown[];
}

interface SessionEntry {
  key?: string;
  label?: string;
  kind?: string;
  model?: string;
  status?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  messages?: SessionMessage[];
  cost?: number;
  costStr?: string;
  startedAt?: string;
  lastActiveAt?: string;
  updatedAt?: number;
  [key: string]: unknown;
}

interface SessionsResponse {
  sessions?: SessionEntry[];
  [key: string]: unknown;
}

function formatTokens(n?: number): string {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function extractText(val: unknown): string {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    return val
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object" && "text" in item && typeof (item as Record<string, unknown>).text === "string")
          return (item as Record<string, unknown>).text as string;
        return "";
      })
      .filter(Boolean)
      .join(" ");
  }
  return "";
}

function getLastMessage(session: SessionEntry): string {
  const msgs = session.messages;
  if (!msgs || msgs.length === 0) return "No messages";
  const last = msgs[msgs.length - 1];
  const text = extractText(last?.text) || extractText(last?.content) || "";
  if (text) {
    return text.slice(0, 120) + (text.length > 120 ? "…" : "");
  }
  return "…";
}

function getKindIcon(kind?: string) {
  switch (kind) {
    case "main":
      return <MessageSquare className="h-3.5 w-3.5" />;
    case "subagent":
      return <Bot className="h-3.5 w-3.5" />;
    case "cron":
      return <Clock className="h-3.5 w-3.5" />;
    default:
      return <Layers className="h-3.5 w-3.5" />;
  }
}

function getStatusColor(status?: string): string {
  if (!status) return "text-th-text-faint";
  if (status === "active" || status === "running") return "text-emerald-400";
  if (status === "completed" || status === "done") return "text-th-text-faint";
  if (status === "aborted" || status === "error" || status === "failed")
    return "text-red-400";
  return "text-amber-400";
}

function getStatusDot(status?: string): string {
  if (!status) return "bg-th-icon-muted";
  if (status === "active" || status === "running") return "bg-emerald-400";
  if (status === "completed" || status === "done") return "bg-th-icon-muted";
  if (status === "aborted" || status === "error" || status === "failed")
    return "bg-red-400";
  return "bg-amber-400";
}

function timeSince(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function SessionsPanel() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const { data, error, loading, lastUpdated, refresh } =
    useGateway<SessionsResponse>({
      tool: "sessions_list",
      args: { activeMinutes: 120, messageLimit: 2 },
      pollInterval: 30_000,
    });

  let sessions: SessionEntry[] = [];
  if (data) {
    if (Array.isArray(data)) {
      sessions = data;
    } else if (Array.isArray((data as SessionsResponse).sessions)) {
      sessions = (data as SessionsResponse).sessions!;
    } else if (typeof data === "object") {
      for (const val of Object.values(data)) {
        if (Array.isArray(val)) {
          sessions = val;
          break;
        }
      }
    }
  }

  const activeCount = sessions.filter(
    (s) => s.status === "active" || s.status === "running"
  ).length;

  return (
    <div className="rounded-lg border border-th-border bg-th-card overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-th-panel-header border-b border-th-border">
        <div className="flex items-center gap-2">
          <CircleDot className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-semibold text-th-text-secondary">
            Active Sessions
          </span>
          {activeCount > 0 && (
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 text-[10px] px-1.5 py-0">
              {activeCount} LIVE
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[10px] text-th-text-faint font-mono">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            className="text-th-text-faint hover:text-th-text-secondary transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="h-[400px]">
        <div className="p-3 space-y-1.5">
          {loading && sessions.length === 0 && (
            <div className="flex items-center justify-center py-12 text-th-text-faint">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Loading sessions…</span>
            </div>
          )}

          {error && sessions.length === 0 && (
            <div className="text-center py-8 text-red-500/70 text-sm">
              ⚠ {error}
            </div>
          )}

          {sessions.length === 0 && !loading && !error && (
            <div className="text-center py-8 text-th-text-faint text-sm">
              No active sessions
            </div>
          )}

          {sessions.map((session, idx) => (
            <div
              key={session.key || idx}
              onClick={() => {
                const key = session.key || session.label;
                if (key) setSelectedSession(key);
              }}
              className="group px-3 py-2.5 rounded-md bg-th-card border border-th-border hover:border-th-text-faint hover:bg-th-card-hover transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                {/* Status dot */}
                <div
                  className={`h-2 w-2 rounded-full ${getStatusDot(
                    session.status
                  )} ${
                    session.status === "active" || session.status === "running"
                      ? "animate-pulse-glow"
                      : ""
                  }`}
                />

                {/* Session key */}
                <span className="text-sm font-mono text-th-text-secondary font-medium truncate flex-1">
                  {session.key || session.label || `Session ${idx + 1}`}
                </span>

                {/* Kind badge */}
                <div className="flex items-center gap-1 text-th-text-faint">
                  {getKindIcon(session.kind)}
                  <span className="text-[10px] font-mono uppercase">
                    {session.kind || "unknown"}
                  </span>
                </div>
              </div>

              {/* Details row */}
              <div className="flex items-center gap-3 text-[11px] font-mono text-th-text-faint ml-4">
                {session.model && (
                  <span className="text-th-text-muted/60">{session.model}</span>
                )}
                {(session.inputTokens || session.totalTokens) && (
                  <span>
                    ↓{formatTokens(session.inputTokens)} ↑
                    {formatTokens(session.outputTokens)}
                  </span>
                )}
                {session.costStr && (
                  <span className="text-amber-500/60">{session.costStr}</span>
                )}
                {(session.lastActiveAt || session.updatedAt) && (
                  <span className={getStatusColor(session.status)}>
                    {timeSince(session.lastActiveAt || (session.updatedAt ? new Date(session.updatedAt).toISOString() : undefined))}
                  </span>
                )}
              </div>

              {/* Last message preview */}
              {session.messages && session.messages.length > 0 && (
                <div className="mt-1.5 ml-4 text-[11px] text-th-text-faint font-mono truncate">
                  › {getLastMessage(session)}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Session Detail Drawer */}
      <SessionDetailDrawer
        sessionKey={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
}
