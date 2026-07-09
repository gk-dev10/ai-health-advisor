"use client";

import { Suspense, useCallback, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import OrbitScene from "./OrbitScene";
import Tooltip from "./Tooltip";
import { useBodySelection } from "@/hooks/useBodySelection";
import type { SelectedBodyPart } from "@/types/body";

export interface BodyViewerProps {
  onSelectionChange?: (selection: SelectedBodyPart[]) => void;
  className?: string;
}

export default function BodyViewer({ onSelectionChange, className }: BodyViewerProps) {
  const { selectedParts, selectedIds, toggleSelection, clearSelection, hoveredName, setHovered } =
    useBodySelection();

  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const handleSelect = useCallback(
    (id: string, name: string) => {
      toggleSelection(id, name);
      const exists = selectedParts.some((p) => p.id === id);
      const next = exists ? selectedParts.filter((p) => p.id !== id) : [...selectedParts, { id, name }];
      onSelectionChange?.(next);
    },
    [selectedParts, toggleSelection, onSelectionChange]
  );

  const handleClearAll = useCallback(() => {
    clearSelection();
    onSelectionChange?.([]);
  }, [clearSelection, onSelectionChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      className={
        className ??
        "relative h-full min-h-[420px] w-full overflow-hidden rounded-xl bg-gradient-to-b from-slate-100 to-slate-200"
      }
      role="application"
      aria-label="Interactive 3D human body viewer. Click a body region to select it. Drag to rotate, right-click drag or two-finger drag to pan, scroll to zoom."
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.3, 2.6], fov: 40, near: 0.1, far: 20 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <OrbitScene selectedIds={selectedIds} onSelect={handleSelect} onHover={setHovered} />
        </Suspense>
      </Canvas>

      <Tooltip name={hoveredName} x={pointer.x} y={pointer.y} />

      {selectedParts.length > 0 && (
        <button
          type="button"
          onClick={handleClearAll}
          className="absolute bottom-4 right-4 rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-md ring-1 ring-slate-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Clear all ({selectedParts.length})
        </button>
      )}

      <span className="sr-only" aria-live="polite">
        {selectedParts.length === 0
          ? "No body regions selected"
          : `${selectedParts.length} body region${selectedParts.length === 1 ? "" : "s"} selected: ${selectedParts
              .map((p) => p.name)
              .join(", ")}`}
      </span>
    </div>
  );
}
