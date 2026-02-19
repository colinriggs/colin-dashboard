"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { sessions } from "@/lib/data";
import {
  Layers,
  MessageSquare,
  Bot,
  Clock,
  CircleCheck,
  CircleX,
  CircleDot,
} from "lucide-react";

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
      return <CircleDot className="h-4 w-4 text-green-400" />;
    case "completed":
      return <CircleCheck className="h-4 w-4 text-blue-400" />;
    case "aborted":
      return <CircleX className="h-4 w-4 text-amber-400" />;
    default:
      return <CircleDot className="h-4 w-4 text-muted-foreground" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 text-xs">
          Active
        </Badge>
      );
    case "completed":
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 text-xs">
          Completed
        </Badge>
      );
    case "aborted":
      return (
        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 text-xs">
          Aborted
        </Badge>
      );
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>;
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "main":
      return <MessageSquare className="h-4 w-4" />;
    case "subagent":
      return <Bot className="h-4 w-4" />;
    case "cron":
      return <Clock className="h-4 w-4" />;
    default:
      return <Layers className="h-4 w-4" />;
  }
}

export function Sessions() {
  const activeCount = sessions.filter((s) => s.status === "active").length;

  return (
    <Card className="animate-slide-up stagger-3">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Layers className="h-5 w-5 text-[var(--color-lobster)]" />
            Sessions
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {activeCount} active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.name}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-colors"
            >
              <div className="mt-0.5">
                {getStatusIcon(session.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{session.name}</span>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {getTypeIcon(session.type)}
                    <span className="text-xs">{session.type}</span>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {session.details}
                  {session.model && (
                    <span className="ml-2 text-[var(--color-lobster-light)]">
                      • {session.model}
                    </span>
                  )}
                  {session.tokens && (
                    <span className="ml-1 text-muted-foreground/60">
                      ({session.tokens} tokens)
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
