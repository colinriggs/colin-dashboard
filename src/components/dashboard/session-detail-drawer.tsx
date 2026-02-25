"use client";

import { useState, useEffect, useCallback } from "react";
import { callGateway } from "@/lib/gateway";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Loader2,
  User,
  Bot,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

interface ChatMessage {
  role?: string;
  content?: string;
  text?: string;
  [key: string]: unknown;
}

interface SessionHistoryResponse {
  messages?: ChatMessage[];
  result?: {
    messages?: ChatMessage[];
  };
  [key: string]: unknown;
}

interface SessionDetailDrawerProps {
  sessionKey: string | null;
  onClose: () => void;
}

function extractMessages(data: unknown): ChatMessage[] {
  if (!data) return [];
  const d = data as SessionHistoryResponse;
  if (Array.isArray(d.messages)) return d.messages;
  if (d.result && Array.isArray(d.result.messages)) return d.result.messages;
  if (typeof d === "object" && d !== null) {
    for (const val of Object.values(d)) {
      if (Array.isArray(val) && val.length > 0 && val[0]?.role) {
        return val;
      }
    }
  }
  return [];
}

function getMessageContent(msg: ChatMessage): string {
  const raw = msg.content || msg.text || "";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") return JSON.stringify(raw, null, 2);
  return String(raw);
}

export function SessionDetailDrawer({
  sessionKey,
  onClose,
}: SessionDetailDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    setMessages([]);
    try {
      const result = await callGateway<SessionHistoryResponse>(
        "sessions_history",
        {
          sessionKey: key,
          limit: 20,
          includeTools: false,
        }
      );
      if (result.error) {
        setError(result.error);
      } else {
        const msgs = extractMessages(result.data);
        setMessages(msgs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (sessionKey) {
      loadHistory(sessionKey);
    }
  }, [sessionKey, loadHistory]);

  if (!sessionKey) return null;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-800/50 border-b border-zinc-800">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="text-sm font-semibold text-zinc-200 truncate">
              {sessionKey}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-16 text-zinc-500">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Loading history…</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-500/70 text-sm">
                ⚠ {error}
              </div>
            )}

            {!loading && !error && messages.length === 0 && (
              <div className="text-center py-12 text-zinc-500 text-sm">
                No messages found
              </div>
            )}

            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const isAssistant =
                msg.role === "assistant" || msg.role === "bot";
              const content = getMessageContent(msg);
              if (!content.trim()) return null;

              return (
                <div
                  key={idx}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      isUser
                        ? "bg-blue-950/40 border border-blue-800/30"
                        : isAssistant
                        ? "bg-zinc-900 border border-zinc-800"
                        : "bg-amber-950/20 border border-amber-900/20"
                    }`}
                  >
                    {/* Role label */}
                    <div
                      className={`flex items-center gap-1.5 mb-1 text-[10px] font-medium uppercase tracking-wider ${
                        isUser
                          ? "text-blue-400"
                          : isAssistant
                          ? "text-cyan-500"
                          : "text-amber-500"
                      }`}
                    >
                      {isUser ? (
                        <User className="h-2.5 w-2.5" />
                      ) : (
                        <Bot className="h-2.5 w-2.5" />
                      )}
                      {msg.role || "system"}
                    </div>
                    {/* Content */}
                    <pre className="text-xs font-mono text-zinc-200/80 whitespace-pre-wrap break-words leading-relaxed">
                      {content}
                    </pre>
                  </div>
                </div>
              );
            })}

            {messages.length > 0 && (
              <div className="flex justify-center pt-2">
                <ChevronDown className="h-3 w-3 text-zinc-700" />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-800/30">
          <span className="text-[10px] text-zinc-500">
            {messages.length} message{messages.length !== 1 ? "s" : ""} loaded •
            Last 20 messages (no tool calls)
          </span>
        </div>
      </div>
    </div>
  );
}
