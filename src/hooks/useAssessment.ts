"use client";

import { useState, useCallback, useMemo } from "react";
import type { SelectedBodyPart } from "@/types/body";
import type { AssessmentPayload } from "@/types/assessment";

export function useAssessment(selectedParts: SelectedBodyPart[]) {
  const [query, setQuery] = useState("");

  const buildPayload = useCallback((): AssessmentPayload => {
    return {
      bodyParts: selectedParts.map((p) => ({
        id: p.id,
        severity: p.severity ?? 1,
      })),
      query,
    };
  }, [selectedParts, query]);

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (selectedParts.length === 0) {
      errs.push("Select at least one body region.");
    }
    if (query.length < 10) {
      errs.push("Query must be at least 10 characters.");
    }
    return errs;
  }, [selectedParts, query]);

  const isValid = errors.length === 0;

  const reset = useCallback(() => {
    setQuery("");
  }, []);

  return { query, setQuery, buildPayload, isValid, errors, reset };
}
