"use client";

import { useEffect, useMemo, useState } from "react";
import type { SelectedBodyPart } from "@/types/body";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface BodyMapSnapshot {
  id: string;
  createdAt: string;
  parts: { id: string; name: string; severity: number }[];
}

const STORAGE_KEY = "body-map-health-advisor:body-map-history:v1";
const MAX_SNAPSHOTS = 20;

function readSnapshots(): BodyMapSnapshot[] {
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter(
      (item): item is BodyMapSnapshot =>
        typeof item?.id === "string" &&
        typeof item?.createdAt === "string" &&
        Array.isArray(item?.parts) &&
        item.parts.every(
          (part: unknown) =>
            typeof part === "object" &&
            part !== null &&
            typeof (part as BodyMapSnapshot["parts"][number]).id === "string" &&
            typeof (part as BodyMapSnapshot["parts"][number]).name === "string" &&
            Number.isInteger((part as BodyMapSnapshot["parts"][number]).severity) &&
            (part as BodyMapSnapshot["parts"][number]).severity >= 1 &&
            (part as BodyMapSnapshot["parts"][number]).severity <= 5
        )
    ).slice(0, MAX_SNAPSHOTS);
  } catch {
    return [];
  }
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
}

export function BodyMapHistory({ selectedParts }: { selectedParts: SelectedBodyPart[] }) {
  const [snapshots, setSnapshots] = useState<BodyMapSnapshot[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setSnapshots(readSnapshots()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const latest = snapshots[0];
  const comparison = useMemo(() => {
    if (!latest) return [];
    const previous = new Map(latest.parts.map((part) => [part.id, part]));
    const current = new Map(selectedParts.map((part) => [part.id, part]));
    const changes: { id: string; text: string }[] = [];

    for (const part of selectedParts) {
      const saved = previous.get(part.id);
      const severity = part.severity ?? 1;
      if (!saved) {
        changes.push({ id: part.id, text: `${part.name}: newly selected (level ${severity})` });
      } else if (saved.severity !== severity) {
        const direction = severity > saved.severity ? "increased" : "decreased";
        changes.push({ id: part.id, text: `${part.name}: ${direction} from ${saved.severity} to ${severity}` });
      }
    }

    for (const part of latest.parts) {
      if (!current.has(part.id)) {
        changes.push({ id: `removed-${part.id}`, text: `${part.name}: no longer selected` });
      }
    }
    return changes;
  }, [latest, selectedParts]);

  const saveSnapshot = () => {
    if (selectedParts.length === 0) return;
    const next: BodyMapSnapshot[] = [
      {
        id: typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: new Date().toISOString(),
        parts: selectedParts.map((part) => ({
          id: part.id,
          name: part.name,
          severity: part.severity ?? 1,
        })),
      },
      ...snapshots,
    ].slice(0, MAX_SNAPSHOTS);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSnapshots(next);
      setStorageError(null);
      setStatus("Body-map check-in saved in this browser.");
    } catch {
      setStorageError("This browser could not save the check-in. Try clearing older entries or browser storage.");
      setStatus("");
    }
  };

  const clearHistory = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      setSnapshots([]);
      setStorageError(null);
      setStatus("Body-map history cleared from this browser.");
    } catch {
      setStorageError("Could not clear browser history.");
      setStatus("");
    }
  };

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Body-map history</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Save up to {MAX_SNAPSHOTS} check-ins on this browser and compare regions and severity with the latest one.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={saveSnapshot} disabled={selectedParts.length === 0}>
            Save check-in
          </Button>
          {snapshots.length > 0 && (
            <Button type="button" variant="outline" onClick={clearHistory}>
              Clear history
            </Button>
          )}
        </div>
      </div>

      <p className="rounded-md bg-muted px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        Only selected body regions, their severity levels, and save times are stored. Your written description is not saved here. Entries stay in this browser until you clear them.
      </p>

      {status && <p role="status" className="text-xs text-emerald-800">{status}</p>}
      {storageError && <p role="alert" className="text-xs text-red-700">{storageError}</p>}

      {!latest ? (
        <p className="text-sm text-muted-foreground">No check-ins saved yet. Select body regions to save your first one.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <p className="font-medium text-foreground">Compared with {formatDate(latest.createdAt)}</p>
            <p className="text-xs text-muted-foreground">{snapshots.length} saved check-in{snapshots.length === 1 ? "" : "s"}</p>
          </div>
          {comparison.length === 0 ? (
            <p className="text-sm text-muted-foreground">No region or severity changes from the latest saved check-in.</p>
          ) : (
            <ul className="space-y-1 text-sm text-foreground">
              {comparison.map((change) => <li key={change.id} className="rounded-md bg-muted px-3 py-2">{change.text}</li>)}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
