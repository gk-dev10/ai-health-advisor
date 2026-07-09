"use client";

import type { SelectedBodyPart } from "@/types/body";
import { SEVERITY_SCALE } from "@/constants/severityScale";

interface AssessmentSummaryProps {
  selectedParts: SelectedBodyPart[];
  severities: Record<string, number>;
  query: string;
}

export function AssessmentSummary({
  selectedParts,
  severities,
  query,
}: AssessmentSummaryProps) {
  const labeledParts = selectedParts.filter((p) => p.id in severities);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">
        Assessment Summary
      </h3>

      {selectedParts.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No regions selected. Click on the 3D body to begin.
        </p>
      )}

      {labeledParts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Selected Regions
          </p>
          <ul className="space-y-1">
            {labeledParts.map((part) => {
              const level = SEVERITY_SCALE.find(
                (s) => s.value === severities[part.id]
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

      {selectedParts.filter((p) => !(p.id in severities)).length > 0 && (
        <p className="text-xs text-amber-600">
          {selectedParts.filter((p) => !(p.id in severities)).length} region
          {selectedParts.filter((p) => !(p.id in severities)).length === 1
            ? ""
            : "s"}{" "}
          still need severity assigned.
        </p>
      )}

      {query.length >= 10 && query.length <= 2000 && (
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
