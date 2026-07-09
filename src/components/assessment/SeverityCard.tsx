"use client";

import type { SelectedBodyPart } from "@/types/body";
import { SEVERITY_SCALE, SEVERITY_COLORS } from "@/constants/severityScale";

interface SeverityCardProps {
  part: SelectedBodyPart;
  severity?: number;
  onChange: (id: string, severity: number) => void;
}

export function SeverityCard({ part, severity, onChange }: SeverityCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
      <h4 className="mb-3 text-sm font-semibold text-foreground">
        {part.name}
      </h4>
      <fieldset>
        <legend className="sr-only">Severity for {part.name}</legend>
        <div className="space-y-2">
          {SEVERITY_SCALE.map((level) => {
            const isActive = severity === level.value;
            const color = SEVERITY_COLORS[level.value];
            return (
              <label
                key={level.value}
                className={`flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "border-2" : "border border-transparent hover:bg-muted"
                }`}
                style={{
                  borderColor: isActive ? color : undefined,
                  backgroundColor: isActive ? `${color}20` : undefined,
                }}
              >
                <input
                  type="radio"
                  name={`severity-${part.id}`}
                  value={level.value}
                  checked={isActive}
                  onChange={() => onChange(part.id, level.value)}
                  className="sr-only"
                />
                <span
                  className="inline-block size-4 shrink-0 rounded-full border-2 transition-colors"
                  style={{
                    borderColor: color,
                    backgroundColor: isActive ? color : "transparent",
                  }}
                />
                <div>
                  <span className="font-medium text-foreground">
                    {level.label}
                  </span>
                  <p className="text-xs text-muted-foreground">
                    {level.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
