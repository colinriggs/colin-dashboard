"use client";

import { useState, useEffect, useCallback } from "react";
import { callGateway } from "@/lib/gateway";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen,
  RefreshCw,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Calendar,
} from "lucide-react";

interface ReflectionFile {
  name: string;
  date: string;
}

function extractContent(data: unknown): string {
  if (!data) return "";
  if (typeof data === "string") return data;
  const obj = data as Record<string, unknown>;
  if (typeof obj.output === "string") return obj.output;
  if (typeof obj.stdout === "string") return obj.stdout;
  if (typeof obj.content === "string") return obj.content;
  if (typeof obj.result === "string") return obj.result;
  if (obj.content && typeof obj.content === "object") {
    const nested = obj.content as Record<string, unknown>;
    if (typeof nested.output === "string") return nested.output;
  }
  return JSON.stringify(data, null, 2);
}

function parseReflectionList(output: string): ReflectionFile[] {
  const files: ReflectionFile[] = [];
  const lines = output.split("\n");
  for (const line of lines) {
    // Match markdown files like 2026-02-24.md
    const match = line.match(/(\d{4}-\d{2}-\d{2})\.md/);
    if (match) {
      files.push({ name: `${match[1]}.md`, date: match[1] });
    }
  }
  // Sort newest first
  files.sort((a, b) => b.date.localeCompare(a.date));
  return files;
}

export function ReflectionsPanel() {
  const [files, setFiles] = useState<ReflectionFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await callGateway("exec", {
        command: "ls -la /Users/colinnr/clawd/reflections/",
      });
      if (result.error) {
        setError(result.error);
      } else {
        const output = extractContent(result.data);
        setFiles(parseReflectionList(output));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setLoading(false);
  }, []);

  const loadFile = useCallback(async (filename: string) => {
    setContentLoading(true);
    setSelectedFile(filename);
    try {
      const result = await callGateway("exec", {
        command: `cat "/Users/colinnr/clawd/reflections/${filename}"`,
      });
      if (result.error) {
        setFileContent(`Error: ${result.error}`);
      } else {
        setFileContent(extractContent(result.data));
      }
    } catch (err) {
      setFileContent(
        `Error: ${err instanceof Error ? err.message : String(err)}`
      );
    }
    setContentLoading(false);
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return (
    <div className="rounded-lg border border-emerald-900/30 bg-[#0c120c] overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-950/30 border-b border-emerald-900/20">
        <div className="flex items-center gap-2">
          {selectedFile ? (
            <button
              onClick={() => {
                setSelectedFile(null);
                setFileContent("");
              }}
              className="text-emerald-500 hover:text-emerald-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <BookOpen className="h-4 w-4 text-blue-400" />
          )}
          <span className="text-sm font-mono font-bold text-emerald-300 uppercase tracking-wide">
            {selectedFile
              ? `Reflection: ${selectedFile.replace(".md", "")}`
              : "Reflections"}
          </span>
        </div>
        <button
          onClick={selectedFile ? () => loadFile(selectedFile) : loadFiles}
          className="text-emerald-600 hover:text-emerald-400 transition-colors"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${
              loading || contentLoading ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <ScrollArea className="h-[300px]">
        {selectedFile ? (
          /* File viewer */
          <div className="p-4">
            {contentLoading ? (
              <div className="flex items-center justify-center py-12 text-emerald-700">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-mono">Loading…</span>
              </div>
            ) : (
              <pre className="text-xs font-mono text-emerald-300/80 whitespace-pre-wrap break-words leading-relaxed">
                {fileContent}
              </pre>
            )}
          </div>
        ) : (
          /* File list */
          <div className="p-2">
            {loading && (
              <div className="flex items-center justify-center py-12 text-emerald-700">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-mono">Loading…</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-500/70 text-sm font-mono">
                ⚠ {error}
              </div>
            )}

            {!loading && files.length === 0 && !error && (
              <div className="text-center py-8 text-emerald-800 text-sm font-mono">
                No reflections found
              </div>
            )}

            {files.map((file) => (
              <button
                key={file.name}
                onClick={() => loadFile(file.name)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-emerald-950/30 transition-colors text-left group"
              >
                <Calendar className="h-3.5 w-3.5 text-blue-500/50 shrink-0" />
                <span className="text-xs font-mono text-emerald-300 flex-1">
                  {file.date}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-emerald-800 group-hover:text-emerald-500 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
