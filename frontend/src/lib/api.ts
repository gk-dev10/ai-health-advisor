import type { ApiAssessmentResponse, AssessmentPayload } from "@/types/assessment";
import type {
  IntakeQueueResponse,
  IntakeRecord,
  IntakeSubmission,
  StaffOverrideRequest,
} from "@/types/intake";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

async function readApiResponse<T>(response: Response, fallback: string): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | (T & { detail?: string })
    | null;

  if (!response.ok) {
    throw new Error(data?.detail ?? fallback);
  }
  if (data === null) {
    throw new Error("The API returned an unexpected response. Please try again.");
  }
  return data;
}

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

export async function submitIntake(
  payload: IntakeSubmission
): Promise<IntakeRecord> {
  const response = await fetch(`${API_BASE_URL}/api/v1/intakes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const data = await readApiResponse<IntakeRecord>(
    response,
    "Could not save this intake request. Check that the API is running and try again."
  );
  if (!data.id || !data.recommendation) {
    throw new Error("The API returned an unexpected intake response. Please try again.");
  }
  return data;
}

export async function fetchIntakes(limit = 100): Promise<IntakeQueueResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/intakes?limit=${encodeURIComponent(limit)}`,
    { cache: "no-store" }
  );
  const data = await readApiResponse<IntakeQueueResponse>(
    response,
    "Could not load the intake queue. Check that the API is running and try again."
  );
  if (!Array.isArray(data.intakes)) {
    throw new Error("The API returned an unexpected queue response. Please try again.");
  }
  return data;
}

export async function saveIntakeOverride(
  id: string,
  payload: StaffOverrideRequest
): Promise<IntakeRecord> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/intakes/${encodeURIComponent(id)}/override`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    }
  );
  const data = await readApiResponse<IntakeRecord>(
    response,
    "Could not save the staff disposition. Please try again."
  );
  if (!data.id || !data.recommendation) {
    throw new Error("The API returned an unexpected intake response. Please try again.");
  }
  return data;
}
