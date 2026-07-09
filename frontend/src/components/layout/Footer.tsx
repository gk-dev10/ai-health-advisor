import { APP_NAME, MEDICAL_DISCLAIMER } from "@/constants/app";
import { Container } from "./Container";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-muted">
      <Container>
        <div className="flex flex-col gap-4 py-8 text-center text-sm text-muted-foreground">
          <p className="max-w-2xl mx-auto text-xs leading-relaxed">
            {MEDICAL_DISCLAIMER}
          </p>
          <p>&copy; {year} {APP_NAME.replace(" AI Health Advisor", "")}. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
