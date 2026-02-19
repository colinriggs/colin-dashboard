"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { connectedServices } from "@/lib/data";
import {
  Plug,
  Check,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Github,
  Twitter,
  Key,
  Mail,
  Briefcase,
  Globe,
  Puzzle,
  Shield,
} from "lucide-react";

const serviceIcons: Record<string, React.ElementType> = {
  Slack: MessageSquare,
  GitHub: Github,
  "Twitter/X": Twitter,
  "1Password": Key,
  "Google Workspace": Mail,
  ProtonMail: Shield,
  "Indeed/SimplyHired": Briefcase,
  Moltbook: Globe,
  Composio: Puzzle,
  "2Captcha": Shield,
};

function getStatusIndicator(status: string) {
  switch (status) {
    case "connected":
      return (
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <Check className="h-3.5 w-3.5 text-green-400" />
        </div>
      );
    case "warning":
      return (
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-500" />
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
        </div>
      );
    case "disconnected":
      return (
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <XCircle className="h-3.5 w-3.5 text-red-400" />
        </div>
      );
    default:
      return null;
  }
}

export function ConnectedServices() {
  const connectedCount = connectedServices.filter(
    (s) => s.status === "connected"
  ).length;

  return (
    <Card className="animate-slide-up stagger-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plug className="h-5 w-5 text-[var(--color-lobster)]" />
            Connected Services
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {connectedCount}/{connectedServices.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {connectedServices.map((service) => {
            const Icon = serviceIcons[service.name] || Plug;
            return (
              <div
                key={service.name}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${
                  service.status === "connected"
                    ? "bg-muted/20 border-border/30 hover:bg-muted/30"
                    : service.status === "warning"
                    ? "bg-amber-500/5 border-amber-500/20 hover:bg-amber-500/10"
                    : "bg-red-500/5 border-red-500/20"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {service.name}
                    </p>
                    {service.detail && (
                      <p className="text-xs text-muted-foreground truncate">
                        {service.detail}
                      </p>
                    )}
                  </div>
                </div>
                {getStatusIndicator(service.status)}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
