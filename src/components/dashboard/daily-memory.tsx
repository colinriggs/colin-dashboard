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

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800/50 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold text-zinc-200">
            Daily Log
          </span>
        </div>
        <button
          onClick={() => loadDay(currentDate)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/20 border-b border-zinc-800">
        <button
          onClick={() => goDay(-1)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <span className="text-xs font-mono text-zinc-300">
            {displayDate(currentDate)}
          </span>
          {isToday && (
            <span className="ml-2 text-[10px] text-zinc-500">
              (today)
            </span>
          )}
        </div>
        <button
          onClick={() => goDay(1)}
          disabled={isToday}
          className="text-zinc-500 hover:text-zinc-300 disabled:text-zinc-700 disabled:cursor-not-allowed transition-colors p-1"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="h-[280px]">
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-12 text-zinc-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500/70 text-sm">
              ⚠ {error}
            </div>
          )}

          {!loading && !error && !content && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No log for {currentDate}
            </div>
          )}

          {!loading && content && (
            <pre className="text-xs font-mono text-zinc-300/80 whitespace-pre-wrap break-words leading-relaxed">
              {content}
            </pre>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
