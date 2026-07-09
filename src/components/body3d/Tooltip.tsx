"use client";

interface TooltipProps {
  name: string | null;
  x: number;
  y: number;
}

export default function Tooltip({ name, x, y }: TooltipProps) {
  if (!name) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md bg-gray-900/90 px-2.5 py-1 text-sm font-medium text-white shadow-lg transition-opacity"
      style={{ left: x, top: y - 10 }}
    >
      {name}
    </div>
  );
}
