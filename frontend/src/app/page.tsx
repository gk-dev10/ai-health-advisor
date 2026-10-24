"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/ui/Section";
import BodyViewer from "@/components/body3d/BodyViewer";
import { AssessmentPanel } from "@/components/assessment/AssessmentPanel";
import { useAssessment } from "@/hooks/useAssessment";
import { APP_DESCRIPTION } from "@/constants/app";
import type { SelectedBodyPart } from "@/types/body";
import type { ApiAssessmentResponse } from "@/types/assessment";
import { submitAssessment } from "@/lib/api";

export default function HomePage() {
  const [selectedParts, setSelectedParts] = useState<SelectedBodyPart[]>([]);
  const [hasPrivacyConsent, setHasPrivacyConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiAssessmentResponse | null>(null);
  const { query, setQuery, buildPayload, isValid, errors } =
    useAssessment(selectedParts);

  const handleSelectionChange = (selection: SelectedBodyPart[]) => {
    setSelectedParts(selection);
    setResult(null);
    setSubmitError(null);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setResult(null);
    setSubmitError(null);
  };

  const severities = useMemo(
    () =>
      Object.fromEntries(
        selectedParts.map((p) => [p.id, p.severity ?? 1])
      ),
    [selectedParts]
  );

  const handleSubmit = async () => {
    if (!isValid || !hasPrivacyConsent || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setResult(null);
    try {
      const response = await submitAssessment(buildPayload());
      setResult(response);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Section className="bg-gradient-to-b from-primary-light/50 to-background pb-0">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Body Map AI Health Advisor
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {APP_DESCRIPTION}
            </p>
          </div>
        </Container>
      </Section>

      <Section className="pt-6">
        <Container>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="h-[60vh] min-h-[420px] lg:h-[75vh] lg:w-1/2">
              <BodyViewer
                severities={severities}
                onSelectionChange={handleSelectionChange}
              />
            </div>
            <div className="lg:w-1/2">
              <AssessmentPanel
                selectedParts={selectedParts}
                query={query}
                onQueryChange={handleQueryChange}
                onSubmit={handleSubmit}
                isValid={isValid}
                errors={errors}
                isSubmitting={isSubmitting}
                hasPrivacyConsent={hasPrivacyConsent}
                onPrivacyConsentChange={setHasPrivacyConsent}
                result={result}
                submitError={submitError}
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
