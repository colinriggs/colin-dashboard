"use client";

import { useState, useCallback, useEffect } from "react";
import { fetchFile } from "@/lib/gateway";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Brain,
  RefreshCw,
  FileText,
  Heart,
  Ghost,
  Loader2,
} from "lucide-react";

const MEMORY_FILES = [
  {
    id: "memory",
    label: "MEMORY",
    path: "/Users/colinnr/clawd/MEMORY.md",
    icon: Brain,
  },
  {
    id: "soul",
    label: "SOUL",
    path: "/Users/colinnr/clawd/SOUL.md",
    icon: Heart,
  },
  {
    id: "identity",
    label: "IDENTITY",
    path: "/Users/colinnr/clawd/IDENTITY.md",
    icon: Ghost,
  },
  {
    id: "heartbeat",
    label: "HEARTBEAT",
    path: "/Users/colinnr/clawd/HEARTBEAT.md",
    icon: FileText,
  },
] as const;

function extractContent(data: unknown): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  const obj = data as Record<string, unknown>;
  if (typeof obj.output === "string") return obj.output;
  if (typeof obj.stdout === "string") return obj.stdout;
  if (typeof obj.content === "string") return obj.content;
  if (typeof obj.result === "string") return obj.result;
  // Try nested content
  if (obj.content && typeof obj.content === "object") {
    const nested = obj.content as Record<string, unknown>;
    if (typeof nested.output === "string") return nested.output;
    if (typeof nested.text === "string") return nested.text;
  }
  return JSON.stringify(data, null, 2);
}

export function MemoryViewer() {
  const [activeTab, setActiveTab] = useState("memory");
  const [contents, setContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadFile = useCallback(async (id: string, path: string) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
    try {
      // Extract relative path from absolute
      const relativePath = path.replace("/Users/colinnr/clawd/", "");
      const result = await fetchFile(relativePath);
      if (result.error) {
        setErrors((prev) => ({ ...prev, [id]: result.error! }));
      } else if (result.data?.notFound) {
        setContents((prev) => ({ ...prev, [id]: "(file not found)" }));
      } else {
        setContents((prev) => ({ ...prev, [id]: result.data?.content || "" }));
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [id]: err instanceof Error ? err.message : String(err),
      }));
    }
    setLoading((prev) => ({ ...prev, [id]: false }));
  }, []);

  // Load active tab content on mount and tab switch
  useEffect(() => {
    const file = MEMORY_FILES.find((f) => f.id === activeTab);
    if (file && !contents[activeTab]) {
      loadFile(file.id, file.path);
    }
  }, [activeTab, contents, loadFile]);

  const handleRefresh = () => {
    const file = MEMORY_FILES.find((f) => f.id === activeTab);
    if (file) {
      loadFile(file.id, file.path);
    }
  };

  return (
    <div className="rounded-lg border border-emerald-900/30 bg-[#0c120c] overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-950/30 border-b border-emerald-900/20">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-mono font-bold text-emerald-300 uppercase tracking-wide">
            Memory Files
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="text-emerald-600 hover:text-emerald-400 transition-colors"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              loading[activeTab] ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-emerald-900/20">
        {MEMORY_FILES.map((file) => {
          const Icon = file.icon;
          return (
            <button
              key={file.id}
              onClick={() => setActiveTab(file.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-mono uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === file.id
                  ? "border-emerald-500 text-emerald-300 bg-emerald-950/20"
                  : "border-transparent text-emerald-700 hover:text-emerald-500"
              }`}
            >
              <Icon className="h-3 w-3" />
              {file.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <ScrollArea className="h-[350px]">
        <div className="p-4">
          {loading[activeTab] && !contents[activeTab] && (
            <div className="flex items-center justify-center py-12 text-emerald-700">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm font-mono">Loading…</span>
            </div>
          )}

          {errors[activeTab] && (
            <div className="text-center py-8 text-red-500/70 text-sm font-mono">
              ⚠ {errors[activeTab]}
            </div>
          )}

          {contents[activeTab] && (
            <pre className="text-xs font-mono text-emerald-300/80 whitespace-pre-wrap break-words leading-relaxed">
              {contents[activeTab]}
            </pre>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
