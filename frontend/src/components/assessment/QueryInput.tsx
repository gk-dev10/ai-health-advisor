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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="symptom-query"
          className="text-sm font-semibold text-foreground"
        >
          Describe Your Symptoms
        </label>
        <span
          id="query-counter"
          className={`text-xs ${
            charCount > MAX_LENGTH
              ? "text-red-500"
              : isUnderMin
                ? "text-muted-foreground"
                : "text-green-600"
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
        className="w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
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
