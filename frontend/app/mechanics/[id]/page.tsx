"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, Briefcase, Mail, Phone } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime, MECH_STATUS_LABEL, MECH_STATUS_COLOR, STATUS_LABEL, STATUS_COLOR } from "@/lib/utils";
import type { MechanicDetailOut } from "@/lib/types";

export default function MechanicDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [mechanic, setMechanic] = useState<MechanicDetailOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getMechanic(params.id)
      .then((m) => setMechanic(m as MechanicDetailOut))
      .catch((e) => setError(e instanceof Error ? e.message : "Mechanic not found"));
  }, [params.id]);

  return (
    <>
      <Topbar title="Mechanic profile" subtitle={params.id} />
      <main className="flex-1 px-6 py-6 md:px-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-xs text-base-muted hover:text-base-text"
        >
          <ArrowLeft size={14} /> Back to mechanics
        </button>

        {error && <ErrorState message={error} className="rounded-xl border border-base-border bg-base-surface" />}

        {!error && !mechanic && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-40 lg:col-span-1" />
            <Skeleton className="h-96 lg:col-span-2" />
          </div>
        )}

        {!error && mechanic && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="h-fit">
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-base font-semibold text-base-text">{mechanic.name}</h2>
                  <Badge className={MECH_STATUS_COLOR[mechanic.status]}>{MECH_STATUS_LABEL[mechanic.status]}</Badge>
                </div>
                <p className="mt-1 text-xs text-base-muted">{mechanic.specialty}</p>

                <div className="mt-4 space-y-2 border-t border-base-border pt-4 text-sm">
                  <p className="flex items-center gap-2 text-base-muted">
                    <Star size={13} className="text-accent" fill="currentColor" /> {mechanic.rating.toFixed(1)} rating
                  </p>
                  <p className="flex items-center gap-2 text-base-muted">
                    <Briefcase size={13} /> {mechanic.jobs_completed} jobs completed
                  </p>
                  <p className="flex items-center gap-2 text-base-muted">
                    <Mail size={13} /> {mechanic.email}
                  </p>
                  <p className="flex items-center gap-2 text-base-muted">
                    <Phone size={13} /> {mechanic.phone}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader title="Recent bookings" subtitle="Latest jobs assigned to this mechanic" />
              {mechanic.recent_bookings.length === 0 ? (
                <EmptyState title="No bookings assigned yet" />
              ) : (
                <div className="divide-y divide-base-border/70">
                  {mechanic.recent_bookings.map((b) => (
                    <Link
                      key={b.id}
                      href={`/bookings/${b.id}`}
                      className="flex items-center justify-between px-5 py-3.5 text-sm hover:bg-base-surface2/60"
                    >
                      <div>
                        <p className="text-base-text">{b.customer_name}</p>
                        <p className="text-xs text-base-muted">{b.service_category} · {b.vehicle_label}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={STATUS_COLOR[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                        <p className="mt-1 text-xs text-base-muted">{formatCurrency(b.amount)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </>
  );
}
