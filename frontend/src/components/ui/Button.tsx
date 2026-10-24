import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white shadow-md shadow-primary/15 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-lg focus-visible:ring-primary",
  secondary: "bg-muted text-foreground hover:-translate-y-0.5 hover:bg-border focus-visible:ring-muted-foreground",
  outline:
    "border border-border bg-white text-foreground shadow-sm hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary-light/40 focus-visible:ring-muted-foreground",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
