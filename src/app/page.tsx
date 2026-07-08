import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { APP_DESCRIPTION } from "@/constants/app";

export default function HomePage() {
  return (
    <>
      <Section className="bg-gradient-to-b from-primary-light/50 to-background">
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

      <Section>
        <Container>
          <Card className="flex items-center justify-center py-24">
            <div className="text-center">
              <p className="text-lg font-medium text-muted-foreground">
                Body Map Module Coming Next
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Interactive body map will be available in the next module.
              </p>
            </div>
          </Card>
        </Container>
      </Section>
    </>
  );
}
