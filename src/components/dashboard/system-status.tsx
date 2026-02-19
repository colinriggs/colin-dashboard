"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { systemInfo } from "@/lib/data";
import {
  Server,
  Cpu,
  Globe,
  Github,
  HeartPulse,
  Monitor,
  Hash,
  MessageSquare,
} from "lucide-react";

const statusItems = [
  {
    icon: Server,
    label: "Host",
    value: systemInfo.host,
    sub: `${systemInfo.os} (${systemInfo.arch})`,
  },
  {
    icon: Cpu,
    label: "Runtime",
    value: systemInfo.runtime,
  },
  {
    icon: Hash,
    label: "Model",
    value: systemInfo.model,
  },
  {
    icon: MessageSquare,
    label: "Channel",
    value: systemInfo.channel,
  },
  {
    icon: Github,
    label: "GitHub",
    value: systemInfo.github,
    badge: "auth",
  },
  {
    icon: Monitor,
    label: "Heartbeat",
    value: systemInfo.heartbeat,
    badge: "active",
  },
];

export function SystemStatus() {
  return (
    <Card className="animate-slide-up stagger-1">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-[var(--color-lobster)]" />
          System Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.value}</span>
                {item.badge && (
                  <Badge
                    variant="outline"
                    className="text-[10px] border-green-500/30 text-green-400 px-1.5 py-0"
                  >
                    {item.badge === "auth" ? "✓ auth" : "✓ active"}
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {statusItems[0].sub && (
            <p className="text-xs text-muted-foreground/60 -mt-1">
              {statusItems[0].sub}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
