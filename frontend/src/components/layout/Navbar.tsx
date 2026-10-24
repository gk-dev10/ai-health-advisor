"use client";

import { APP_NAME } from "@/constants/app";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";

export function Navbar() {
  const pathname = usePathname();
  const homeActive = pathname === "/";
  const triageActive = pathname === "/triage";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
          <Link href="/" className="flex items-center gap-3" aria-label={`${APP_NAME} home`}>
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">+</span>
            </span>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              {APP_NAME}
            </span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-2">
            <Link
              href="/"
              aria-current={homeActive ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                homeActive
                  ? "bg-primary-light text-primary-dark"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Health advisor
            </Link>
            <Link
              href="/triage"
              aria-current={triageActive ? "page" : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                triageActive
                  ? "bg-primary-light text-primary-dark"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Clinic intake
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
