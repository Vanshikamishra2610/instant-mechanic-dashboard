import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ErrorState({ message, className }: { message: string; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-16 text-center", className)}>
      <AlertTriangle size={20} className="text-status-cancelled" />
      <p className="font-display text-sm font-medium text-base-text">Couldn't load this data</p>
      <p className="max-w-sm text-xs text-base-muted">{message}</p>
    </div>
  );
}
