"use client";

import { Header } from "@/components/dashboard/header";
import { SessionsPanel } from "@/components/dashboard/sessions-panel";
import { CronPanel } from "@/components/dashboard/cron-panel";
import { MemoryViewer } from "@/components/dashboard/memory-viewer";
import { ReflectionsPanel } from "@/components/dashboard/reflections-panel";
import { DailyMemory } from "@/components/dashboard/daily-memory";
import { SystemBar } from "@/components/dashboard/system-bar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#060a06] text-emerald-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1800px] mx-auto w-full px-4 py-4 space-y-4">
        {/* Row 1: Sessions (primary, wide) + Cron Jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <SessionsPanel />
          </div>
          <div className="lg:col-span-2">
            <CronPanel />
          </div>
        </div>

        {/* Row 2: Memory Viewer + Daily Log + Reflections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <MemoryViewer />
          <DailyMemory />
          <ReflectionsPanel />
        </div>
      </main>

      <SystemBar />
    </div>
  );
}
