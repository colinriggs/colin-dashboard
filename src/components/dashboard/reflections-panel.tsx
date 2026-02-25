"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchFile, listFiles } from "@/lib/gateway";
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
      const result = await listFiles("reflections");
      if (result.error) {
        setError(result.error);
      } else {
        const fileList = (result.data?.files || [])
          .filter((f: string) => f.endsWith(".md"))
          .map((f: string) => {
            const match = f.match(/(\d{4}-\d{2}-\d{2})\.md/);
            return match ? { name: f, date: match[1] } : null;
          })
          .filter(Boolean) as ReflectionFile[];
        fileList.sort((a, b) => b.date.localeCompare(a.date));
        setFiles(fileList);
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
      const result = await fetchFile(`reflections/${filename}`);
      if (result.error) {
        setFileContent(`Error: ${result.error}`);
      } else {
        setFileContent(result.data?.content || "(empty)");
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
    <div className="rounded-lg border border-th-border bg-th-card overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-th-panel-header border-b border-th-border">
        <div className="flex items-center gap-2">
          {selectedFile ? (
            <button
              onClick={() => {
                setSelectedFile(null);
                setFileContent("");
              }}
              className="text-th-text-muted hover:text-th-text-secondary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <BookOpen className="h-4 w-4 text-th-accent" />
          )}
          <span className="text-sm font-semibold text-th-text-secondary">
            {selectedFile
              ? `Reflection: ${selectedFile.replace(".md", "")}`
              : "Reflections"}
          </span>
        </div>
        <button
          onClick={selectedFile ? () => loadFile(selectedFile) : loadFiles}
          className="text-th-text-faint hover:text-th-text-secondary transition-colors"
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
          <div className="p-4">
            {contentLoading ? (
              <div className="flex items-center justify-center py-12 text-th-text-faint">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : (
              <pre className="text-xs font-mono text-th-text-muted whitespace-pre-wrap break-words leading-relaxed">
                {fileContent}
              </pre>
            )}
          </div>
        ) : (
          <div className="p-2">
            {loading && (
              <div className="flex items-center justify-center py-12 text-th-text-faint">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm">Loading…</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-500/70 text-sm">
                ⚠ {error}
              </div>
            )}

            {!loading && files.length === 0 && !error && (
              <div className="text-center py-8 text-th-text-faint text-sm">
                No reflections found
              </div>
            )}

            {files.map((file) => (
              <button
                key={file.name}
                onClick={() => loadFile(file.name)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-th-hover transition-colors text-left group"
              >
                <Calendar className="h-3.5 w-3.5 text-th-accent/50 shrink-0" />
                <span className="text-xs font-mono text-th-text-secondary flex-1">
                  {file.date}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-th-icon-muted group-hover:text-th-text-muted transition-colors" />
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
