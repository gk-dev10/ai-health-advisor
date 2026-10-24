interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border/90 bg-card p-5 shadow-[0_18px_55px_-38px_rgba(20,43,37,0.38)] sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
