"use client";

import { useGateway } from "@/hooks/use-gateway";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  toggleCronJob,
  deleteCronJob,
  addCronJob,
  runCronJob,
  callGateway,
} from "@/lib/gateway";
import {
  Timer,
  RefreshCw,
  Play,
  Pause,
  Trash2,
  Plus,
  Zap,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState, useCallback } from "react";

interface CronJobEntry {
  id?: string;
  jobId?: string;
  name?: string;
  text?: string;
  schedule?: string | { kind?: string; expr?: string };
  enabled?: boolean;
  lastRun?: string;
  nextRun?: string;
  model?: string;
  state?: {
    nextRunAtMs?: number;
    lastRunAtMs?: number;
    lastStatus?: string;
    lastDurationMs?: number;
  };
  payload?: {
    kind?: string;
    message?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

function getScheduleExpr(schedule?: string | { kind?: string; expr?: string }): string {
  if (!schedule) return "—";
  if (typeof schedule === "string") return schedule;
  if (typeof schedule === "object" && schedule.expr) return schedule.expr;
  return JSON.stringify(schedule);
}

function getJobText(job: CronJobEntry): string {
  if (job.text) return job.text;
  if (job.payload?.message) return job.payload.message;
  return "";
}

function getLastRun(job: CronJobEntry): string | undefined {
  if (job.lastRun) return job.lastRun;
  if (job.state?.lastRunAtMs) return new Date(job.state.lastRunAtMs).toISOString();
  return undefined;
}

function getNextRun(job: CronJobEntry): string | undefined {
  if (job.nextRun) return job.nextRun;
  if (job.state?.nextRunAtMs) return new Date(job.state.nextRunAtMs).toISOString();
  return undefined;
}

interface CronResponse {
  jobs?: CronJobEntry[];
  [key: string]: unknown;
}

interface CronRunEntry {
  id?: string;
  runId?: string;
  startedAt?: string;
  completedAt?: string;
  status?: string;
  duration?: number;
  durationMs?: number;
  error?: string;
  [key: string]: unknown;
}

interface CronRunsResponse {
  runs?: CronRunEntry[];
  result?: {
    runs?: CronRunEntry[];
  };
  [key: string]: unknown;
}

function formatScheduleTime(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return dateStr;
  }
}

function formatDuration(ms?: number): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  return `${mins}m ${secs % 60}s`;
}

function extractRuns(data: unknown): CronRunEntry[] {
  if (!data) return [];
  const d = data as CronRunsResponse;
  if (Array.isArray(d.runs)) return d.runs;
  if (d.result && Array.isArray(d.result.runs)) return d.result.runs;
  if (Array.isArray(d)) return d;
  if (typeof d === "object" && d !== null) {
    for (const val of Object.values(d)) {
      if (Array.isArray(val)) return val;
    }
  }
  return [];
}

export function CronPanel() {
  const { data, error, loading, lastUpdated, refresh } =
    useGateway<CronResponse>({
      tool: "cron",
      args: { action: "list" },
      pollInterval: 60_000,
    });

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJobText, setNewJobText] = useState("");
  const [newJobSchedule, setNewJobSchedule] = useState("");
  const [newJobModel, setNewJobModel] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Cron run history state
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});
  const [jobRuns, setJobRuns] = useState<Record<string, CronRunEntry[]>>({});
  const [runsLoading, setRunsLoading] = useState<Record<string, boolean>>({});

  // Extract jobs from response
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

  const getJobId = (job: CronJobEntry) =>
    job.id || job.jobId || job.name || "";
  const enabledCount = jobs.filter((j) => j.enabled).length;

  const handleToggle = useCallback(
    async (job: CronJobEntry) => {
      const id = getJobId(job);
      setActionLoading(id);
      await toggleCronJob(id, !job.enabled);
      setActionLoading(null);
      refresh();
    },
    [refresh]
  );

  const handleDelete = useCallback(
    async (job: CronJobEntry) => {
      const id = getJobId(job);
      if (deleteConfirm !== id) {
        setDeleteConfirm(id);
        return;
      }
      setActionLoading(id);
      await deleteCronJob(id);
      setActionLoading(null);
      setDeleteConfirm(null);
      refresh();
    },
    [deleteConfirm, refresh]
  );

  const handleRun = useCallback(
    async (job: CronJobEntry) => {
      const id = getJobId(job);
      setActionLoading(id);
      await runCronJob(id);
      setActionLoading(null);
      refresh();
    },
    [refresh]
  );

  const handleAddJob = useCallback(async () => {
    if (!newJobText.trim() || !newJobSchedule.trim()) return;
    setActionLoading("__add__");
    await addCronJob({
      text: newJobText.trim(),
      schedule: newJobSchedule.trim(),
      ...(newJobModel.trim() ? { model: newJobModel.trim() } : {}),
    });
    setActionLoading(null);
    setNewJobText("");
    setNewJobSchedule("");
    setNewJobModel("");
    setShowAddForm(false);
    refresh();
  }, [newJobText, newJobSchedule, newJobModel, refresh]);

  const toggleRunHistory = useCallback(
    async (job: CronJobEntry) => {
      const id = getJobId(job);
      const isExpanded = expandedJobs[id];

      if (isExpanded) {
        setExpandedJobs((prev) => ({ ...prev, [id]: false }));
        return;
      }

      // Expand and load runs
      setExpandedJobs((prev) => ({ ...prev, [id]: true }));

      if (!jobRuns[id]) {
        setRunsLoading((prev) => ({ ...prev, [id]: true }));
        try {
          const result = await callGateway<CronRunsResponse>("cron", {
            action: "runs",
            jobId: id,
          });
          if (!result.error && result.data) {
            const runs = extractRuns(result.data);
            setJobRuns((prev) => ({ ...prev, [id]: runs.slice(0, 5) }));
          } else {
            setJobRuns((prev) => ({ ...prev, [id]: [] }));
          }
        } catch {
          setJobRuns((prev) => ({ ...prev, [id]: [] }));
        }
        setRunsLoading((prev) => ({ ...prev, [id]: false }));
      }
    },
    [expandedJobs, jobRuns]
  );

  return (
    <div className="rounded-lg border border-emerald-900/30 bg-[#0c120c] overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-950/30 border-b border-emerald-900/20">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-mono font-bold text-emerald-300 uppercase tracking-wide">
            Cron Jobs
          </span>
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0">
            {enabledCount}/{jobs.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-emerald-600 hover:text-emerald-400 transition-colors p-1"
            title="Add cron job"
          >
            {showAddForm ? (
              <X className="h-3.5 w-3.5" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
          </button>
          {lastUpdated && (
            <span className="text-[10px] text-emerald-700 font-mono">
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            className="text-emerald-600 hover:text-emerald-400 transition-colors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="px-4 py-3 bg-emerald-950/20 border-b border-emerald-900/20 space-y-2">
          <input
            type="text"
            placeholder="Job text / prompt…"
            value={newJobText}
            onChange={(e) => setNewJobText(e.target.value)}
            className="w-full bg-[#0a0f0a] border border-emerald-900/30 rounded px-3 py-1.5 text-xs font-mono text-emerald-200 placeholder:text-emerald-800 focus:outline-none focus:border-emerald-700"
          />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Schedule (cron or natural)"
              value={newJobSchedule}
              onChange={(e) => setNewJobSchedule(e.target.value)}
              className="flex-1 bg-[#0a0f0a] border border-emerald-900/30 rounded px-3 py-1.5 text-xs font-mono text-emerald-200 placeholder:text-emerald-800 focus:outline-none focus:border-emerald-700"
            />
            <input
              type="text"
              placeholder="Model (optional)"
              value={newJobModel}
              onChange={(e) => setNewJobModel(e.target.value)}
              className="w-40 bg-[#0a0f0a] border border-emerald-900/30 rounded px-3 py-1.5 text-xs font-mono text-emerald-200 placeholder:text-emerald-800 focus:outline-none focus:border-emerald-700"
            />
            <button
              onClick={handleAddJob}
              disabled={
                !newJobText.trim() ||
                !newJobSchedule.trim() ||
                actionLoading === "__add__"
              }
              className="px-3 py-1.5 bg-emerald-800/30 border border-emerald-700/30 rounded text-xs font-mono text-emerald-400 hover:bg-emerald-800/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {actionLoading === "__add__" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "ADD"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <ScrollArea className="h-[350px]">
        <div className="p-2">
          {loading && jobs.length === 0 && (
            <div className="flex items-center justify-center py-12 text-emerald-700">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm font-mono">Loading cron jobs…</span>
            </div>
          )}

          {error && jobs.length === 0 && (
            <div className="text-center py-8 text-red-500/70 text-sm font-mono">
              ⚠ {error}
            </div>
          )}

          {jobs.map((job, idx) => {
            const id = getJobId(job);
            const isLoading = actionLoading === id;
            const isExpanded = expandedJobs[id] || false;
            const runs = jobRuns[id] || [];
            const isRunsLoading = runsLoading[id] || false;

            return (
              <div key={id || idx} className="mb-1">
                <div
                  className={`group flex items-center gap-3 px-3 py-2 rounded-md hover:bg-emerald-950/30 transition-all ${
                    job.enabled ? "" : "opacity-50"
                  }`}
                >
                  {/* Toggle button */}
                  <button
                    onClick={() => handleToggle(job)}
                    disabled={isLoading}
                    className="shrink-0"
                    title={job.enabled ? "Disable" : "Enable"}
                  >
                    {job.enabled ? (
                      <Play className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400" />
                    ) : (
                      <Pause className="h-3.5 w-3.5 text-gray-600" />
                    )}
                  </button>

                  {/* Expand/collapse for run history */}
                  <button
                    onClick={() => toggleRunHistory(job)}
                    className="shrink-0 text-emerald-700 hover:text-emerald-400 transition-colors"
                    title="Show run history"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>

                  {/* Job info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-emerald-200 font-medium truncate">
                        {job.name || getJobText(job)?.slice(0, 40) || id}
                      </span>
                      {job.enabled ? (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] px-1 py-0">
                          ON
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-gray-600 border-gray-800 text-[9px] px-1 py-0"
                        >
                          OFF
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-emerald-800 mt-0.5">
                      <code className="text-emerald-600/60">
                        {getScheduleExpr(job.schedule)}
                      </code>
                      {getLastRun(job) && (
                        <span>last: {formatScheduleTime(getLastRun(job))}</span>
                      )}
                      {getNextRun(job) && (
                        <span>next: {formatScheduleTime(getNextRun(job))}</span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => handleRun(job)}
                      disabled={isLoading}
                      className="p-1 text-amber-600 hover:text-amber-400 transition-colors"
                      title="Run now"
                    >
                      <Zap className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(job)}
                      disabled={isLoading}
                      className={`p-1 transition-colors ${
                        deleteConfirm === id
                          ? "text-red-400"
                          : "text-red-800 hover:text-red-500"
                      }`}
                      title={
                        deleteConfirm === id
                          ? "Click again to confirm"
                          : "Delete"
                      }
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {isLoading && (
                    <Loader2 className="h-3 w-3 animate-spin text-emerald-600 shrink-0" />
                  )}
                </div>

                {/* Run History (expandable) */}
                {isExpanded && (
                  <div className="ml-10 mr-3 mb-2 mt-1 rounded-md bg-[#060a06] border border-emerald-900/20 overflow-hidden">
                    <div className="px-3 py-1.5 bg-emerald-950/30 border-b border-emerald-900/15">
                      <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-wider">
                        Recent Runs
                      </span>
                    </div>

                    {isRunsLoading && (
                      <div className="flex items-center justify-center py-4 text-emerald-700">
                        <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                        <span className="text-[10px] font-mono">Loading…</span>
                      </div>
                    )}

                    {!isRunsLoading && runs.length === 0 && (
                      <div className="text-center py-3 text-emerald-800 text-[10px] font-mono">
                        No runs found
                      </div>
                    )}

                    {!isRunsLoading &&
                      runs.map((run, runIdx) => {
                        const isSuccess =
                          run.status === "success" ||
                          run.status === "completed" ||
                          run.status === "done";
                        const isFailure =
                          run.status === "failed" ||
                          run.status === "error" ||
                          run.status === "aborted";
                        const dur = run.durationMs || run.duration;

                        return (
                          <div
                            key={run.id || run.runId || runIdx}
                            className="flex items-center gap-2 px-3 py-1.5 border-b border-emerald-900/10 last:border-b-0"
                          >
                            {/* Status icon */}
                            {isSuccess ? (
                              <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                            ) : isFailure ? (
                              <XCircle className="h-3 w-3 text-red-500 shrink-0" />
                            ) : (
                              <Clock className="h-3 w-3 text-amber-500 shrink-0" />
                            )}

                            {/* Time */}
                            <span className="text-[10px] font-mono text-emerald-500/70 flex-1">
                              {formatScheduleTime(
                                run.startedAt || run.completedAt
                              )}
                            </span>

                            {/* Status */}
                            <span
                              className={`text-[10px] font-mono uppercase ${
                                isSuccess
                                  ? "text-emerald-500"
                                  : isFailure
                                  ? "text-red-400"
                                  : "text-amber-500"
                              }`}
                            >
                              {run.status || "—"}
                            </span>

                            {/* Duration */}
                            {dur && (
                              <span className="text-[10px] font-mono text-emerald-700">
                                {formatDuration(
                                  typeof dur === "number" ? dur : undefined
                                )}
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
