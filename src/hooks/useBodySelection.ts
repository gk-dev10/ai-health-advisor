"use client";

import { useCallback, useMemo, useState } from "react";
import type { SelectedBodyPart } from "@/types/body";

export interface UseBodySelectionResult {
  selectedParts: SelectedBodyPart[];
  selectedIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string, name: string) => void;
  clearSelection: () => void;
  hoveredId: string | null;
  hoveredName: string | null;
  setHovered: (id: string | null, name: string | null) => void;
}

const MAX_SEVERITY = 5;

export function useBodySelection(): UseBodySelectionResult {
  const [selectedParts, setSelectedParts] = useState<SelectedBodyPart[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const selectedIds = useMemo(() => new Set(selectedParts.map((p) => p.id)), [selectedParts]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const toggleSelection = useCallback((id: string, name: string) => {
    setSelectedParts((prev) => {
      const existing = prev.find((p) => p.id === id);
      if (!existing) {
        return [...prev, { id, name, severity: 1 }];
      }
      const current = existing.severity ?? 1;
      if (current >= MAX_SEVERITY) {
        return prev.filter((p) => p.id !== id);
      }
      return prev.map((p) =>
        p.id === id ? { ...p, severity: (current + 1) as 1 | 2 | 3 | 4 | 5 } : p
      );
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedParts([]), []);

  const setHovered = useCallback((id: string | null, name: string | null) => {
    setHoveredId(id);
    setHoveredName(name);
  }, []);

  return {
    selectedParts,
    selectedIds,
    isSelected,
    toggleSelection,
    clearSelection,
    hoveredId,
    hoveredName,
    setHovered,
  };
}
