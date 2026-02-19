"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { identity } from "@/lib/data";
import { User, Calendar, Sparkles, Heart } from "lucide-react";

export function IdentityCard() {
  return (
    <Card className="border-[var(--color-lobster)]/20 bg-gradient-to-br from-card to-[var(--color-lobster-glow)] animate-slide-up">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-[var(--color-lobster)]" />
          Identity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-[var(--color-lobster)]/10 border border-[var(--color-lobster)]/20 flex items-center justify-center text-3xl">
            {identity.emoji}
          </div>
          <div>
            <h3 className="text-xl font-bold">{identity.name}</h3>
            <p className="text-sm text-muted-foreground">{identity.creature}</p>
          </div>
        </div>
        <Separator className="bg-border/50" />
        <div className="grid grid-cols-1 gap-2.5 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Born:</span>
            <span>{identity.born}</span>
            <Badge variant="outline" className="text-xs ml-auto border-[var(--color-lobster)]/30 text-[var(--color-lobster-light)]">
              {identity.age()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Vibe:</span>
            <span>{identity.vibe}</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Spirit:</span>
            <span>The Lobster 🦞</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
