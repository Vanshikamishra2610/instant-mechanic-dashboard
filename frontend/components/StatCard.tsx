import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "default" | "accent" | "positive" | "negative";
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-base-border bg-base-surface p-5 shadow-panel">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-base-muted">{label}</p>
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            tone === "default" && "bg-base-surface2 text-base-muted",
            tone === "accent" && "bg-accent/15 text-accent",
            tone === "positive" && "bg-status-completed/15 text-status-completed",
            tone === "negative" && "bg-status-cancelled/15 text-status-cancelled"
          )}
        >
          <Icon size={15} strokeWidth={2} />
        </div>
      </div>
      <p className="mt-4 font-display text-2xl font-semibold tabular text-base-text">{value}</p>
      {hint && <p className="mt-1 text-xs text-base-faint">{hint}</p>}
    </div>
  );
}
