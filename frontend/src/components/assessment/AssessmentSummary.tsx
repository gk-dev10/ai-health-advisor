"use client";

import type { SelectedBodyPart } from "@/types/body";
import { SEVERITY_SCALE } from "@/constants/severityScale";

interface AssessmentSummaryProps {
  selectedParts: SelectedBodyPart[];
  query: string;
}

export function AssessmentSummary({
  selectedParts,
  query,
}: AssessmentSummaryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Assessment Summary
      </h3>

      {selectedParts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No regions selected. Tap on the 3D body to begin.
        </p>
      )}

      {selectedParts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Selected Regions
          </p>
          <ul className="space-y-1">
            {selectedParts.map((part) => {
              const level = SEVERITY_SCALE.find(
                (s) => s.value === part.severity
              );
              return (
                <li
                  key={part.id}
                  className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm"
                >
                  <span className="font-medium text-foreground">
                    {part.name}
                  </span>
                  <span className="text-muted-foreground">
                    {level?.label ?? "—"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {query.trim().length >= 10 && query.length <= 2000 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Query
          </p>
          <p className="rounded-md bg-muted px-3 py-2 text-sm text-foreground">
            &ldquo;{query}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
