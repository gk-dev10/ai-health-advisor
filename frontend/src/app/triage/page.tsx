import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/ui/Section";
import { TriageWorkspace } from "@/components/triage/TriageWorkspace";

export const metadata: Metadata = {
  title: "Clinic Intake Triage | Body Map AI Health Advisor",
  description:
    "Synthetic appointment intake and staff routing review prototype. Not for diagnosis or real patient data.",
};

export default function TriagePage() {
  return (
    <>
      <Section className="bg-gradient-to-b from-primary-light/50 to-background pb-0">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Community clinic demo
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Clinic Intake Triage
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Organize synthetic appointment requests for staff review with transparent routing suggestions and human override.
            </p>
          </div>
        </Container>
      </Section>
      <Section className="pt-8">
        <Container>
          <TriageWorkspace />
        </Container>
      </Section>
    </>
  );
}
