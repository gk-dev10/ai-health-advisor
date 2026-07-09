"use client";

import type { SelectedBodyPart } from "@/types/body";
import { SeverityCard } from "./SeverityCard";
import { QueryInput } from "./QueryInput";
import { AssessmentSummary } from "./AssessmentSummary";
import { Button } from "@/components/ui/Button";

interface AssessmentPanelProps {
  selectedParts: SelectedBodyPart[];
  severities: Record<string, number>;
  query: string;
  onSeverityChange: (id: string, severity: number) => void;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  isValid: boolean;
  errors: string[];
}

export function AssessmentPanel({
  selectedParts,
  severities,
  query,
  onSeverityChange,
  onQueryChange,
  onSubmit,
  isValid,
  errors,
}: AssessmentPanelProps) {
  return (
    <div className="space-y-6">
      {selectedParts.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <p className="text-sm text-muted-foreground">
            Select body regions on the 3D model to assign severity levels.
          </p>
        </div>
      )}

      {selectedParts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            Pain Severity
          </h3>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {selectedParts.map((part) => (
              <SeverityCard
                key={part.id}
                part={part}
                severity={severities[part.id]}
                onChange={onSeverityChange}
              />
            ))}
          </div>
        </div>
      )}

      <QueryInput value={query} onChange={onQueryChange} />

      <AssessmentSummary
        selectedParts={selectedParts}
        severities={severities}
        query={query}
      />

      {errors.length > 0 && (
        <div className="space-y-1 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-600">
              {err}
            </p>
          ))}
        </div>
      )}

      <Button
        variant="primary"
        disabled={!isValid}
        onClick={onSubmit}
        className="w-full"
      >
        Analyze Assessment
      </Button>
    </div>
  );
}
