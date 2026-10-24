export type RoutingCategory =
  | "routine_appointment"
  | "same_day_human_review"
  | "emergency_guidance";

export type RequesterUrgency = "routine" | "urgent";

export type RoutingSource = "team_policy" | "ai_assist" | "safe_fallback";

export interface IntakeSubmission {
  syntheticPatientId: string;
  symptomDescription: string;
  preferredAppointmentTime: string;
  requesterUrgency: RequesterUrgency;
}

export interface AIClassification {
  category: RoutingCategory;
  reason: string;
  isClear: boolean;
}

export interface RoutingSuggestion {
  category: RoutingCategory;
  reason: string;
  source: RoutingSource;
}
