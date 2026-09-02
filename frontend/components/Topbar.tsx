"use client";

import { useLive } from "./LiveProvider";
import { cn } from "@/lib/utils";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { connectionState, latestEvent } = useLive();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-base-border px-6 py-4 md:px-8">
      <div>
        <h1 className="font-display text-lg font-semibold text-base-text">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-base-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {latestEvent && connectionState === "open" && (
          <span className="hidden text-xs text-base-muted lg:inline">
            Last update: booking{" "}
            <span className="font-mono text-base-text">{latestEvent.booking_id}</span> →{" "}
            <span className="text-accent">{latestEvent.status}</span>
          </span>
        )}
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium",
            connectionState === "open" &&
              "border-status-completed/30 bg-status-completed/10 text-status-completed",
            connectionState === "connecting" &&
              "border-status-progress/30 bg-status-progress/10 text-status-progress",
            connectionState === "closed" &&
              "border-status-cancelled/30 bg-status-cancelled/10 text-status-cancelled"
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full bg-current",
              connectionState === "open" && "animate-pulse-dot"
            )}
          />
          {connectionState === "open" && "Live"}
          {connectionState === "connecting" && "Connecting"}
          {connectionState === "closed" && "Reconnecting"}
        </div>
      </div>
    </header>
  );
}
