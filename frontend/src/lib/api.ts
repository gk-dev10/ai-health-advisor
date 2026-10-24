import type { ApiAssessmentResponse, AssessmentPayload } from "@/types/assessment";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

export async function submitAssessment(
  payload: AssessmentPayload
): Promise<ApiAssessmentResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/assessments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => null)) as
    | (ApiAssessmentResponse & { detail?: string })
    | null;

  if (!response.ok) {
    throw new Error(
      data?.detail ?? "Could not generate guidance. Check that the API is running and try again."
    );
  }

  if (!data?.guidance) {
    throw new Error("The API returned an unexpected response. Please try again.");
  }

  return data;
}
