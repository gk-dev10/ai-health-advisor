"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import type { SelectedBodyPart } from "@/types/body";
import type { AssessmentPayload } from "@/types/assessment";

export function useAssessment(selectedParts: SelectedBodyPart[]) {
  const [severities, setSeverities] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    setSeverities((prev) => {
      const cleaned = { ...prev };
      Object.keys(cleaned).forEach((id) => {
        if (!selectedParts.some((p) => p.id === id)) {
          delete cleaned[id];
        }
      });
      return cleaned;
    });
  }, [selectedParts]);

  const updateSeverity = useCallback((id: string, severity: number) => {
    setSeverities((prev) => ({ ...prev, [id]: severity }));
  }, []);

  const buildPayload = useCallback((): AssessmentPayload => {
    return {
      bodyParts: selectedParts
        .filter((p) => p.id in severities)
        .map((p) => ({
          id: p.id,
          severity: severities[p.id],
        })),
      query,
    };
  }, [selectedParts, severities, query]);

  const errors = useMemo(() => {
    const errs: string[] = [];
    if (selectedParts.length === 0) {
      errs.push("Select at least one body region.");
    }
    const missingSeverity = selectedParts.filter((p) => !(p.id in severities));
    if (missingSeverity.length > 0) {
      errs.push("Set severity for all selected regions.");
    }
    if (query.length < 10) {
      errs.push("Query must be at least 10 characters.");
    }
    return errs;
  }, [selectedParts, severities, query]);

  const isValid = errors.length === 0;

  const allHaveSeverity =
    selectedParts.length > 0 && selectedParts.every((p) => p.id in severities);

  const reset = useCallback(() => {
    setSeverities({});
    setQuery("");
  }, []);

  return {
    severities,
    updateSeverity,
    query,
    setQuery,
    buildPayload,
    isValid,
    allHaveSeverity,
    errors,
    reset,
  };
}
