"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { activityFeed } from "@/lib/data";
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
} from "lucide-react";

function getEventIcon(type: string) {
  switch (type) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-400 shrink-0" />;
    case "info":
    default:
      return <Info className="h-4 w-4 text-blue-400 shrink-0" />;
  }
}

function getEventDotColor(type: string) {
  switch (type) {
    case "success":
      return "bg-green-400";
    case "warning":
      return "bg-amber-400";
    case "error":
      return "bg-red-400";
    case "info":
    default:
      return "bg-blue-400";
  }
}

export function ActivityFeed() {
  return (
    <Card className="animate-slide-up stagger-5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="h-5 w-5 text-[var(--color-lobster)]" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[340px] pr-3">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/50" />
            
            <div className="space-y-0">
              {activityFeed.map((event, index) => (
                <div
                  key={index}
                  className="relative flex gap-4 py-3 group"
                >
                  {/* Timeline dot */}
                  <div className="relative z-10 mt-1">
                    <div
                      className={`h-[15px] w-[15px] rounded-full border-2 border-card ${getEventDotColor(
                        event.type
                      )} group-hover:scale-125 transition-transform`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-start gap-2">
                      {getEventIcon(event.type)}
                      <p className="text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground/60 ml-6 mt-0.5 block">
                      {event.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
