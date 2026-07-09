export interface SeverityLevel {
  value: number;
  label: string;
  description: string;
}

export const SEVERITY_SCALE: SeverityLevel[] = [
  {
    value: 1,
    label: "Very Mild",
    description:
      "Slight discomfort. Easily ignored and does not affect daily activities.",
  },
  {
    value: 2,
    label: "Mild",
    description:
      "Noticeable pain or discomfort but daily activities can continue normally.",
  },
  {
    value: 3,
    label: "Moderate",
    description:
      "Pain is difficult to ignore and begins to interfere with normal activities.",
  },
  {
    value: 4,
    label: "Severe",
    description:
      "Pain significantly limits daily activities and makes concentration difficult.",
  },
  {
    value: 5,
    label: "Extreme",
    description:
      "Intense or unbearable pain that prevents normal functioning and may require urgent medical attention.",
  },
];

export const SEVERITY_COLORS: Record<number, string> = {
  1: "#a8e6cf",
  2: "#4caf50",
  3: "#ffeb3b",
  4: "#ff9800",
  5: "#f44336",
};
