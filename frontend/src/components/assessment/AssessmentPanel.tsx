"use client";

import { ChevronDown, Download, Info } from "lucide-react";
import type { SelectedBodyPart } from "@/types/body";
import type { SymptomInterviewAnswers } from "@/types/assessment";
import { SEVERITY_SCALE, SEVERITY_COLORS } from "@/constants/severityScale";
import { SeverityCard } from "./SeverityCard";
import { QueryInput } from "./QueryInput";
import { GuidedSymptomInterview } from "./GuidedSymptomInterview";
import { AssessmentSummary } from "./AssessmentSummary";
import { Button } from "@/components/ui/Button";
import type { ApiAssessmentResponse } from "@/types/assessment";

interface AssessmentPanelProps {
  selectedParts: SelectedBodyPart[];
  query: string;
  interviewAnswers: SymptomInterviewAnswers;
  onInterviewAnswersChange: (answers: SymptomInterviewAnswers) => void;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  onDownloadSummary: () => void;
  hasSummaryContent: boolean;
  summaryExportStatus: string | null;
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
  interviewAnswers,
  onInterviewAnswersChange,
  onQueryChange,
  onSubmit,
  onDownloadSummary,
  hasSummaryContent,
  summaryExportStatus,
  isValid,
  errors,
  isSubmitting,
  hasPrivacyConsent,
  onPrivacyConsentChange,
  result,
  submitError,
}: AssessmentPanelProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-border/90 bg-white p-5 shadow-[0_18px_55px_-38px_rgba(20,43,37,0.38)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Step 02 | Your notes</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">Describe what you&apos;re noticing</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">A few details can make your summary easier to review.</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          {selectedParts.length} region{selectedParts.length === 1 ? "" : "s"}
        </span>
      </div>

      <details className="group rounded-2xl border border-border/80 bg-muted/45">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-foreground marker:hidden">
          <span className="flex items-center justify-between gap-3">Severity guide <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" /></span>
        </summary>
        <div className="space-y-2 border-t border-border/80 px-4 py-3">
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
      </details>

      {selectedParts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary-light/35 p-4">
          <p className="text-sm font-semibold text-foreground">Start by choosing a body region</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Your selected areas and severity will appear here for review.</p>
        </div>
      )}

      {selectedParts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-xl border border-primary/10 bg-primary-light/55 px-4 py-3">
            <Info className="size-4 shrink-0 text-primary" />
            <p className="text-xs text-primary-dark">
              Tap a region on the 3D body to select it. Tap again to increase severity (1–5). Tap at maximum severity to deselect.
            </p>
          </div>

          <h3 className="text-sm font-semibold text-foreground">
            Selected regions
          </h3>

          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {selectedParts.map((part) => (
              <SeverityCard key={part.id} part={part} />
            ))}
          </div>
        </div>
      )}

      <QueryInput value={query} onChange={onQueryChange} />

      <GuidedSymptomInterview value={interviewAnswers} onChange={onInterviewAnswersChange} />

      <AssessmentSummary
        selectedParts={selectedParts}
        query={query}
        interviewAnswers={interviewAnswers}
      />

      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onDownloadSummary}
          disabled={!hasSummaryContent}
        >
          <Download className="size-4" aria-hidden="true" />
          Download visit summary
        </Button>
        {summaryExportStatus && <p role="status" className="text-xs text-emerald-800">{summaryExportStatus}</p>}
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={hasPrivacyConsent}
          onChange={(event) => onPrivacyConsentChange(event.target.checked)}
          className="mt-0.5 size-4 shrink-0 accent-primary"
        />
        <span>
          Selected body regions, description, and interview answers are sent to Google Gemini. Do not include identifying details.
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
          className="space-y-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-light/55 to-white p-5 shadow-sm sm:p-6"
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
        className="w-full py-4 text-base shadow-lg shadow-primary/20"
      >
        {isSubmitting ? "Generating guidance..." : "Analyze Assessment"}
      </Button>
    </div>
  );
}
