import { Container } from "@/components/layout/Container";
import { Section } from "@/components/ui/Section";
import BodyViewer from "@/components/body3d/BodyViewer";
import { APP_DESCRIPTION } from "@/constants/app";

export default function HomePage() {
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
          <div className="h-[70vh] min-h-[480px] w-full">
            <BodyViewer />
          </div>
        </Container>
      </Section>
    </>
  );
}
