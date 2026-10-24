import { SEVERITY_SCALE } from "@/constants/severityScale";
import type { SelectedBodyPart } from "@/types/body";
import type { ApiAssessmentResponse, SymptomInterviewAnswers } from "@/types/assessment";

export function downloadVisitSummary(args: {
  selectedParts: SelectedBodyPart[];
  description: string;
  interview: SymptomInterviewAnswers;
  guidance: ApiAssessmentResponse | null;
}) {
  const { selectedParts, description, interview, guidance } = args;
  const lines = [
    "BODY MAP VISIT SUMMARY",
    `Created: ${new Date().toLocaleString()}`,
    "",
    "REPORTED BODY AREAS",
    ...(selectedParts.length
      ? selectedParts.map((part) => {
          const level = SEVERITY_SCALE.find((item) => item.value === (part.severity ?? 1));
          return `- ${part.name}: severity ${part.severity ?? 1}${level ? ` (${level.label})` : ""}`;
        })
      : ["- No body regions selected."]),
    "",
    "DESCRIPTION PROVIDED",
    description.trim() || "No written description provided.",
    "",
    "OPTIONAL GUIDED DETAILS",
    ...([
      ["Onset", interview.onset],
      ["Trend", interview.trend],
      ["Sensation", interview.sensation],
    ] as const).filter(([, value]) => value).map(([label, value]) => `- ${label}: ${value}`),
  ];

  if (guidance) {
    lines.push(
      "",
      "AI-GENERATED GENERAL INFORMATION",
      guidance.guidance.summary,
      "",
      "Possible next steps:",
      ...guidance.guidance.suggestedSteps.map((step) => `- ${step}`),
      "",
      "Questions to consider:",
      ...guidance.guidance.followUpQuestions.map((question) => `- ${question}`),
      "",
      "When to seek care:",
      ...guidance.guidance.seekCareIf.map((situation) => `- ${situation}`),
      "",
      guidance.disclaimer
    );
  }

  lines.push(
    "",
    "This file records information entered by the user and optional AI-generated general information. It is not a diagnosis or treatment plan. Review it with a qualified health professional."
  );

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `body-map-visit-summary-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
