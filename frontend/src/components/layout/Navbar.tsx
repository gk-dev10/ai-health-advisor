import { APP_NAME } from "@/constants/app";
import { Container } from "./Container";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-white">+</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            {APP_NAME}
          </span>
        </div>
      </Container>
    </header>
  );
}
