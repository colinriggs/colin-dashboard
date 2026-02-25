// Client-side helper to call the Gateway proxy API route

export interface GatewayResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

export async function callGateway<T = unknown>(
  tool: string,
  args: Record<string, unknown> = {}
): Promise<GatewayResponse<T>> {
  try {
    const resp = await fetch("/api/gateway", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, args }),
    });

    const json = await resp.json();

    if (!resp.ok) {
      return { data: null, error: json.error || `HTTP ${resp.status}` };
    }

    return { data: json as T, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { data: null, error: message };
  }
}

// Typed helpers for common operations

export async function fetchSessions(activeMinutes = 120, messageLimit = 2) {
  return callGateway("sessions_list", { activeMinutes, messageLimit });
}

export async function fetchSessionStatus() {
  return callGateway("session_status");
}

export async function fetchCronJobs() {
  return callGateway("cron", { action: "list" });
}

export async function toggleCronJob(jobId: string, enabled: boolean) {
  return callGateway("cron", {
    action: "update",
    jobId,
    patch: { enabled },
  });
}

export async function deleteCronJob(jobId: string) {
  return callGateway("cron", { action: "remove", jobId });
}

export async function addCronJob(job: {
  text: string;
  schedule: string;
  model?: string;
}) {
  return callGateway("cron", { action: "add", job });
}

export async function runCronJob(jobId: string) {
  return callGateway("cron", { action: "run", jobId });
}

export async function execCommand(command: string) {
  return callGateway("exec", { command });
}

export async function fetchFile(path: string) {
  return execCommand(`cat ${path}`);
}

export async function listDirectory(path: string) {
  return execCommand(`ls -la ${path}`);
}
