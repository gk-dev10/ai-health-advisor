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

export function useBodySelection(): UseBodySelectionResult {
  const [selectedParts, setSelectedParts] = useState<SelectedBodyPart[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredName, setHoveredName] = useState<string | null>(null);

  const selectedIds = useMemo(() => new Set(selectedParts.map((p) => p.id)), [selectedParts]);

  const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

  const toggleSelection = useCallback((id: string, name: string) => {
    setSelectedParts((prev) => {
      const exists = prev.some((p) => p.id === id);
      if (exists) {
        return prev.filter((p) => p.id !== id);
      }
      return [...prev, { id, name }];
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
