"""Local SQLite persistence for the synthetic clinic intake prototype."""

from contextlib import contextmanager
from datetime import datetime, timezone
import sqlite3
from typing import Iterator
from uuid import uuid4

from app.core.config import settings
from app.core.staffing import CLINICIAN_BY_ID, DEMO_CLINICIANS, TEAM_ROUTES, team_route_for
from app.core.triage_policy import (
    EMERGENCY_ACTION,
    RequesterUrgency,
    RoutingCategory,
    RoutingSource,
)
from app.schemas.intake import (
    DemoClinicianProfile,
    IntakeRecord,
    IntakeSubmission,
    RoutingSuggestion,
    StaffAssignment,
    StaffAssignmentRequest,
    StaffingRosterResponse,
    TeamRouteInfo,
)


class StaffingCapacityError(ValueError):
    pass


@contextmanager
def _connection() -> Iterator[sqlite3.Connection]:
    path = settings.triage_db_path
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path, timeout=10)
    connection.row_factory = sqlite3.Row
    try:
        connection.execute("PRAGMA foreign_keys = ON")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS intakes (
                id TEXT PRIMARY KEY,
                synthetic_patient_id TEXT NOT NULL,
                symptom_description TEXT NOT NULL,
                preferred_appointment_time TEXT NOT NULL,
                requester_urgency TEXT NOT NULL
                    CHECK (requester_urgency IN ('routine', 'urgent')),
                suggested_category TEXT NOT NULL
                    CHECK (suggested_category IN (
                        'routine_appointment',
                        'same_day_human_review',
                        'emergency_guidance'
                    )),
                suggestion_reason TEXT NOT NULL,
                suggestion_source TEXT NOT NULL
                    CHECK (suggestion_source IN ('team_policy', 'ai_assist', 'safe_fallback')),
                suggestion_action TEXT,
                final_category TEXT NOT NULL
                    CHECK (final_category IN (
                        'routine_appointment',
                        'same_day_human_review',
                        'emergency_guidance'
                    )),
                override_reason TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_intakes_created_at ON intakes(created_at DESC)"
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS intake_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                intake_id TEXT NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
                clinician_id TEXT NOT NULL,
                clinician_name TEXT NOT NULL,
                role TEXT NOT NULL,
                team_id TEXT NOT NULL,
                team_name TEXT NOT NULL,
                assigned_by TEXT NOT NULL,
                reason TEXT NOT NULL,
                assigned_at TEXT NOT NULL
            )
            """
        )
        connection.execute(
            "CREATE INDEX IF NOT EXISTS idx_assignments_intake ON intake_assignments(intake_id, id DESC)"
        )
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _to_assignment(row: sqlite3.Row) -> StaffAssignment:
    return StaffAssignment(
        clinician_id=row["clinician_id"],
        clinician_name=row["clinician_name"],
        role=row["role"],
        team_id=row["team_id"],
        team_name=row["team_name"],
        assigned_by=row["assigned_by"],
        reason=row["reason"],
        assigned_at=row["assigned_at"],
    )


def _to_record(connection: sqlite3.Connection, row: sqlite3.Row) -> IntakeRecord:
    assignment_rows = connection.execute(
        "SELECT * FROM intake_assignments WHERE intake_id = ? ORDER BY id DESC",
        (row["id"],),
    ).fetchall()
    history = [_to_assignment(item) for item in assignment_rows]
    return IntakeRecord(
        id=row["id"],
        synthetic_patient_id=row["synthetic_patient_id"],
        symptom_description=row["symptom_description"],
        preferred_appointment_time=row["preferred_appointment_time"],
        requester_urgency=RequesterUrgency(row["requester_urgency"]),
        recommendation=RoutingSuggestion(
            category=RoutingCategory(row["suggested_category"]),
            reason=row["suggestion_reason"],
            source=RoutingSource(row["suggestion_source"]),
            action=row["suggestion_action"],
        ),
        final_category=RoutingCategory(row["final_category"]),
        final_action=(
            EMERGENCY_ACTION
            if row["final_category"] == RoutingCategory.EMERGENCY_GUIDANCE.value
            else None
        ),
        override_reason=row["override_reason"],
        current_assignment=history[0] if history else None,
        assignment_history=history,
        created_at=row["created_at"],
        updated_at=row["updated_at"],
    )
def create_intake(
    submission: IntakeSubmission,
    recommendation: RoutingSuggestion,
) -> IntakeRecord:
    request_id = uuid4().hex
    now = _now()
    with _connection() as connection:
        connection.execute(
            """
            INSERT INTO intakes (
                id, synthetic_patient_id, symptom_description,
                preferred_appointment_time, requester_urgency,
                suggested_category, suggestion_reason, suggestion_source,
                suggestion_action, final_category, override_reason,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)
            """,
            (
                request_id,
                submission.synthetic_patient_id,
                submission.symptom_description,
                submission.preferred_appointment_time,
                submission.requester_urgency.value,
                recommendation.category.value,
                recommendation.reason,
                recommendation.source.value,
                recommendation.action,
                recommendation.category.value,
                now,
                now,
            ),
        )
        row = connection.execute("SELECT * FROM intakes WHERE id = ?", (request_id,)).fetchone()
        if row is None:
            raise RuntimeError("Inserted intake could not be loaded.")
        return _to_record(connection, row)


def list_intakes(limit: int = 100) -> list[IntakeRecord]:
    with _connection() as connection:
        rows = connection.execute(
            "SELECT * FROM intakes ORDER BY created_at DESC, id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [_to_record(connection, row) for row in rows]


def apply_override(
    request_id: str,
    final_category: RoutingCategory,
    reason: str,
) -> IntakeRecord | None:
    now = _now()
    with _connection() as connection:
        cursor = connection.execute(
            """
            UPDATE intakes
            SET final_category = ?, override_reason = ?, updated_at = ?
            WHERE id = ?
            """,
            (final_category.value, reason, now, request_id),
        )
        if cursor.rowcount == 0:
            return None
        row = connection.execute("SELECT * FROM intakes WHERE id = ?", (request_id,)).fetchone()
        return _to_record(connection, row) if row is not None else None


def assign_intake(
    request_id: str,
    request: StaffAssignmentRequest,
) -> IntakeRecord | None:
    clinician = CLINICIAN_BY_ID.get(request.clinician_id)
    if clinician is None:
        raise ValueError("Choose a clinician from the fictional demo roster.")

    with _connection() as connection:
        connection.execute("BEGIN IMMEDIATE")
        intake = connection.execute(
            "SELECT * FROM intakes WHERE id = ?", (request_id,)
        ).fetchone()
        if intake is None:
            return None

        category = RoutingCategory(intake["final_category"])
        if category == RoutingCategory.EMERGENCY_GUIDANCE:
            raise ValueError(
                "Emergency guidance is not an appointment queue. Contact local emergency services; do not wait for a clinician assignment."
            )
        route = team_route_for(category)
        if clinician.team_id != route.team_id:
            raise ValueError("Choose a clinician from the team for this request's current priority.")

        active_count = connection.execute(
            """
            SELECT COUNT(*)
            FROM intake_assignments AS assignment
            JOIN intakes ON intakes.id = assignment.intake_id
            JOIN (
                SELECT intake_id, MAX(id) AS latest_id
                FROM intake_assignments
                GROUP BY intake_id
            ) AS latest ON latest.latest_id = assignment.id
            WHERE assignment.clinician_id = ?
              AND assignment.team_id = ?
              AND intakes.final_category = ?
            """,
            (clinician.id, route.team_id, category.value),
        ).fetchone()[0]
        current = connection.execute(
            """
            SELECT clinician_id FROM intake_assignments
            WHERE intake_id = ? ORDER BY id DESC LIMIT 1
            """,
            (request_id,),
        ).fetchone()
        if active_count >= clinician.case_capacity and (
            current is None or current["clinician_id"] != clinician.id
        ):
            raise StaffingCapacityError("This demo clinician has reached the displayed case capacity.")

        connection.execute(
            """
            INSERT INTO intake_assignments (
                intake_id, clinician_id, clinician_name, role, team_id, team_name,
                assigned_by, reason, assigned_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                request_id,
                clinician.id,
                clinician.name,
                clinician.role,
                clinician.team_id,
                clinician.team_name,
                request.assigned_by,
                request.reason,
                _now(),
            ),
        )
        row = connection.execute("SELECT * FROM intakes WHERE id = ?", (request_id,)).fetchone()
        if row is None:
            raise RuntimeError("Assigned intake could not be loaded.")
        return _to_record(connection, row)


def get_staffing_roster() -> StaffingRosterResponse:
    with _connection() as connection:
        rows = connection.execute(
            """
            SELECT assignment.clinician_id, assignment.team_id, intakes.final_category
            FROM intake_assignments AS assignment
            JOIN intakes ON intakes.id = assignment.intake_id
            JOIN (
                SELECT intake_id, MAX(id) AS latest_id
                FROM intake_assignments
                GROUP BY intake_id
            ) AS latest ON latest.latest_id = assignment.id
            """
        ).fetchall()
        counts: dict[str, int] = {}
        for row in rows:
            category = RoutingCategory(row["final_category"])
            if team_route_for(category).team_id == row["team_id"]:
                counts[row["clinician_id"]] = counts.get(row["clinician_id"], 0) + 1

    clinicians = [
        DemoClinicianProfile(
            id=clinician.id,
            name=clinician.name,
            role=clinician.role,
            team_id=clinician.team_id,
            team_name=clinician.team_name,
            case_capacity=clinician.case_capacity,
            active_cases=counts.get(clinician.id, 0),
            open_case_slots=max(0, clinician.case_capacity - counts.get(clinician.id, 0)),
        )
        for clinician in DEMO_CLINICIANS
    ]
    team_routes = [
        TeamRouteInfo(
            category=category,
            team_id=route.team_id,
            team_name=route.team_name,
            priority_label=route.priority_label,
        )
        for category, route in TEAM_ROUTES.items()
    ]
    return StaffingRosterResponse(clinicians=clinicians, team_routes=team_routes)
