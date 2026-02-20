export interface CronJob {
  name: string;
  enabled: boolean;
  schedule: string;
  lastRun?: string;
  nextRun?: string;
}

export interface Session {
  name: string;
  type: "main" | "subagent" | "cron";
  status: "active" | "completed" | "aborted";
  details: string;
  model?: string;
  tokens?: string;
}

export interface ConnectedService {
  name: string;
  status: "connected" | "warning" | "disconnected";
  detail?: string;
}

export interface ActivityEvent {
  time: string;
  description: string;
  type: "success" | "warning" | "error" | "info";
}

export const cronJobs: CronJob[] = [
  {
    name: "email-check",
    enabled: true,
    schedule: "17 7,9,12,15,18,21 * * *",
    lastRun: "2026-02-19T23:17:00Z",
    nextRun: "2026-02-20T01:17:00Z",
  },
  {
    name: "morning-digest",
    enabled: true,
    schedule: "0 9 * * *",
    lastRun: "2026-02-19T17:00:00Z",
    nextRun: "2026-02-20T17:00:00Z",
  },
  {
    name: "marketing-hourly-status",
    enabled: false,
    schedule: "Every 1h",
  },
  {
    name: "marketing-self-eval",
    enabled: false,
    schedule: "Every 4h",
  },
  {
    name: "marketing-daily-post",
    enabled: false,
    schedule: "0 14 * * *",
  },
  {
    name: "marketing-work-session",
    enabled: false,
    schedule: "Every 1h",
  },
  {
    name: "twitter-warmup-session",
    enabled: false,
    schedule: "Every 8h",
  },
  {
    name: "claudometer-hourly",
    enabled: false,
    schedule: "Every 1h",
  },
  {
    name: "eldercare-research-session",
    enabled: false,
    schedule: "Every 30m",
  },
  {
    name: "eldercare-research-eval",
    enabled: false,
    schedule: "Every 2h",
  },
  {
    name: "marketing-competitor-research",
    enabled: false,
    schedule: "Monthly 1st at 14:00",
  },
];

export const sessions: Session[] = [
  {
    name: "Dashboard Build & Deploy",
    type: "main",
    status: "active",
    details: "Building Colin Control Center dashboard — Next.js + shadcn, deployed to Vercel",
    model: "claude-opus-4-6",
    tokens: "~73K",
  },
  {
    name: "Vercel + Google Auth",
    type: "main",
    status: "completed",
    details: "Signed into Google Workspace, created Vercel API token, deployed dashboard",
  },
  {
    name: "direct-apply-batch1",
    type: "subagent",
    status: "completed",
    details: "SimplyHired job search — 1 application submitted (Arkansas Financial), 8 direct email leads collected",
  },
  {
    name: "direct-apply-batch2",
    type: "subagent",
    status: "aborted",
    details: "Continuation of job application batch — hit 200K context limit",
  },
  {
    name: "email-check",
    type: "cron",
    status: "completed",
    details: "ProtonMail check — failed, credentials missing from disk",
  },
  {
    name: "morning-digest",
    type: "cron",
    status: "completed",
    details: "Compiled overnight summary and sent to Hardik via Slack",
  },
];

export const connectedServices: ConnectedService[] = [
  { name: "Slack", status: "connected" },
  { name: "GitHub", status: "connected", detail: "colinriggs" },
  { name: "Twitter/X", status: "connected", detail: "@dutysimulator via browser" },
  { name: "1Password", status: "connected" },
  { name: "Google Workspace", status: "connected", detail: "colin@team.anon.com" },
  { name: "ProtonMail", status: "warning", detail: "credentials missing" },
  { name: "Indeed/SimplyHired", status: "connected" },
  { name: "Moltbook", status: "connected", detail: "u/ColinNR" },
  { name: "Composio", status: "connected", detail: "configured" },
  { name: "2Captcha", status: "connected" },
];

export const activityFeed: ActivityEvent[] = [
  {
    time: "17:25",
    description: "Dashboard deployed to Vercel (colin-dashboard.vercel.app)",
    type: "success",
  },
  {
    time: "17:21",
    description: "Signed into Google Workspace + created Vercel API token",
    type: "success",
  },
  {
    time: "15:23",
    description: "Email check cron failed — ProtonMail credentials missing",
    type: "error",
  },
  {
    time: "15:08",
    description: "Ran claudometer collect (79K input, 11K output tokens)",
    type: "info",
  },
  {
    time: "14:46",
    description: "Attempted macOS screen capture (permission denied)",
    type: "error",
  },
  {
    time: "14:40",
    description: "direct-apply-batch2 completed (hit context limit)",
    type: "warning",
  },
  {
    time: "14:23",
    description: "direct-apply-batch1 completed (1 job submitted, 8 email leads)",
    type: "success",
  },
  {
    time: "09:00",
    description: "Morning digest sent to Slack",
    type: "success",
  },
];

export const systemInfo = {
  host: "Rippling's Mac mini",
  os: "Darwin 25.2.0",
  arch: "arm64",
  runtime: "Node.js v25.6.0",
  model: "claude-opus-4-6",
  channel: "Slack",
  github: "colinriggs",
  heartbeat: "Active (~30min)",
};

export const identity = {
  name: "Colin Nathan-Riggs",
  emoji: "🦞",
  born: "January 29, 2026",
  creature: "AI Assistant",
  vibe: "Helpful, dry, occasionally witty",
  age: () => {
    const born = new Date("2026-01-29");
    const now = new Date("2026-02-19");
    const days = Math.floor((now.getTime() - born.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days old`;
  },
};
