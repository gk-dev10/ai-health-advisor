"use client";

import { Info } from "lucide-react";
import type { SelectedBodyPart } from "@/types/body";
import { SEVERITY_SCALE, SEVERITY_COLORS } from "@/constants/severityScale";
import { SeverityCard } from "./SeverityCard";
import { QueryInput } from "./QueryInput";
import { AssessmentSummary } from "./AssessmentSummary";
import { Button } from "@/components/ui/Button";
import type { ApiAssessmentResponse } from "@/types/assessment";

interface AssessmentPanelProps {
  selectedParts: SelectedBodyPart[];
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  isValid: boolean;
  errors: string[];
  isSubmitting: boolean;
  hasPrivacyConsent: boolean;
  onPrivacyConsentChange: (checked: boolean) => void;
  result: ApiAssessmentResponse | null;
  submitError: string | null;
}

export function AssessmentPanel({
  selectedParts,
  query,
  onQueryChange,
  onSubmit,
  isValid,
  errors,
  isSubmitting,
  hasPrivacyConsent,
  onPrivacyConsentChange,
  result,
  submitError,
}: AssessmentPanelProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-3 text-xs font-semibold text-foreground uppercase tracking-wider">
          Severity Reference
        </h3>
        <div className="space-y-2">
          {SEVERITY_SCALE.map((level) => {
            const color = SEVERITY_COLORS[level.value];
            return (
              <div key={level.value} className="flex items-start gap-2.5">
                <span
                  className="mt-1 inline-block size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0">
                  <span
                    className="text-xs font-medium"
                    style={{ color }}
                  >
                    {level.value}. {level.label}
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {level.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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

      <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={hasPrivacyConsent}
          onChange={(event) => onPrivacyConsentChange(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <span>
          I understand that my selected body regions and symptom description will be sent to
          Google Gemini to generate this guidance. I will not include identifying details.
        </span>
      </label>

      {submitError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      {result && (
        <section
          aria-live="polite"
          className="space-y-4 rounded-xl border border-primary/20 bg-card p-5 shadow-sm"
        >
          <div>
            <h3 className="text-base font-semibold text-foreground">AI-generated guidance</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {result.guidance.summary}
            </p>
          </div>

          {result.guidance.suggestedSteps.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground">Possible next steps</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.guidance.suggestedSteps.map((step, index) => (
                  <li key={`${index}-${step}`}>{step}</li>
                ))}
              </ul>
            </div>
          )}

          {result.guidance.followUpQuestions.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground">Questions to consider</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.guidance.followUpQuestions.map((question, index) => (
                  <li key={`${index}-${question}`}>{question}</li>
                ))}
              </ul>
            </div>
          )}

          {result.guidance.seekCareIf.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground">When to seek care</h4>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {result.guidance.seekCareIf.map((situation, index) => (
                  <li key={`${index}-${situation}`}>{situation}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
            {result.disclaimer}
          </p>
        </section>
      )}

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
        disabled={!isValid || !hasPrivacyConsent || isSubmitting}
        onClick={onSubmit}
        className="w-full"
      >
        {isSubmitting ? "Generating guidance..." : "Analyze Assessment"}
      </Button>
    </div>
  );
}
