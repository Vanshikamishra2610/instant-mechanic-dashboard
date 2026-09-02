import Link from "next/link";
import { Star, Briefcase } from "lucide-react";
import { Badge } from "./ui/Badge";
import { MECH_STATUS_LABEL, MECH_STATUS_COLOR } from "@/lib/utils";
import type { MechanicOut } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MechanicCard({ mechanic }: { mechanic: MechanicOut }) {
  return (
    <Link
      href={`/mechanics/${mechanic.id}`}
      className="block rounded-xl border border-base-border bg-base-surface p-5 shadow-panel transition-colors hover:border-accent/40"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-base-surface2 font-display text-xs font-semibold text-base-text">
            {initials(mechanic.name)}
          </div>
          <div>
            <p className="font-display text-sm font-medium text-base-text">{mechanic.name}</p>
            <p className="text-xs text-base-muted">{mechanic.specialty}</p>
          </div>
        </div>
        <Badge className={MECH_STATUS_COLOR[mechanic.status]}>
          {MECH_STATUS_LABEL[mechanic.status]}
        </Badge>
      </div>

      <div className="mt-4 flex items-center gap-4 border-t border-base-border pt-3 text-xs text-base-muted">
        <span className="flex items-center gap-1.5">
          <Star size={13} className="text-accent" fill="currentColor" />
          {mechanic.rating.toFixed(1)}
        </span>
        <span className="flex items-center gap-1.5">
          <Briefcase size={13} />
          {mechanic.jobs_completed} jobs completed
        </span>
      </div>
    </Link>
  );
}
