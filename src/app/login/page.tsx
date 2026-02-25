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
    <div className="min-h-screen bg-[#060a06] flex items-center justify-center font-mono relative overflow-hidden">
      {/* Scanline overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-50"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.015) 2px, rgba(0,255,0,0.015) 4px)",
        }}
      />

      <div className="w-full max-w-sm px-6">
        {/* Terminal header */}
        <div className="text-center mb-8">
          <div className="text-emerald-500/60 text-xs tracking-[0.3em] mb-2">
            ▲ COLIN ATC ▲
          </div>
          <div className="text-emerald-400 text-lg tracking-widest">
            TOWER ACCESS
          </div>
          <div className="mt-3 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-emerald-500/50 text-xs tracking-wider mb-2">
              AUTHORIZATION CODE
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-emerald-500/30 rounded px-4 py-3 text-emerald-400 font-mono text-sm tracking-wider placeholder:text-emerald-500/20 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              placeholder="••••••••"
              autoFocus
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-400 text-xs tracking-wider text-center animate-pulse">
              ⚠ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-emerald-500/10 border border-emerald-500/30 rounded py-3 text-emerald-400 text-sm tracking-widest hover:bg-emerald-500/20 hover:border-emerald-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {loading ? "AUTHENTICATING..." : "ENTER TOWER"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-4" />
          <div className="text-emerald-500/20 text-[10px] tracking-widest">
            AUTHORIZED PERSONNEL ONLY
          </div>
        </div>
      </div>
    </div>
  );
}
