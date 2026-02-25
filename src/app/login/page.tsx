"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const resp = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (resp.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("ACCESS DENIED");
        setPassword("");
      }
    } catch {
      setError("CONNECTION FAILED");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-th-bg flex items-center justify-center relative overflow-hidden">
      <div className="w-full max-w-sm px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-th-text-muted text-sm font-medium mb-1">
            Colin
          </div>
          <div className="text-th-text-secondary text-lg font-semibold">
            Dashboard
          </div>
          <div className="mt-3 h-px bg-gradient-to-r from-transparent via-th-border to-transparent" />
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-th-text-faint text-xs font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-th-card border border-th-border rounded-lg px-4 py-3 text-th-text-secondary text-sm placeholder:text-th-text-faint focus:outline-none focus:border-th-accent focus:ring-1 focus:ring-th-accent-border transition-all"
              placeholder="••••••••"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-th-accent hover:opacity-90 border border-th-accent-border rounded-lg py-3 text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
