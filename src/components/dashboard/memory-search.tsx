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
} from "lucide-react";

interface MemoryResult {
  path?: string;
  text?: string;
  score?: number;
  from?: string;
  lines?: number[];
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
  // After callGateway unwrap: data = {results: [...], provider, model}
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
      <span key={i} className="text-emerald-300 bg-emerald-800/30 px-0.5 rounded">
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
  if (!score) return "text-emerald-800";
  if (score >= 0.8) return "text-emerald-400";
  if (score >= 0.5) return "text-amber-500";
  return "text-emerald-700";
}

export function MemorySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemoryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose the input ref for focus from quick actions
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
    inputRef.current?.focus();
  };

  return (
    <div className="rounded-lg border border-emerald-900/30 bg-[#0c120c] overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-950/30 border-b border-emerald-900/20">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-mono font-bold text-emerald-300 uppercase tracking-wide">
            Memory Search
          </span>
        </div>
        {searched && (
          <span className="text-[10px] font-mono text-emerald-700">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Search Input */}
      <div className="px-4 py-3 border-b border-emerald-900/20">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-700" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search memory stores…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-[#060a06] border border-emerald-900/30 rounded px-3 py-2 pl-8 text-xs font-mono text-emerald-200 placeholder:text-emerald-800 focus:outline-none focus:border-emerald-700 transition-colors"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-emerald-700 hover:text-emerald-400 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="px-3 py-2 bg-emerald-800/30 border border-emerald-700/30 rounded text-xs font-mono text-emerald-400 hover:bg-emerald-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ArrowRight className="h-3 w-3" />
            )}
            SEARCH
          </button>
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="h-[300px]">
        <div className="p-3 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-12 text-emerald-700">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm font-mono">Searching…</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-500/70 text-sm font-mono">
              ⚠ {error}
            </div>
          )}

          {!loading && searched && results.length === 0 && !error && (
            <div className="text-center py-8 text-emerald-800 text-sm font-mono">
              No results found
            </div>
          )}

          {!searched && !loading && (
            <div className="text-center py-8 text-emerald-800/60 text-sm font-mono">
              Enter a query to search memory stores
            </div>
          )}

          {results.map((result, idx) => (
            <div
              key={idx}
              className="px-3 py-2.5 rounded-md bg-emerald-950/20 border border-emerald-900/15 hover:border-emerald-800/30 transition-all"
            >
              {/* Path + Score */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="h-3 w-3 text-violet-500/60 shrink-0" />
                  <span className="text-[11px] font-mono text-emerald-400 truncate">
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
              {result.text && (
                <pre className="text-[11px] font-mono text-emerald-300/70 whitespace-pre-wrap break-words leading-relaxed line-clamp-4">
                  {highlightMatch(result.text, query)}
                </pre>
              )}

              {/* Meta */}
              <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-emerald-800">
                {result.from && <span>store: {result.from}</span>}
                {result.lines && result.lines.length > 0 && (
                  <span>
                    lines: {result.lines[0]}
                    {result.lines.length > 1 && `–${result.lines[result.lines.length - 1]}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
