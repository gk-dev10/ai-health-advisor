"use client";

import type { SymptomInterviewAnswers } from "@/types/assessment";
import { ChevronDown } from "lucide-react";

interface GuidedSymptomInterviewProps {
  value: SymptomInterviewAnswers;
  onChange: (value: SymptomInterviewAnswers) => void;
}

const QUESTIONS: {
  key: keyof SymptomInterviewAnswers;
  label: string;
  options: string[];
}[] = [
  {
    key: "onset",
    label: "When did it start?",
    options: ["Today", "1–3 days ago", "4–7 days ago", "More than a week ago", "Not sure"],
  },
  {
    key: "trend",
    label: "How has it changed?",
    options: ["Getting better", "About the same", "Getting worse", "Comes and goes", "Not sure"],
  },
  {
    key: "sensation",
    label: "How would you describe the sensation?",
    options: ["Aching", "Sharp", "Burning", "Tingling or numb", "Pressure", "Other or not sure"],
  },
];

export function GuidedSymptomInterview({ value, onChange }: GuidedSymptomInterviewProps) {
  return (
    <details className="group rounded-2xl border border-border bg-white shadow-sm">
      <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-semibold text-foreground marker:hidden">
        <span className="flex items-center justify-between gap-3">Add a few details <span className="inline-flex items-center text-xs font-medium text-muted-foreground">Optional <ChevronDown className="ml-2 size-4 transition-transform group-open:rotate-180" aria-hidden="true" /></span></span>
      </summary>
      <div className="grid gap-4 border-t border-border p-4 sm:grid-cols-3">
        {QUESTIONS.map((question) => (
          <div key={question.key}>
            <label htmlFor={`interview-${question.key}`} className="text-xs font-semibold text-foreground">
              {question.label}
            </label>
            <select
              id={`interview-${question.key}`}
              value={value[question.key] ?? ""}
              onChange={(event) =>
                onChange({ ...value, [question.key]: event.target.value || undefined })
              }
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
            >
              <option value="">Skip</option>
              {question.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ))}
        <p className="text-xs leading-relaxed text-muted-foreground sm:col-span-3">
          These optional answers are added to your description for this request. They do not determine a diagnosis.
        </p>
      </div>
    </details>
  );
}
