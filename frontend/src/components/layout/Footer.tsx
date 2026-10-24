import { MEDICAL_DISCLAIMER } from "@/constants/app";
import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-muted">
      <Container>
        <div className="flex flex-col gap-4 py-8 text-center text-sm text-muted-foreground">
          <p className="max-w-2xl mx-auto text-xs leading-relaxed">
            {MEDICAL_DISCLAIMER}
          </p>
        </div>
      </Container>
    </footer>
  );
}
