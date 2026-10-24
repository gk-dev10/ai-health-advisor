"""Wire contracts for synthetic clinic intake and constrained AI classification."""

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.core.triage_policy import RequesterUrgency, RoutingCategory, RoutingSource


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
    """Allowed Gemini output: route and plain-language reason, never diagnosis."""

    category: RoutingCategory
    reason: str = Field(min_length=1, max_length=280)
    is_clear: bool


class RoutingSuggestion(IntakeModel):
    category: RoutingCategory
    reason: str = Field(min_length=1, max_length=400)
    source: RoutingSource
