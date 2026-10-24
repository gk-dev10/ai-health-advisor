"""Wire contracts for synthetic clinic intake and constrained AI classification."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.triage_policy import (
    PolicySignalId,
    RequesterUrgency,
    RoutingCategory,
    RoutingSource,
)


def _to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class IntakeModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=_to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class IntakeSubmission(IntakeModel):
    synthetic_patient_id: str = Field(
        min_length=5,
        max_length=52,
        pattern=r"^SYN-[A-Za-z0-9_-]+$",
        description="Synthetic-only demo identifier. No real patient identifier is allowed.",
    )
    symptom_description: str = Field(
        max_length=2000,
        description="Free-text description; empty or unclear descriptions go to human review.",
    )
    preferred_appointment_time: str = Field(min_length=1, max_length=120)
    requester_urgency: RequesterUrgency

    @field_validator(
        "synthetic_patient_id",
        "symptom_description",
        "preferred_appointment_time",
        mode="before",
    )
    @classmethod
    def trim_text(cls, value: Any) -> Any:
        return value.strip() if isinstance(value, str) else value


class AIClassification(IntakeModel):
    """Allowed Gemini output uses policy signal IDs so no free text can name diseases."""

    category: RoutingCategory
    signal_ids: list[PolicySignalId] = Field(max_length=12)
    is_clear: bool


class GeminiAIClassification(BaseModel):
    """Gemini-compatible schema; strict validation still uses AIClassification."""

    model_config = ConfigDict(alias_generator=_to_camel, populate_by_name=True)

    category: RoutingCategory
    signal_ids: list[PolicySignalId] = Field(max_length=12)
    is_clear: bool


class RoutingSuggestion(IntakeModel):
    category: RoutingCategory
    reason: str = Field(min_length=1, max_length=400)
    source: RoutingSource
    action: str | None = None


class StaffAssignment(IntakeModel):
    clinician_id: str
    clinician_name: str
    role: str
    team_id: str
    team_name: str
    assigned_by: str
    reason: str
    assigned_at: str


class IntakeRecord(IntakeSubmission):
    id: str
    recommendation: RoutingSuggestion
    final_category: RoutingCategory
    final_action: str | None = None
    override_reason: str | None = None
    current_assignment: StaffAssignment | None = None
    assignment_history: list[StaffAssignment] = Field(default_factory=list)
    created_at: str
    updated_at: str


class IntakeQueueResponse(IntakeModel):
    intakes: list[IntakeRecord]


class StaffOverrideRequest(IntakeModel):
    final_category: RoutingCategory
    reason: str = Field(min_length=1, max_length=500)

    @field_validator("reason", mode="before")
    @classmethod
    def trim_reason(cls, value: Any) -> Any:
        return value.strip() if isinstance(value, str) else value


class StaffAssignmentRequest(IntakeModel):
    clinician_id: str = Field(min_length=1, max_length=80)
    assigned_by: str = Field(min_length=2, max_length=80)
    reason: str = Field(min_length=5, max_length=500)

    @field_validator("assigned_by", "reason", mode="before")
    @classmethod
    def trim_assignment_text(cls, value: Any) -> Any:
        return value.strip() if isinstance(value, str) else value


class DemoClinicianProfile(IntakeModel):
    id: str
    name: str
    role: str
    team_id: str
    team_name: str
    case_capacity: int
    active_cases: int
    open_case_slots: int


class TeamRouteInfo(IntakeModel):
    category: RoutingCategory
    team_id: str
    team_name: str
    priority_label: str


class StaffingRosterResponse(IntakeModel):
    clinicians: list[DemoClinicianProfile]
    team_routes: list[TeamRouteInfo]
    demo_only: bool = True
