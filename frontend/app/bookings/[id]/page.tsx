"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Car, Wrench, Calendar, IndianRupee, Mail, Phone } from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useLive } from "@/components/LiveProvider";
import { api } from "@/lib/api";
import { formatCurrency, formatDateTime, STATUS_LABEL, STATUS_COLOR } from "@/lib/utils";
import type { BookingDetailOut } from "@/lib/types";

const STATUS_FLOW = ["pending", "assigned", "on_the_way", "in_progress", "completed"];

export default function BookingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetailOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { latestEvent } = useLive();

  useEffect(() => {
    api
      .getBooking(params.id)
      .then((b) => setBooking(b as BookingDetailOut))
      .catch((e) => setError(e instanceof Error ? e.message : "Booking not found"))
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (latestEvent?.booking_id === params.id) {
      api.getBooking(params.id).then((b) => setBooking(b as BookingDetailOut));
    }
  }, [latestEvent, params.id]);

  return (
    <>
      <Topbar title="Booking detail" subtitle={params.id} />
      <main className="flex-1 px-6 py-6 md:px-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1.5 text-xs text-base-muted hover:text-base-text"
        >
          <ArrowLeft size={14} /> Back to bookings
        </button>

        {error && <ErrorState message={error} className="rounded-xl border border-base-border bg-base-surface" />}

        {loading && !error && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        )}

        {!loading && booking && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader
                  title={booking.service_category}
                  subtitle={booking.description || undefined}
                  action={<Badge className={STATUS_COLOR[booking.status]}>{STATUS_LABEL[booking.status]}</Badge>}
                />
                <div className="p-5">
                  {booking.status === "cancelled" ? (
                    <p className="text-sm text-base-muted">This booking was cancelled.</p>
                  ) : (
                    <ol className="flex flex-wrap items-center gap-2">
                      {STATUS_FLOW.map((s, i) => {
                        const currentIdx = STATUS_FLOW.indexOf(booking.status);
                        const reached = i <= currentIdx;
                        return (
                          <li key={s} className="flex items-center gap-2">
                            <span
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                                reached ? STATUS_COLOR[s] : "border-base-border text-base-faint"
                              }`}
                            >
                              {STATUS_LABEL[s]}
                            </span>
                            {i < STATUS_FLOW.length - 1 && <span className="text-base-faint">→</span>}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              </Card>

              <Card>
                <CardHeader title="Vehicle" />
                <div className="grid grid-cols-2 gap-4 p-5 text-sm sm:grid-cols-4">
                  <Info icon={Car} label="Make & Model" value={`${booking.vehicle.make} ${booking.vehicle.model}`} />
                  <Info icon={Calendar} label="Year" value={String(booking.vehicle.year)} />
                  <Info icon={Wrench} label="Plate" value={booking.vehicle.plate_number} />
                  <Info icon={IndianRupee} label="Amount" value={formatCurrency(booking.amount)} />
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader title="Customer" />
                <div className="space-y-3 p-5 text-sm">
                  <Info icon={User} label="Name" value={booking.customer.name} />
                  <Info icon={Mail} label="Email" value={booking.customer.email} />
                  <Info icon={Phone} label="Phone" value={booking.customer.phone} />
                </div>
              </Card>

              <Card>
                <CardHeader title="Mechanic" />
                <div className="space-y-3 p-5 text-sm">
                  {booking.mechanic ? (
                    <>
                      <Info icon={User} label="Name" value={booking.mechanic.name} />
                      <Info icon={Wrench} label="Specialty" value={booking.mechanic.specialty} />
                    </>
                  ) : (
                    <p className="text-base-muted">Not yet assigned</p>
                  )}
                </div>
              </Card>

              <Card>
                <CardHeader title="Timeline" />
                <div className="space-y-3 p-5 text-sm text-base-muted">
                  <p>Scheduled: {formatDateTime(booking.scheduled_at)}</p>
                  <p>Created: {formatDateTime(booking.created_at)}</p>
                  <p>Last updated: {formatDateTime(booking.updated_at)}</p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs text-base-faint">
        <Icon size={12} /> {label}
      </p>
      <p className="text-base-text">{value}</p>
    </div>
  );
}
