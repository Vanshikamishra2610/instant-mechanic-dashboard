import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-base-border bg-base-surface shadow-panel",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-base-border px-5 py-4">
      <div>
        <h3 className="font-display text-sm font-medium text-base-text">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-base-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
