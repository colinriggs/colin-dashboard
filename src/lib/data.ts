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
    name: "Main Session",
    type: "main",
    status: "active",
    details: "slack",
    model: "claude-opus-4-6",
    tokens: "~73K",
  },
  {
    name: "direct-apply-batch1",
    type: "subagent",
    status: "completed",
    details: "Job application batch — 1 app submitted, 8 email leads",
  },
  {
    name: "direct-apply-batch2",
    type: "subagent",
    status: "aborted",
    details: "Hit context limit",
  },
  {
    name: "email-check",
    type: "cron",
    status: "completed",
    details: "Cron session",
  },
  {
    name: "morning-digest",
    type: "cron",
    status: "completed",
    details: "Cron session",
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
    description: "direct-apply-batch1 completed (1 job submitted, 8 email leads found)",
    type: "success",
  },
  {
    time: "09:00",
    description: "Morning digest sent to Slack",
    type: "success",
  },
  {
    time: "07:17",
    description: "Email check ran at scheduled time — no urgent messages",
    type: "info",
  },
  {
    time: "00:00",
    description: "Heartbeat active — system healthy",
    type: "info",
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
