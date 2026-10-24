"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/ui/Section";
import BodyViewer from "@/components/body3d/BodyViewer";
import { AssessmentPanel } from "@/components/assessment/AssessmentPanel";
import { BodyMapHistory } from "@/components/assessment/BodyMapHistory";
import { useAssessment } from "@/hooks/useAssessment";
import { APP_DESCRIPTION } from "@/constants/app";
import type { SelectedBodyPart } from "@/types/body";
import type { ApiAssessmentResponse, SymptomInterviewAnswers } from "@/types/assessment";
import { submitAssessment } from "@/lib/api";
import { downloadVisitSummary } from "@/lib/visitSummary";
import { ArrowDown, Hand, MapPin, ShieldCheck, Sparkles } from "lucide-react";

export default function HomePage() {
  const [selectedParts, setSelectedParts] = useState<SelectedBodyPart[]>([]);
  const [hasPrivacyConsent, setHasPrivacyConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiAssessmentResponse | null>(null);
  const [interviewAnswers, setInterviewAnswers] = useState<SymptomInterviewAnswers>({});
  const [summaryExportStatus, setSummaryExportStatus] = useState<string | null>(null);
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

  const handleInterviewAnswersChange = (answers: SymptomInterviewAnswers) => {
    setInterviewAnswers(answers);
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

    const interviewLines = [
      interviewAnswers.onset && `Onset: ${interviewAnswers.onset}`,
      interviewAnswers.trend && `Change over time: ${interviewAnswers.trend}`,
      interviewAnswers.sensation && `Sensation: ${interviewAnswers.sensation}`,
    ].filter((line): line is string => Boolean(line));
    const enrichedQuery = interviewLines.length
      ? `${query.trim()}\n\nOptional interview details:\n${interviewLines.map((line) => `- ${line}`).join("\n")}`
      : query.trim();
    if (enrichedQuery.length > 2000) {
      setSubmitError("Shorten the description a little to include the guided interview details (2,000 character limit). ");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await submitAssessment({ ...buildPayload(), query: enrichedQuery });
      setResult(response);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadSummary = () => {
    try {
      downloadVisitSummary({
        selectedParts,
        description: query,
        interview: interviewAnswers,
        guidance: result,
      });
      setSummaryExportStatus("Visit summary downloaded. Review it before sharing.");
    } catch {
      setSummaryExportStatus("Could not create the summary. Please try again.");
    }
  };

  return (
    <>
      <Section className="relative overflow-hidden pb-5 pt-10 sm:pt-14">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] bg-[#123b32] px-6 py-8 text-white shadow-[0_28px_80px_-38px_rgba(18,59,50,0.65)] sm:px-10 sm:py-10 lg:px-14">
            <div className="pointer-events-none absolute -right-12 -top-24 size-80 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-1 top-2 size-56 rounded-full border border-white/10" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-50">
                  <Sparkles className="size-3.5 text-emerald-200" aria-hidden="true" />
                  A calmer way to check in
                </div>
                <h1 className="mt-5 text-3xl font-bold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
                  Put how you feel <span className="text-emerald-200">on the map.</span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/80 sm:text-base">
                  {APP_DESCRIPTION}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:min-w-[300px]">
                {[
                  { icon: MapPin, title: "Mark", detail: "body areas" },
                  { icon: Hand, title: "Describe", detail: "in your words" },
                  { icon: ShieldCheck, title: "Review", detail: "with care" },
                ].map(({ icon: Icon, title, detail }, index) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 sm:p-4">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-white/10 text-emerald-100">
                      <Icon className="size-4" aria-hidden="true" />
                    </div>
                    <p className="mt-3 text-xs font-bold text-white sm:text-sm"><span className="mr-1 text-emerald-200">0{index + 1}</span>{title}</p>
                    <p className="mt-0.5 text-[10px] text-emerald-50/65 sm:text-xs">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section className="pt-5 sm:pt-7">
        <Container>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(390px,0.95fr)] xl:gap-8">
          <div className="flex min-w-0 flex-col gap-5">
            <div className="overflow-hidden rounded-3xl border border-border/90 bg-white p-3 shadow-[0_18px_55px_-38px_rgba(20,43,37,0.38)] sm:p-4">
              <div className="flex items-start justify-between gap-3 px-2 pb-3 pt-1 sm:px-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Step 01 | Body map</p>
                  <h2 className="mt-1 text-lg font-bold tracking-tight text-foreground sm:text-xl">Where are you feeling it?</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary-dark">
                  <MapPin className="size-3.5" aria-hidden="true" /> Interactive
                </span>
              </div>
              <div className="h-[54vh] min-h-[390px] overflow-hidden rounded-[1.35rem] lg:h-[650px]">
                <BodyViewer
                  severities={severities}
                  onSelectionChange={handleSelectionChange}
                  className="relative h-full min-h-[390px] w-full overflow-hidden rounded-[1.35rem] bg-[radial-gradient(ellipse_at_50%_40%,#eef7f2_0%,#e6f0eb_58%,#dce9e2_100%)]"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-2 pb-1 pt-3 text-xs text-muted-foreground sm:px-3">
                <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-primary" /> Select a region to mark it</span>
                <span className="inline-flex items-center gap-1.5"><ArrowDown className="size-3.5" aria-hidden="true" /> Tap again to adjust severity</span>
              </div>
            </div>
            <BodyMapHistory selectedParts={selectedParts} />
          </div>
            <div className="min-w-0">
              <AssessmentPanel
                selectedParts={selectedParts}
                query={query}
                interviewAnswers={interviewAnswers}
                onInterviewAnswersChange={handleInterviewAnswersChange}
                onQueryChange={handleQueryChange}
                onSubmit={handleSubmit}
                onDownloadSummary={handleDownloadSummary}
                hasSummaryContent={selectedParts.length > 0 || Boolean(query.trim())}
                summaryExportStatus={summaryExportStatus}
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
