"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { callGateway } from "@/lib/gateway";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Loader2,
  FileText,
  ArrowRight,
  X,
  Database,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface MemoryResult {
  path?: string;
  text?: string;
  snippet?: string;
  score?: number;
  from?: string;
  lines?: number[];
  startLine?: number;
  endLine?: number;
  [key: string]: unknown;
}

interface MemorySearchResponse {
  results?: MemoryResult[];
  result?: {
    results?: MemoryResult[];
  };
  [key: string]: unknown;
}

function extractResults(data: unknown): MemoryResult[] {
  if (!data) return [];
  const d = data as MemorySearchResponse;
  if (Array.isArray(d.results)) return d.results;
  if (d.result && Array.isArray(d.result.results)) return d.result.results;
  if (typeof d === "object" && d !== null) {
    for (const val of Object.values(d)) {
      if (Array.isArray(val) && val.length > 0 && (val[0] as MemoryResult)?.path) {
        return val as MemoryResult[];
      }
    }
  }
  return [];
}

function getResultText(result: MemoryResult): string {
  return result.snippet || result.text || "";
}

function getResultLines(result: MemoryResult): string | null {
  if (result.startLine !== undefined && result.endLine !== undefined) {
    return `${result.startLine}–${result.endLine}`;
  }
  if (result.lines && result.lines.length > 0) {
    return result.lines.length > 1
      ? `${result.lines[0]}–${result.lines[result.lines.length - 1]}`
      : `${result.lines[0]}`;
  }
  return null;
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const parts = query
    .trim()
    .split(/\s+/)
    .filter((p) => p.length > 2);
  if (parts.length === 0) return text;

  const regex = new RegExp(`(${parts.map(escapeRegex).join("|")})`, "gi");
  const segments = text.split(regex);

  return segments.map((seg, i) =>
    regex.test(seg) ? (
      <span key={i} className="text-th-accent bg-th-accent-bg px-0.5 rounded">
        {seg}
      </span>
    ) : (
      <span key={i}>{seg}</span>
    )
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scoreColor(score?: number): string {
  if (!score) return "text-th-icon-muted";
  if (score >= 0.8) return "text-emerald-400";
  if (score >= 0.5) return "text-amber-500";
  return "text-th-text-faint";
}

export function MemorySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemoryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => inputRef.current?.focus();
    window.addEventListener("memory-search-focus", handler);
    return () => window.removeEventListener("memory-search-focus", handler);
  }, []);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setExpandedIdx(new Set());
    try {
      const result = await callGateway<MemorySearchResponse>(
        "memory_search",
        {
          query: q,
          maxResults: 10,
        }
      );
      if (result.error) {
        setError(result.error);
        setResults([]);
      } else {
        setResults(extractResults(result.data));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setResults([]);
    }
    setLoading(false);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setError(null);
    setSearched(false);
    setExpandedIdx(new Set());
    inputRef.current?.focus();
  };

  const toggleExpand = (idx: number) => {
    setExpandedIdx((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  return (
    <div className="rounded-lg border border-th-border bg-th-card overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-th-panel-header border-b border-th-border">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-semibold text-th-text-secondary">
            Memory Search
          </span>
        </div>
        {searched && (
          <span className="text-[10px] font-mono text-th-text-faint">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Search Input */}
      <div className="px-4 py-3 border-b border-th-border">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-th-text-faint" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search memory stores…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-th-input-bg border border-th-input-border rounded px-3 py-2 pl-8 text-xs font-mono text-th-text-secondary placeholder:text-th-text-faint focus:outline-none focus:border-th-text-muted transition-colors"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-th-text-faint hover:text-th-text-secondary transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="px-3 py-2 bg-th-accent-bg border border-th-accent-border rounded text-xs font-medium text-th-accent hover:bg-th-accent/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ArrowRight className="h-3 w-3" />
            )}
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="h-[300px]">
        <div className="p-3 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-12 text-th-text-faint">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Searching…</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500/70 text-sm">
              ⚠ {error}
            </div>
          )}

          {!loading && searched && results.length === 0 && !error && (
            <div className="text-center py-8 text-th-text-faint text-sm">
              No results found
            </div>
          )}

          {!searched && !loading && (
            <div className="text-center py-8 text-th-icon-muted text-sm">
              Enter a query to search memory stores
            </div>
          )}

          {results.map((result, idx) => {
            const text = getResultText(result);
            const linesDisplay = getResultLines(result);
            const isExpanded = expandedIdx.has(idx);

            return (
              <div
                key={idx}
                className="rounded-md bg-th-card border border-th-border hover:border-th-text-faint transition-all cursor-pointer"
                onClick={() => toggleExpand(idx)}
              >
                <div className="px-3 py-2.5">
                  {/* Path + Score */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-th-text-faint shrink-0" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-th-text-faint shrink-0" />
                      )}
                      <FileText className="h-3 w-3 text-violet-500/60 shrink-0" />
                      <span className="text-[11px] font-mono text-th-text-secondary truncate">
                        {result.path || "unknown"}
                      </span>
                    </div>
                    {result.score !== undefined && (
                      <span
                        className={`text-[10px] font-mono shrink-0 ${scoreColor(
                          result.score
                        )}`}
                      >
                        {(result.score * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>

                  {/* Text snippet */}
                  {text && (
                    <pre
                      className={`text-[11px] font-mono text-th-text-muted whitespace-pre-wrap break-words leading-relaxed ${
                        isExpanded ? "" : "line-clamp-4"
                      }`}
                    >
                      {highlightMatch(text, query)}
                    </pre>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-th-icon-muted">
                    {result.from && <span>store: {result.from}</span>}
                    {linesDisplay && <span>lines: {linesDisplay}</span>}
                    {text && !isExpanded && text.split("\n").length > 4 && (
                      <span className="text-th-accent/70">click to expand</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
