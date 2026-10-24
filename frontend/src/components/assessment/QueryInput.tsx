"use client";

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
}

const MIN_LENGTH = 10;
const MAX_LENGTH = 2000;

export function QueryInput({ value, onChange }: QueryInputProps) {
  const charCount = value.length;
  const isUnderMin = value.trim().length < MIN_LENGTH;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="symptom-query"
          className="text-sm font-semibold text-foreground"
        >
          Describe Your Symptoms
        </label>
        <span
          id="query-counter"
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            charCount > MAX_LENGTH
              ? "bg-red-50 text-red-700"
              : isUnderMin
                ? "bg-muted text-muted-foreground"
                : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {charCount}/{MAX_LENGTH}
        </span>
      </div>
      <textarea
        id="symptom-query"
        value={value}
        maxLength={MAX_LENGTH}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe your pain, symptoms, discomfort, or concerns..."
        rows={5}
        className="w-full resize-y rounded-2xl border border-border bg-background px-4 py-3.5 text-sm leading-relaxed text-foreground shadow-inner shadow-foreground/[0.015] placeholder:text-muted-foreground/80 focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none"
        aria-describedby="query-hint query-counter"
      />
      <p id="query-hint" className="text-xs text-muted-foreground">
        Minimum {MIN_LENGTH}  characters required. Examples: &ldquo;Sharp pain
        while climbing stairs.&rdquo; &ldquo;Burning sensation in lower
        back.&rdquo;
      </p>
      {isUnderMin && charCount > 0 && (
        <p id="query-warning" className="text-xs text-amber-600">
          {MIN_LENGTH - value.trim().length} more character
          {MIN_LENGTH - value.trim().length === 1 ? "" : "s"} needed.
        </p>
      )}
    </div>
  );
}
