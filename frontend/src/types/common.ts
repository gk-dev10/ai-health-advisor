export type BodyRegion =
  | "head"
  | "neck"
  | "left_shoulder"
  | "right_shoulder"
  | "chest"
  | "abdomen"
  | "left_arm"
  | "right_arm"
  | "left_hand"
  | "right_hand"
  | "left_leg"
  | "right_leg"
  | "left_foot"
  | "right_foot"
  | "back_upper"
  | "back_lower";

export type Severity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface SymptomEntry {
  region: BodyRegion;
  severity: Severity;
  description: string;
}

export interface ApiAssessmentRequest {
  symptoms: SymptomEntry[];
}

export interface ApiAssessmentResponse {
  assessment: string;
  disclaimer: string;
}
