"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { callGateway } from "@/lib/gateway";

interface UseGatewayOptions {
  tool: string;
  args?: Record<string, unknown>;
  pollInterval?: number; // ms, 0 = no polling
  enabled?: boolean;
}

interface UseGatewayResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useGateway<T = unknown>({
  tool,
  args = {},
  pollInterval = 0,
  enabled = true,
}: UseGatewayOptions): UseGatewayResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const argsRef = useRef(args);
  argsRef.current = args;

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    try {
      const result = await callGateway<T>(tool, argsRef.current);
      if (result.error) {
        setError(result.error);
      } else {
        setData(result.data);
        setError(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, [tool, enabled]);

  useEffect(() => {
    fetchData();

    if (pollInterval > 0 && enabled) {
      const interval = setInterval(fetchData, pollInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, pollInterval, enabled]);

  return { data, error, loading, lastUpdated, refresh: fetchData };
}

// Hook specifically for exec commands (file contents, directory listings)
export function useExec(
  command: string,
  options?: { pollInterval?: number; enabled?: boolean }
) {
  return useGateway<{ output?: string; stdout?: string; content?: string }>({
    tool: "exec",
    args: { command },
    ...options,
  });
}
