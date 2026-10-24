"""Versioned routing vocabulary and team policy for the clinic intake prototype.

This module defines policy inputs and rule data. The intake API and persistence
layer are added in a later implementation phase.
"""

from dataclasses import dataclass
from enum import Enum


class RoutingCategory(str, Enum):
    ROUTINE_APPOINTMENT = "routine_appointment"
    SAME_DAY_HUMAN_REVIEW = "same_day_human_review"
    EMERGENCY_GUIDANCE = "emergency_guidance"


class RequesterUrgency(str, Enum):
    ROUTINE = "routine"
    URGENT = "urgent"


class RoutingSource(str, Enum):
    TEAM_POLICY = "team_policy"
    AI_ASSIST = "ai_assist"
    SAFE_FALLBACK = "safe_fallback"


@dataclass(frozen=True)
class PolicyRule:
    """A rule matches when each cue group has at least one matching phrase."""

    rule_id: str
    category: RoutingCategory
    cue_groups: tuple[tuple[str, ...], ...]
    reason: str


POLICY_VERSION = "hackathon-v1"

# A matched emergency rule must take precedence over the model's category.
EMERGENCY_RULES: tuple[PolicyRule, ...] = (
    PolicyRule(
        rule_id="severe_chest_pain",
        category=RoutingCategory.EMERGENCY_GUIDANCE,
        cue_groups=(("severe chest pain",),),
        reason="The description matches the team's emergency policy for severe chest pain.",
    ),
    PolicyRule(
        rule_id="difficulty_breathing",
        category=RoutingCategory.EMERGENCY_GUIDANCE,
        cue_groups=(("difficulty breathing", "trouble breathing"),),
        reason="The description matches the team's emergency policy for difficulty breathing.",
    ),
    PolicyRule(
        rule_id="unconsciousness",
        category=RoutingCategory.EMERGENCY_GUIDANCE,
        cue_groups=(("unconscious", "unresponsive", "passed out"),),
        reason="The description matches the team's emergency policy for loss of consciousness.",
    ),
    PolicyRule(
        rule_id="severe_bleeding",
        category=RoutingCategory.EMERGENCY_GUIDANCE,
        cue_groups=(("severe bleeding", "bleeding heavily"),),
        reason="The description matches the team's emergency policy for severe bleeding.",
    ),
    PolicyRule(
        rule_id="seizure",
        category=RoutingCategory.EMERGENCY_GUIDANCE,
        cue_groups=(("seizure", "having a fit"),),
        reason="The description matches the team's emergency policy for seizure activity.",
    ),
    PolicyRule(
        rule_id="stroke_like_symptoms",
        category=RoutingCategory.EMERGENCY_GUIDANCE,
        cue_groups=(
            (
                "sudden weakness on one side",
                "sudden one-sided weakness",
                "face drooping",
                "trouble speaking",
            ),
        ),
        reason="The description matches the team's emergency policy for stroke-like symptoms.",
    ),
)

# These signals raise a request to at least same-day human review.
SAME_DAY_RULES: tuple[PolicyRule, ...] = (
    PolicyRule(
        rule_id="persistent_fever_and_marked_weakness",
        category=RoutingCategory.SAME_DAY_HUMAN_REVIEW,
        cue_groups=(
            ("persistent fever", "fever for days", "fever that has lasted"),
            ("very weak", "significant weakness", "marked weakness"),
        ),
        reason="The description matches the team's same-day policy for persistent fever with marked weakness.",
    ),
    PolicyRule(
        rule_id="persistent_symptoms",
        category=RoutingCategory.SAME_DAY_HUMAN_REVIEW,
        cue_groups=(("persistent symptoms", "symptoms have persisted", "symptoms haven't improved"),),
        reason="The description mentions persistent symptoms requiring human review.",
    ),
    PolicyRule(
        rule_id="worsening_symptoms",
        category=RoutingCategory.SAME_DAY_HUMAN_REVIEW,
        cue_groups=(("worsening symptoms", "symptoms are getting worse", "symptoms have worsened"),),
        reason="The description mentions worsening symptoms requiring human review.",
    ),
)

SAME_DAY_FALLBACK_REASON = (
    "The request is unclear or AI classification is unavailable, so a staff member should review it today."
)

EMERGENCY_ACTION = (
    "Contact local emergency services immediately. Do not wait for a clinic appointment."
)
