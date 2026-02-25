"use client";

import { useState, useCallback, useEffect } from "react";
import { fetchFile } from "@/lib/gateway";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  NotebookPen,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

function extractContent(data: unknown): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  const obj = data as Record<string, unknown>;
  if (typeof obj.output === "string") return obj.output;
  if (typeof obj.stdout === "string") return obj.stdout;
  if (typeof obj.content === "string") return obj.content;
  if (typeof obj.result === "string") return obj.result;
  if (obj.content && typeof obj.content === "object") {
    const nested = obj.content as Record<string, unknown>;
    if (typeof nested.output === "string") return nested.output;
  }
  return JSON.stringify(data, null, 2);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function displayDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DailyMemory() {
  const [currentDate, setCurrentDate] = useState(() => formatDate(new Date()));
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const loadDay = useCallback(async (dateStr: string) => {
    setLoading(true);
    setError("");
    setContent("");
    try {
      const result = await fetchFile(`memory/${dateStr}.md`);
      if (result.error) {
        setError(result.error);
      } else if (result.data?.notFound || !result.data?.content) {
        setContent("");
      } else {
        setContent(result.data.content);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDay(currentDate);
  }, [currentDate, loadDay]);

  const goDay = (offset: number) => {
    const d = new Date(currentDate + "T12:00:00");
    d.setDate(d.getDate() + offset);
    setCurrentDate(formatDate(d));
  };

  const isToday = currentDate === formatDate(new Date());

  return (
    <div className="rounded-lg border border-emerald-900/30 bg-[#0c120c] overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-950/30 border-b border-emerald-900/20">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-mono font-bold text-emerald-300 uppercase tracking-wide">
            Daily Log
          </span>
        </div>
        <button
          onClick={() => loadDay(currentDate)}
          className="text-emerald-600 hover:text-emerald-400 transition-colors"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-emerald-950/10 border-b border-emerald-900/15">
        <button
          onClick={() => goDay(-1)}
          className="text-emerald-600 hover:text-emerald-400 transition-colors p-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <span className="text-xs font-mono text-emerald-400">
            {displayDate(currentDate)}
          </span>
          {isToday && (
            <span className="ml-2 text-[10px] text-emerald-600 font-mono">
              (today)
            </span>
          )}
        </div>
        <button
          onClick={() => goDay(1)}
          disabled={isToday}
          className="text-emerald-600 hover:text-emerald-400 disabled:text-emerald-900 disabled:cursor-not-allowed transition-colors p-1"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="h-[280px]">
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-12 text-emerald-700">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm font-mono">Loading…</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500/70 text-sm font-mono">
              ⚠ {error}
            </div>
          )}

          {!loading && !error && !content && (
            <div className="text-center py-8 text-emerald-800 text-sm font-mono">
              No log for {currentDate}
            </div>
          )}

          {!loading && content && (
            <pre className="text-xs font-mono text-emerald-300/80 whitespace-pre-wrap break-words leading-relaxed">
              {content}
            </pre>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
