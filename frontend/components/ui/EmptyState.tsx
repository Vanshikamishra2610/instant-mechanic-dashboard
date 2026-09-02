import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-16 text-center", className)}>
      {icon && <div className="mb-1 text-base-faint">{icon}</div>}
      <p className="font-display text-sm font-medium text-base-text">{title}</p>
      {description && <p className="max-w-sm text-xs text-base-muted">{description}</p>}
    </div>
  );
}
