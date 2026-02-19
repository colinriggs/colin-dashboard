"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cronJobs } from "@/lib/data";
import { Clock, Timer, Play, Pause } from "lucide-react";

function formatTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function CronJobs() {
  const enabledCount = cronJobs.filter((j) => j.enabled).length;
  const totalCount = cronJobs.length;

  return (
    <Card className="animate-slide-up stagger-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Timer className="h-5 w-5 text-[var(--color-lobster)]" />
            Cron Jobs
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {enabledCount}/{totalCount} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border/30">
                <TableHead className="text-xs text-muted-foreground font-medium">Job</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium">Status</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium hidden md:table-cell">Schedule</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium hidden lg:table-cell">Last Run</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium hidden lg:table-cell">Next Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cronJobs.map((job) => (
                <TableRow
                  key={job.name}
                  className="border-border/20 hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono text-sm py-2.5">
                    <div className="flex items-center gap-2">
                      {job.enabled ? (
                        <Play className="h-3 w-3 text-green-400 fill-green-400" />
                      ) : (
                        <Pause className="h-3 w-3 text-muted-foreground/40" />
                      )}
                      <span className={job.enabled ? "" : "text-muted-foreground/50"}>
                        {job.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5">
                    {job.enabled ? (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 text-xs">
                        ENABLED
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground/40 border-muted-foreground/20 text-xs">
                        DISABLED
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell py-2.5">
                    <code className="text-xs bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground">
                      {job.schedule}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell py-2.5">
                    {formatTime(job.lastRun)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell py-2.5">
                    {formatTime(job.nextRun)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
