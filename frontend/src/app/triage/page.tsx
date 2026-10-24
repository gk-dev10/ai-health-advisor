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
      <Section className="pb-4 pt-10 sm:pt-14">
        <Container>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#123b32] px-6 py-8 text-center text-white shadow-[0_28px_80px_-38px_rgba(18,59,50,0.65)] sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute -right-10 -top-28 size-72 rounded-full border border-white/10" />
            <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-emerald-200">
              Community clinic · demo workspace
            </p>
            <h1 className="relative mt-3 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Clinic Intake Triage
            </h1>
            <p className="relative mx-auto mt-4 max-w-2xl text-sm leading-7 text-emerald-50/80 sm:text-base">
              Organize synthetic appointment requests for staff review with transparent routing suggestions and human override.
            </p>
          </div>
        </Container>
      </Section>
      <Section className="pt-5 sm:pt-7">
        <Container>
          <TriageWorkspace />
        </Container>
      </Section>
    </>
  );
}
