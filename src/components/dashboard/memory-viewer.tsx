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

export function MemoryViewer() {
  const [activeTab, setActiveTab] = useState("memory");
  const [contents, setContents] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadFile = useCallback(async (id: string, path: string) => {
    setLoading((prev) => ({ ...prev, [id]: true }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
    try {
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
    <div className="rounded-lg border border-th-border bg-th-card overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-th-panel-header border-b border-th-border">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-semibold text-th-text-secondary">
            Memory Files
          </span>
        </div>
        <button
          onClick={handleRefresh}
          className="text-th-text-faint hover:text-th-text-secondary transition-colors"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              loading[activeTab] ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-th-border">
        {MEMORY_FILES.map((file) => {
          const Icon = file.icon;
          return (
            <button
              key={file.id}
              onClick={() => setActiveTab(file.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === file.id
                  ? "border-th-accent text-th-text-secondary bg-th-hover"
                  : "border-transparent text-th-text-faint hover:text-th-text-secondary"
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
            <div className="flex items-center justify-center py-12 text-th-text-faint">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-sm">Loading…</span>
            </div>
          )}

          {errors[activeTab] && (
            <div className="text-center py-8 text-red-500/70 text-sm">
              ⚠ {errors[activeTab]}
            </div>
          )}

          {contents[activeTab] && (
            <pre className="text-xs font-mono text-th-text-muted whitespace-pre-wrap break-words leading-relaxed">
              {contents[activeTab]}
            </pre>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
