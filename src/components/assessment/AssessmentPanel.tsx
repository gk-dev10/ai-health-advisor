"use client";

import { Info } from "lucide-react";
import type { SelectedBodyPart } from "@/types/body";
import { SeverityCard } from "./SeverityCard";
import { QueryInput } from "./QueryInput";
import { AssessmentSummary } from "./AssessmentSummary";
import { Button } from "@/components/ui/Button";

interface AssessmentPanelProps {
  selectedParts: SelectedBodyPart[];
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  isValid: boolean;
  errors: string[];
}

export function AssessmentPanel({
  selectedParts,
  query,
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
            Tap a body region on the 3D model to select it and set its severity.
          </p>
        </div>
      )}

      {selectedParts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg bg-primary-light/60 px-4 py-3">
            <Info className="size-4 shrink-0 text-primary" />
            <p className="text-xs text-primary-dark">
              Tap a region on the 3D body to select it. Tap again to increase severity (1–5). Tap at maximum severity to deselect.
            </p>
          </div>

          <h3 className="text-sm font-semibold text-foreground">
            Pain Severity Map
          </h3>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {selectedParts.map((part) => (
              <SeverityCard key={part.id} part={part} />
            ))}
          </div>
        </div>
      )}

      <QueryInput value={query} onChange={onQueryChange} />

      <AssessmentSummary
        selectedParts={selectedParts}
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
