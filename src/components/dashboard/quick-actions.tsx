"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useGateway } from "@/hooks/use-gateway";
import { callGateway, runCronJob } from "@/lib/gateway";
import {
  Zap,
  Search,
  RefreshCw,
  Play,
  ChevronDown,
  Loader2,
  Terminal,
} from "lucide-react";

interface CronJobEntry {
  id?: string;
  jobId?: string;
  name?: string;
  text?: string;
  enabled?: boolean;
  [key: string]: unknown;
}

interface CronResponse {
  jobs?: CronJobEntry[];
  [key: string]: unknown;
}

interface QuickActionsProps {
  onRefreshAll?: () => void;
}

export function QuickActions({ onRefreshAll }: QuickActionsProps) {
  const [cronDropdownOpen, setCronDropdownOpen] = useState(false);
  const [runningJob, setRunningJob] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data } = useGateway<CronResponse>({
    tool: "cron",
    args: { action: "list" },
    pollInterval: 120_000,
  });

  let jobs: CronJobEntry[] = [];
  if (data) {
    if (Array.isArray(data)) {
      jobs = data;
    } else if (Array.isArray((data as CronResponse).jobs)) {
      jobs = (data as CronResponse).jobs!;
    } else if (typeof data === "object") {
      for (const val of Object.values(data)) {
        if (Array.isArray(val)) {
          jobs = val;
          break;
        }
      }
    }
  }

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setCronDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleRunCron = useCallback(async (jobId: string) => {
    setRunningJob(jobId);
    await runCronJob(jobId);
    setRunningJob(null);
    setCronDropdownOpen(false);
  }, []);

  const handleSearchMemory = useCallback(() => {
    window.dispatchEvent(new Event("memory-search-focus"));
  }, []);

  const handleRefreshAll = useCallback(() => {
    if (onRefreshAll) onRefreshAll();
    window.dispatchEvent(new Event("dashboard-refresh-all"));
  }, [onRefreshAll]);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-visible">
      <div className="flex items-center gap-2 px-4 py-2.5">
        {/* Label */}
        <div className="flex items-center gap-1.5 mr-2">
          <Terminal className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Quick Actions
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800 mx-1" />

        {/* Run Cron Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setCronDropdownOpen(!cronDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/30 border border-amber-800/30 rounded text-xs font-medium text-amber-400 hover:bg-amber-950/50 hover:border-amber-700/40 transition-colors"
          >
            <Zap className="h-3 w-3" />
            Run Cron
            <ChevronDown
              className={`h-3 w-3 transition-transform ${
                cronDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {cronDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl shadow-black/40 z-50 overflow-hidden">
              <div className="px-3 py-2 bg-zinc-800/50 border-b border-zinc-800">
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                  Select Job to Run
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {jobs.length === 0 && (
                  <div className="px-3 py-4 text-center text-zinc-500 text-[11px]">
                    No cron jobs found
                  </div>
                )}
                {jobs.map((job, idx) => {
                  const id = job.id || job.jobId || job.name || "";
                  const isRunning = runningJob === id;
                  return (
                    <button
                      key={id || idx}
                      onClick={() => handleRunCron(id)}
                      disabled={isRunning}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-b-0 disabled:opacity-50"
                    >
                      {isRunning ? (
                        <Loader2 className="h-3 w-3 animate-spin text-amber-500 shrink-0" />
                      ) : (
                        <Play className="h-3 w-3 text-zinc-500 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-[11px] text-zinc-300 block truncate">
                          {job.name || job.text?.slice(0, 40) || id}
                        </span>
                      </div>
                      {!job.enabled && (
                        <span className="text-[9px] font-mono text-zinc-600 shrink-0">
                          OFF
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Search Memory */}
        <button
          onClick={handleSearchMemory}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-950/30 border border-violet-800/30 rounded text-xs font-medium text-violet-400 hover:bg-violet-950/50 hover:border-violet-700/40 transition-colors"
        >
          <Search className="h-3 w-3" />
          Search Memory
        </button>

        {/* Refresh All */}
        <button
          onClick={handleRefreshAll}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/30 rounded text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600/40 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh All
        </button>
      </div>
    </div>
  );
}
