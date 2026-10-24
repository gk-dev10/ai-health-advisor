"""Versioned routing vocabulary and team policy for clinic intake."""

from dataclasses import dataclass
from enum import Enum
import re


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


class PolicySignalId(str, Enum):
    SEVERE_CHEST_PAIN = "severe_chest_pain"
    DIFFICULTY_BREATHING = "difficulty_breathing"
    UNCONSCIOUSNESS = "unconsciousness"
    SEVERE_BLEEDING = "severe_bleeding"
    SEIZURE = "seizure"
    STROKE_LIKE_SYMPTOMS = "stroke_like_symptoms"
    PERSISTENT_FEVER_AND_MARKED_WEAKNESS = "persistent_fever_and_marked_weakness"
    PERSISTENT_SYMPTOMS = "persistent_symptoms"
    WORSENING_SYMPTOMS = "worsening_symptoms"
    OTHER_CONCERNING_SYMPTOM = "other_concerning_symptom"
    NO_POLICY_SIGNAL = "no_policy_signal"
    UNCLEAR_DESCRIPTION = "unclear_description"


@dataclass(frozen=True)
class PolicyRule:
    """A rule matches when each cue group has at least one matching phrase."""

    rule_id: str
    signal_id: PolicySignalId
    category: RoutingCategory
    cue_groups: tuple[tuple[str, ...], ...]
    reason: str


POLICY_VERSION = "hackathon-v1"

# A matched emergency rule must take precedence over the model's category.
EMERGENCY_RULES: tuple[PolicyRule, ...] = (
    PolicyRule(
        rule_id="severe_chest_pain",
        signal_id=PolicySignalId.SEVERE_CHEST_PAIN,
        category=RoutingCategory.EMERGENCY_GUIDANCE,
        cue_groups=(("severe chest pain",),),
        reason="The description matches the team's emergency policy for severe chest pain.",
    ),
    PolicyRule(
        rule_id="difficulty_breathing",
        signal_id=PolicySignalId.DIFFICULTY_BREATHING,
        category=RoutingCategory.EMERGENCY_GUIDANCE,
        cue_groups=(("difficulty breathing", "trouble breathing"),),
        reason="The description matches the team's emergency policy for difficulty breathing.",
    ),
    PolicyRule(
        rule_id="unconsciousness",
        signal_id=PolicySignalId.UNCONSCIOUSNESS,
        category=RoutingCategory.EMERGENCY_GUIDANCE,
        cue_groups=(("unconscious", "unresponsive", "passed out"),),
        reason="The description matches the team's emergency policy for loss of consciousness.",
    ),
    PolicyRule(
        rule_id="severe_bleeding",
        signal_id=PolicySignalId.SEVERE_BLEEDING,
        category=RoutingCategory.EMERGENCY_GUIDANCE,
        cue_groups=(("severe bleeding", "bleeding heavily"),),
        reason="The description matches the team's emergency policy for severe bleeding.",
    ),
    PolicyRule(
        rule_id="seizure",
        signal_id=PolicySignalId.SEIZURE,
        category=RoutingCategory.EMERGENCY_GUIDANCE,
        cue_groups=(("seizure", "having a fit"),),
        reason="The description matches the team's emergency policy for seizure activity.",
    ),
    PolicyRule(
        rule_id="stroke_like_symptoms",
        signal_id=PolicySignalId.STROKE_LIKE_SYMPTOMS,
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
        signal_id=PolicySignalId.PERSISTENT_FEVER_AND_MARKED_WEAKNESS,
        category=RoutingCategory.SAME_DAY_HUMAN_REVIEW,
        cue_groups=(
            ("persistent fever", "fever for days", "fever that has lasted"),
            ("very weak", "significant weakness", "marked weakness"),
        ),
        reason="The description matches the team's same-day policy for persistent fever with marked weakness.",
    ),
    PolicyRule(
        rule_id="persistent_symptoms",
        signal_id=PolicySignalId.PERSISTENT_SYMPTOMS,
        category=RoutingCategory.SAME_DAY_HUMAN_REVIEW,
        cue_groups=(("persistent symptoms", "symptoms have persisted", "symptoms haven't improved"),),
        reason="The description mentions persistent symptoms requiring human review.",
    ),
    PolicyRule(
        rule_id="worsening_symptoms",
        signal_id=PolicySignalId.WORSENING_SYMPTOMS,
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

REQUESTER_URGENT_REASON = (
    "The requester marked this request urgent, so it is routed for same-day human review."
)

AI_EMERGENCY_REASON = (
    "AI flagged the description as potentially requiring immediate attention under the team's routing policy."
)
AI_SAME_DAY_REASON = (
    "AI flagged the description for same-day human review under the team's routing policy."
)
AI_ROUTINE_REASON = (
    "AI found no escalation signal in the request and classified it for a routine appointment."
)

_NEGATION_BEFORE = re.compile(
    r"\b(?:no|not|never|deny|denies|without|don t|doesn t|didn t|isn t|aren t|haven t|hasn t)"
    r"\b(?:\s+\w+){0,2}\s*$",
    re.IGNORECASE,
)
_HISTORICAL_BEFORE = re.compile(
    r"\b(?:history of|previously|in the past|used to|when i was)"
    r"(?:\s+\w+){0,5}\s*$",
    re.IGNORECASE,
)
_HYPOTHETICAL_BEFORE = re.compile(
    r"\b(?:what if|if i had|if i experienced|if someone|hypothetically|for example)"
    r"(?:\s+\w+){0,5}\s*$",
    re.IGNORECASE,
)
_HISTORICAL_AFTER = re.compile(
    r"^\s+(?:(?:\w+\s+){0,3})(?:years? ago|last (?:week|month|year)|in \d+)",
    re.IGNORECASE,
)


def _normalize(value: str) -> str:
    value = value.casefold()
    value = re.sub(r"[.;:!?]+|\b(?:but|however|although)\b", " | ", value)
    return " ".join(re.sub(r"[^\w|]+", " ", value).split())


def _has_current_phrase(description: str, phrase: str) -> bool:
    normalized = _normalize(description)
    term = _normalize(phrase)
    if not term:
        return False

    start = 0
    while True:
        index = normalized.find(term, start)
        if index < 0:
            return False
        end = index + len(term)
        if (index == 0 or normalized[index - 1] in " |") and (
            end == len(normalized) or normalized[end] in " |"
        ):
            before = normalized[max(0, index - 100) : index].rsplit("|", 1)[-1]
            after = normalized[end : end + 70].split("|", 1)[0]
            if not any(
                pattern.search(before)
                for pattern in (_NEGATION_BEFORE, _HISTORICAL_BEFORE, _HYPOTHETICAL_BEFORE)
            ) and not _HISTORICAL_AFTER.match(after):
                return True
        start = index + 1


def matching_rules(description: str, rules: tuple[PolicyRule, ...]) -> tuple[PolicyRule, ...]:
    """Return rules whose every cue group has an active matching phrase."""
    if not description.strip():
        return ()
    return tuple(
        rule
        for rule in rules
        if all(
            any(_has_current_phrase(description, phrase) for phrase in group)
            for group in rule.cue_groups
        )
    )
