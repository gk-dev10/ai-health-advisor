"""Local SQLite persistence for the synthetic clinic intake prototype."""

from contextlib import contextmanager
from datetime import datetime, timezone
import sqlite3
from typing import Iterator
from uuid import uuid4

from app.core.config import settings
from app.core.triage_policy import (
    EMERGENCY_ACTION,
    RequesterUrgency,
    RoutingCategory,
    RoutingSource,
)
from app.schemas.intake import IntakeRecord, IntakeSubmission, RoutingSuggestion


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
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _to_record(row: sqlite3.Row) -> IntakeRecord:
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
        return _to_record(row)


def list_intakes(limit: int = 100) -> list[IntakeRecord]:
    with _connection() as connection:
        rows = connection.execute(
            "SELECT * FROM intakes ORDER BY created_at DESC, id DESC LIMIT ?", (limit,)
        ).fetchall()
        return [_to_record(row) for row in rows]


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
        return _to_record(row) if row is not None else None
