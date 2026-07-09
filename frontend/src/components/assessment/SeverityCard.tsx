"use client";

import type { SelectedBodyPart } from "@/types/body";
import { SEVERITY_SCALE, SEVERITY_COLORS } from "@/constants/severityScale";

interface SeverityCardProps {
  part: SelectedBodyPart;
}

export function SeverityCard({ part }: SeverityCardProps) {
  const level = SEVERITY_SCALE.find((s) => s.value === part.severity);
  const color = part.severity ? SEVERITY_COLORS[part.severity] : "#c9cdd6";

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className="inline-block size-3.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-medium text-foreground">
          {part.name}
        </span>
      </div>
      <span className="text-sm text-muted-foreground">
        {level?.label ?? "—"} ({part.severity}/{SEVERITY_SCALE.length})
      </span>
    </div>
  );
}
