export interface AssessmentPayload {
  bodyParts: { id: string; name: string; severity: number }[];
  query: string;
}

export interface SymptomInterviewAnswers {
  onset?: string;
  trend?: string;
  sensation?: string;
}

export interface AssessmentGuidance {
  summary: string;
  suggestedSteps: string[];
  followUpQuestions: string[];
  seekCareIf: string[];
}

export interface ApiAssessmentResponse {
  guidance: AssessmentGuidance;
  disclaimer: string;
}
