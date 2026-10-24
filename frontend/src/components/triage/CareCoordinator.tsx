"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Check,
  ClipboardCheck,
  Clock3,
  History,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fetchStaffingRoster, saveIntakeAssignment } from "@/lib/api";
import type {
  DemoClinicianProfile,
  IntakeRecord,
  RoutingCategory,
  StaffingRosterResponse,
} from "@/types/intake";

const PRIORITY: Record<RoutingCategory, number> = {
  emergency_guidance: 0,
  same_day_human_review: 1,
  routine_appointment: 2,
};

const PRIORITY_LABEL: Record<RoutingCategory, string> = {
  emergency_guidance: "Emergency review",
  same_day_human_review: "Same-day review",
  routine_appointment: "Routine scheduling",
};

const PRIORITY_STYLE: Record<RoutingCategory, string> = {
  emergency_guidance: "border-red-200 bg-red-50 text-red-800",
  same_day_human_review: "border-amber-200 bg-amber-50 text-amber-900",
  routine_appointment: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
}

function getRoute(roster: StaffingRosterResponse, category: RoutingCategory) {
  return roster.teamRoutes.find((route) => route.category === category);
}

function isAssignmentCurrent(record: IntakeRecord, roster: StaffingRosterResponse) {
  if (record.finalCategory === "emergency_guidance") return false;
  const route = getRoute(roster, record.finalCategory);
  return Boolean(record.currentAssignment && route?.teamId === record.currentAssignment.teamId);
}

function CapacityCard({ clinician }: { clinician: DemoClinicianProfile }) {
  const fill = Math.min(100, Math.round((clinician.activeCases / clinician.caseCapacity) * 100));
  const isFull = clinician.openCaseSlots === 0;
  return (
    <article className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-sm font-bold text-primary-dark">
            {clinician.name.split(" ").slice(-1)[0]?.replace(".", "").slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{clinician.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{clinician.role}</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${isFull ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>
          {isFull ? "At capacity" : `${clinician.openCaseSlots} open`}
        </span>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{clinician.teamName}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" aria-label={`${clinician.activeCases} of ${clinician.caseCapacity} demo cases assigned`}>
        <div className={`h-full rounded-full transition-[width] ${isFull ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${fill}%` }} />
      </div>
      <p className="mt-2 text-[11px] font-medium text-muted-foreground">
        {clinician.activeCases} / {clinician.caseCapacity} assigned demo cases
      </p>
    </article>
  );
}

function AssignmentCard({
  record,
  roster,
  onAssigned,
}: {
  record: IntakeRecord;
  roster: StaffingRosterResponse;
  onAssigned: (record: IntakeRecord) => void;
}) {
  const route = getRoute(roster, record.finalCategory);
  const eligibleClinicians = roster.clinicians.filter((clinician) => clinician.teamId === route?.teamId);
  const currentIsCompatible = isAssignmentCurrent(record, roster);
  const emergencyEscalation = record.finalCategory === "emergency_guidance";
  const [clinicianId, setClinicianId] = useState(currentIsCompatible ? record.currentAssignment?.clinicianId ?? "" : "");
  const [assignedBy, setAssignedBy] = useState(currentIsCompatible ? record.currentAssignment?.assignedBy ?? "" : "");
  const [reason, setReason] = useState(currentIsCompatible ? record.currentAssignment?.reason ?? "" : "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const clinicianSelectId = `clinician-${record.id}`;
  const assignedById = `assigned-by-${record.id}`;
  const reasonId = `assignment-reason-${record.id}`;
  const unchangedAssignment = currentIsCompatible &&
    clinicianId === record.currentAssignment?.clinicianId &&
    assignedBy.trim() === record.currentAssignment?.assignedBy &&
    reason.trim() === record.currentAssignment?.reason;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!clinicianId || !assignedBy.trim() || reason.trim().length < 5 || isSaving) return;
    setIsSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await saveIntakeAssignment(record.id, {
        clinicianId,
        assignedBy: assignedBy.trim(),
        reason: reason.trim(),
      });
      onAssigned(updated);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the assignment. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-border/90 bg-white shadow-[0_18px_55px_-38px_rgba(20,43,37,0.38)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/80 bg-muted/45 px-5 py-4 sm:px-6">
        <div>
          <p className="font-mono text-sm font-bold text-foreground">{record.syntheticPatientId}</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock3 className="size-3.5" aria-hidden="true" /> Submitted {formatDate(record.createdAt)}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${PRIORITY_STYLE[record.finalCategory]}`}>
          {PRIORITY_LABEL[record.finalCategory]}
        </span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-muted/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Priority route</p>
            <p className="mt-1.5 text-sm font-bold text-foreground">{route?.teamName ?? "Staff review"}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{record.recommendation.reason}</p>
          </div>
          <div className="rounded-2xl bg-muted/70 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Requested time</p>
            <p className="mt-1.5 inline-flex items-center gap-2 text-sm font-bold text-foreground">
              <CalendarClock className="size-4 text-primary" aria-hidden="true" /> {record.preferredAppointmentTime}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Requester marked this {record.requesterUrgency}.</p>
          </div>
        </div>

        {emergencyEscalation ? (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-700" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-red-900">Emergency escalation - not an appointment assignment</p>
              <p className="mt-1 text-xs leading-relaxed text-red-900">{record.finalAction ?? "Contact local emergency services immediately. Do not wait for a clinic appointment."}</p>
              {record.currentAssignment && <p className="mt-2 text-xs font-semibold text-red-900">A previous clinician assignment is retained in history and is not a current emergency response.</p>}
            </div>
          </div>
        ) : (
          <div className={`flex items-start gap-3 rounded-2xl border p-4 ${currentIsCompatible ? "border-primary/15 bg-primary-light/30" : "border-amber-200 bg-amber-50"}`}>
            <UsersRound className={`mt-0.5 size-4 shrink-0 ${currentIsCompatible ? "text-primary" : "text-amber-700"}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              {currentIsCompatible ? (
              <>
                <p className="text-sm font-bold text-foreground">Assigned to {record.currentAssignment?.clinicianName}</p>
                <p className="mt-1 text-xs text-muted-foreground">{record.currentAssignment?.teamName} · assigned by {record.currentAssignment?.assignedBy}</p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">{record.currentAssignment?.reason}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{record.currentAssignment ? formatDate(record.currentAssignment.assignedAt) : ""}</p>
              </>
              ) : (
              <>
                <p className="text-sm font-bold text-foreground">{record.currentAssignment ? "Priority changed — review this assignment" : "Needs a staff assignment"}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">The queue follows the current final disposition. A staff member chooses the clinician and records the reason.</p>
              </>
              )}
            </div>
          </div>
        )}

        {!emergencyEscalation && <form onSubmit={handleSubmit} className="grid gap-4 border-t border-border/80 pt-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <h3 className="text-sm font-bold text-foreground">{currentIsCompatible ? "Reassign or confirm clinician" : "Assign a clinician"}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Priority determines the team queue; staff selects the clinician. This fictional roster does not represent real availability.</p>
          </div>
          <div>
            <label htmlFor={clinicianSelectId} className="text-xs font-semibold text-foreground">Clinician</label>
            <select id={clinicianSelectId} value={clinicianId} onChange={(event) => { setClinicianId(event.target.value); setSaved(false); }} required className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10">
              <option value="">Choose from {route?.teamName ?? "team"}</option>
              {eligibleClinicians.map((clinician) => {
                const canKeepCurrent = record.currentAssignment?.clinicianId === clinician.id;
                return <option key={clinician.id} value={clinician.id} disabled={clinician.openCaseSlots === 0 && !canKeepCurrent}>{clinician.name} · {clinician.openCaseSlots} open</option>;
              })}
            </select>
          </div>
          <div>
            <label htmlFor={assignedById} className="text-xs font-semibold text-foreground">Assigned by (demo label)</label>
            <input id={assignedById} value={assignedBy} onChange={(event) => { setAssignedBy(event.target.value); setSaved(false); }} minLength={2} maxLength={80} required placeholder="e.g. staff-01" className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10" />
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">Demo label only; staff identity is not authenticated.</p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor={reasonId} className="text-xs font-semibold text-foreground">Assignment note</label>
            <textarea id={reasonId} value={reason} onChange={(event) => { setReason(event.target.value); setSaved(false); }} minLength={5} maxLength={500} rows={2} required placeholder="Why was this clinician selected? For example: balanced the demo case workload." className="mt-1.5 w-full resize-y rounded-xl border border-border bg-white px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10" />
            <p className="mt-1 text-right text-[10px] text-muted-foreground">{reason.length}/500</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
            <Button type="submit" disabled={!clinicianId || !assignedBy.trim() || reason.trim().length < 5 || isSaving || unchangedAssignment}>
              <ClipboardCheck className="size-4" aria-hidden="true" />
              {isSaving ? "Saving assignment..." : currentIsCompatible ? "Save reassignment" : "Assign clinician"}
            </Button>
            {saved && <span role="status" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800"><Check className="size-4" aria-hidden="true" /> Assignment recorded</span>}
            {error && <p role="alert" className="text-xs font-medium text-red-700">{error}</p>}
          </div>
        </form>}

        {record.assignmentHistory.length > 0 && (
          <details className="group border-t border-border/80 pt-4">
            <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-bold text-muted-foreground marker:hidden">
              <History className="size-4 text-primary" aria-hidden="true" /> Assignment history ({record.assignmentHistory.length})
              <ArrowRight className="ml-auto size-3.5 transition-transform group-open:rotate-90" aria-hidden="true" />
            </summary>
            <ol className="mt-3 space-y-3 border-l border-border pl-4">
              {record.assignmentHistory.map((assignment, index) => (
                <li key={`${assignment.assignedAt}-${index}`} className="relative text-xs">
                  <span className="absolute -left-[21px] top-1 size-2.5 rounded-full border-2 border-white bg-primary ring-1 ring-primary/30" />
                  <p className="font-semibold text-foreground">{assignment.clinicianName} · {assignment.teamName}</p>
                  <p className="mt-0.5 text-muted-foreground">{assignment.assignedBy} · {formatDate(assignment.assignedAt)}</p>
                  <p className="mt-1 leading-relaxed text-foreground">{assignment.reason}</p>
                </li>
              ))}
            </ol>
          </details>
        )}
      </div>
    </article>
  );
}

export function CareCoordinator({
  intakes,
  onAssigned,
}: {
  intakes: IntakeRecord[];
  onAssigned: (record: IntakeRecord) => void;
}) {
  const [roster, setRoster] = useState<StaffingRosterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRoster = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      setRoster(await fetchStaffingRoster());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load the demo roster.");
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchStaffingRoster()
      .then((response) => { if (active) setRoster(response); })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load the demo roster.");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const sortedIntakes = useMemo(() => [...intakes].sort((a, b) => {
    const byPriority = PRIORITY[a.finalCategory] - PRIORITY[b.finalCategory];
    return byPriority || a.createdAt.localeCompare(b.createdAt);
  }), [intakes]);

  const unassignedCount = roster
    ? intakes.filter((record) => record.finalCategory !== "emergency_guidance" && !isAssignmentCurrent(record, roster)).length
    : intakes.filter((record) => record.finalCategory !== "emergency_guidance" && !record.currentAssignment).length;
  const totalActive = roster?.clinicians.reduce((total, clinician) => total + clinician.activeCases, 0) ?? 0;
  const totalCapacity = roster?.clinicians.reduce((total, clinician) => total + clinician.caseCapacity, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Care coordination</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Staffing & assignments</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">Priority sets the review queue. A staff member chooses the clinician, records the reason, and can reassign later.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void refreshRoster()} disabled={isRefreshing}>
          <span className={isRefreshing ? "animate-spin" : ""}><Clock3 className="size-4" aria-hidden="true" /></span>
          {isRefreshing ? "Refreshing..." : "Refresh capacity"}
        </Button>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700" aria-hidden="true" />
        <p><strong>Demo staffing only.</strong> Names and case limits are fictional. Capacity is a prototype workload count, not live availability. Assignments are administrative suggestions and require staff review.</p>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold text-muted-foreground">Needs clinician assignment</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{unassignedCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">Cases awaiting a current team match</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold text-muted-foreground">Assigned demo cases</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{totalActive}</p>
          <p className="mt-1 text-xs text-muted-foreground">Latest assignment per intake</p>
        </Card>
        <Card className="p-4 sm:p-5">
          <p className="text-xs font-semibold text-muted-foreground">Fictional case capacity</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{totalCapacity > 0 ? totalCapacity - totalActive : "—"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Open demo case slots across the roster</p>
        </Card>
      </div>

      <section aria-labelledby="capacity-heading" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 id="capacity-heading" className="text-lg font-bold tracking-tight text-foreground">Fictional clinician roster</h3>
            <p className="mt-1 text-xs text-muted-foreground">Workload updates when an assignment is saved.</p>
          </div>
          <p className="text-xs font-medium text-muted-foreground">{roster?.clinicians.length ?? 0} demo clinicians</p>
        </div>
        {isLoading && !roster ? (
          <div role="status" className="rounded-2xl border border-border bg-white p-6 text-sm text-muted-foreground">Loading demo roster...</div>
        ) : roster ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {roster.clinicians.map((clinician) => <CapacityCard key={clinician.id} clinician={clinician} />)}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="assignment-queue-heading" className="space-y-4">
        <div>
          <h3 id="assignment-queue-heading" className="text-lg font-bold tracking-tight text-foreground">Assignment queue</h3>
          <p className="mt-1 text-xs text-muted-foreground">Sorted by current staff-reviewed priority, then oldest request first.</p>
        </div>
        {!roster ? (
          <div className="rounded-2xl border border-border bg-white p-6 text-sm text-muted-foreground">The roster must load before assignments can be made.</div>
        ) : sortedIntakes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-white p-8 text-center">
            <UsersRound className="mx-auto size-8 text-primary/60" aria-hidden="true" />
            <p className="mt-3 text-sm font-bold text-foreground">No intake requests yet</p>
            <p className="mt-1 text-xs text-muted-foreground">Synthetic requests will appear here after staff intake is submitted.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedIntakes.map((record) => <AssignmentCard key={record.id} record={record} roster={roster} onAssigned={(updated) => { onAssigned(updated); void refreshRoster(); }} />)}
          </div>
        )}
      </section>
    </div>
  );
}
