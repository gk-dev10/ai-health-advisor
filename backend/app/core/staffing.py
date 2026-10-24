"""Fictional staffing roster and priority-to-team routing for the demo."""

from dataclasses import dataclass

from app.core.triage_policy import RoutingCategory


@dataclass(frozen=True)
class TeamRoute:
    team_id: str
    team_name: str
    priority_label: str


@dataclass(frozen=True)
class DemoClinician:
    id: str
    name: str
    role: str
    team_id: str
    team_name: str
    case_capacity: int


TEAM_ROUTES: dict[RoutingCategory, TeamRoute] = {
    RoutingCategory.EMERGENCY_GUIDANCE: TeamRoute(
        team_id="emergency_escalation",
        team_name="Emergency services escalation",
        priority_label="Contact emergency services now",
    ),
    RoutingCategory.SAME_DAY_HUMAN_REVIEW: TeamRoute(
        team_id="same_day_review",
        team_name="Same-day clinician review",
        priority_label="Same-day staff review",
    ),
    RoutingCategory.ROUTINE_APPOINTMENT: TeamRoute(
        team_id="general_appointments",
        team_name="General appointment pool",
        priority_label="Routine scheduling",
    ),
}

# These names and capacities are fictional demo data, not real staff or availability.
# Immediate emergency guidance is escalated outside the appointment roster.
DEMO_CLINICIANS: tuple[DemoClinician, ...] = (
    DemoClinician("demo-clinician-03", "Dr. Leena Das", "Clinic clinician", "same_day_review", "Same-day clinician review", 5),
    DemoClinician("demo-clinician-04", "Dr. Arjun Nair", "Clinic clinician", "same_day_review", "Same-day clinician review", 5),
    DemoClinician("demo-clinician-05", "Dr. Kavya Rao", "Clinic clinician", "general_appointments", "General appointment pool", 6),
    DemoClinician("demo-clinician-06", "Dr. Neel Shah", "Clinic clinician", "general_appointments", "General appointment pool", 6),
)

CLINICIAN_BY_ID = {clinician.id: clinician for clinician in DEMO_CLINICIANS}


def team_route_for(category: RoutingCategory) -> TeamRoute:
    return TEAM_ROUTES[category]
