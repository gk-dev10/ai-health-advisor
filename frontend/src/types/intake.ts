export type RoutingCategory =
  | "routine_appointment"
  | "same_day_human_review"
  | "emergency_guidance";

export type RequesterUrgency = "routine" | "urgent";

export type RoutingSource = "team_policy" | "ai_assist" | "safe_fallback";

export type PolicySignalId =
  | "severe_chest_pain"
  | "difficulty_breathing"
  | "unconsciousness"
  | "severe_bleeding"
  | "seizure"
  | "stroke_like_symptoms"
  | "persistent_fever_and_marked_weakness"
  | "persistent_symptoms"
  | "worsening_symptoms"
  | "other_concerning_symptom"
  | "no_policy_signal"
  | "unclear_description";

export interface IntakeSubmission {
  syntheticPatientId: string;
  symptomDescription: string;
  preferredAppointmentTime: string;
  requesterUrgency: RequesterUrgency;
}

export interface AIClassification {
  category: RoutingCategory;
  signalIds: PolicySignalId[];
  isClear: boolean;
}

export interface RoutingSuggestion {
  category: RoutingCategory;
  reason: string;
  source: RoutingSource;
  action?: string | null;
}

export interface IntakeRecord extends IntakeSubmission {
  id: string;
  recommendation: RoutingSuggestion;
  finalCategory: RoutingCategory;
  finalAction: string | null;
  overrideReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeQueueResponse {
  intakes: IntakeRecord[];
}

export interface StaffOverrideRequest {
  finalCategory: RoutingCategory;
  reason: string;
}
