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
    <div className="rounded-lg border border-th-border bg-th-card overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-th-panel-header border-b border-th-border">
        <div className="flex items-center gap-2">
          <NotebookPen className="h-4 w-4 text-cyan-400" />
          <span className="text-sm font-semibold text-th-text-secondary">
            Daily Log
          </span>
        </div>
        <button
          onClick={() => loadDay(currentDate)}
          className="text-th-text-faint hover:text-th-text-secondary transition-colors"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between px-4 py-2 bg-th-hover border-b border-th-border">
        <button
          onClick={() => goDay(-1)}
          className="text-th-text-faint hover:text-th-text-secondary transition-colors p-1"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <span className="text-xs font-mono text-th-text-secondary">
            {displayDate(currentDate)}
          </span>
          {isToday && (
            <span className="ml-2 text-[10px] text-th-text-faint">
              (today)
            </span>
          )}
        </div>
        <button
          onClick={() => goDay(1)}
          disabled={isToday}
          className="text-th-text-faint hover:text-th-text-secondary disabled:text-th-icon-muted disabled:cursor-not-allowed transition-colors p-1"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="h-[280px]">
        <div className="p-4">
          {loading && (
            <div className="flex items-center justify-center py-12 text-th-text-faint">
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
            <div className="text-center py-8 text-th-text-faint text-sm">
              No log for {currentDate}
            </div>
          )}

          {!loading && content && (
            <pre className="text-xs font-mono text-th-text-muted whitespace-pre-wrap break-words leading-relaxed">
              {content}
            </pre>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
