"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/ui/Section";
import BodyViewer from "@/components/body3d/BodyViewer";
import { AssessmentPanel } from "@/components/assessment/AssessmentPanel";
import { useAssessment } from "@/hooks/useAssessment";
import { APP_DESCRIPTION } from "@/constants/app";
import type { SelectedBodyPart } from "@/types/body";

export default function HomePage() {
  const [selectedParts, setSelectedParts] = useState<SelectedBodyPart[]>([]);
  const { query, setQuery, buildPayload, isValid, errors } =
    useAssessment(selectedParts);

  const severities = useMemo(
    () =>
      Object.fromEntries(
        selectedParts.map((p) => [p.id, p.severity ?? 1])
      ),
    [selectedParts]
  );

  const handleSubmit = () => {
    const payload = buildPayload();
    console.log("Assessment Payload:", JSON.stringify(payload, null, 2));
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
                onSelectionChange={setSelectedParts}
              />
            </div>
            <div className="lg:w-1/2">
              <AssessmentPanel
                selectedParts={selectedParts}
                query={query}
                onQueryChange={setQuery}
                onSubmit={handleSubmit}
                isValid={isValid}
                errors={errors}
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
