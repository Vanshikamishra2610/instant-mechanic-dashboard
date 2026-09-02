"use client";

import { useEffect, useState } from "react";
import { Wrench } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { MechanicCard } from "@/components/MechanicCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { api } from "@/lib/api";
import type { MechanicOut } from "@/lib/types";

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState<MechanicOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listMechanics()
      .then((m) => setMechanics(m as MechanicOut[]))
      .catch((e) => setError(e instanceof Error ? e.message : "Something went wrong"));
  }, []);

  return (
    <>
      <Topbar title="Mechanics" subtitle="Team roster, workload and performance" />
      <main className="flex-1 px-6 py-6 md:px-8">
        {error && <ErrorState message={error} className="rounded-xl border border-base-border bg-base-surface" />}

        {!error && !mechanics && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[132px] rounded-xl" />
            ))}
          </div>
        )}

        {!error && mechanics && mechanics.length === 0 && (
          <EmptyState icon={<Wrench size={22} />} title="No mechanics on record yet" />
        )}

        {!error && mechanics && mechanics.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mechanics.map((m) => (
              <MechanicCard key={m.id} mechanic={m} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
