"use client";

import { APP_NAME } from "@/constants/app";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./Container";
import { HeartPulse, Sparkles } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const homeActive = pathname === "/";
  const triageActive = pathname === "/triage";

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 shadow-[0_8px_30px_-24px_rgba(20,43,37,0.45)] backdrop-blur-xl">
      <Container>
        <div className="flex min-h-[76px] flex-wrap items-center justify-between gap-3 py-3">
          <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label={`${APP_NAME} home`}>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform group-hover:-rotate-3 group-hover:scale-105">
              <HeartPulse className="size-5" strokeWidth={2.4} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-tight text-foreground sm:text-base">{APP_NAME}</span>
              <span className="mt-0.5 hidden items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:flex">
                <Sparkles className="size-3 text-primary" aria-hidden="true" /> Thoughtful health support
              </span>
            </span>
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-1 rounded-2xl border border-border/80 bg-white/75 p-1 shadow-sm">
            <Link
              href="/"
              aria-current={homeActive ? "page" : undefined}
              className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
                homeActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Health advisor
            </Link>
            <Link
              href="/triage"
              aria-current={triageActive ? "page" : undefined}
              className={`rounded-xl px-3 py-2.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm ${
                triageActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
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
