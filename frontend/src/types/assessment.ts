export interface AssessmentPayload {
  bodyParts: { id: string; severity: number }[];
  query: string;
}
