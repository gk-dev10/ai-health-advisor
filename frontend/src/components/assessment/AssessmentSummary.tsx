"use client";

import type { SelectedBodyPart } from "@/types/body";
import type { SymptomInterviewAnswers } from "@/types/assessment";
import { SEVERITY_SCALE } from "@/constants/severityScale";

interface AssessmentSummaryProps {
  selectedParts: SelectedBodyPart[];
  query: string;
  interviewAnswers: SymptomInterviewAnswers;
}

export function AssessmentSummary({
  selectedParts,
  query,
  interviewAnswers,
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

      {Object.values(interviewAnswers).some(Boolean) && (
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Guided interview details
          </p>
          <ul className="space-y-1 rounded-md bg-muted px-3 py-2 text-sm text-foreground">
            {interviewAnswers.onset && <li>Onset: {interviewAnswers.onset}</li>}
            {interviewAnswers.trend && <li>Change over time: {interviewAnswers.trend}</li>}
            {interviewAnswers.sensation && <li>Sensation: {interviewAnswers.sensation}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
