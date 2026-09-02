"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  CalendarClock,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
  Wrench,
  UserPlus,
  Radio,
} from "lucide-react";
import { Topbar } from "@/components/Topbar";
import { StatCard } from "@/components/StatCard";
import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { BookingsRevenueChart } from "@/components/charts/BookingsRevenueChart";
import { StatusPieChart } from "@/components/charts/StatusPieChart";
import { useLive } from "@/components/LiveProvider";
import { api } from "@/lib/api";
import { formatCurrency, STATUS_LABEL } from "@/lib/utils";
import type { DashboardSummary, AnalyticsOut } from "@/lib/types";

export default function OverviewPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { events } = useLive();

  useEffect(() => {
    async function load() {
      try {
        const [s, a] = await Promise.all([api.getSummary(), api.getAnalytics(21)]);
        setSummary(s as DashboardSummary);
        setAnalytics(a as AnalyticsOut);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    load();
    // Refresh the summary numbers periodically so they stay current
    // as the live simulator advances bookings in the background.
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Topbar title="Overview" subtitle="Today's operations at a glance" />
      <main className="flex-1 space-y-6 px-6 py-6 md:px-8">
        {error && <ErrorState message={error} className="rounded-xl border border-base-border bg-base-surface" />}

        {!error && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {loading || !summary ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-[104px] rounded-xl" />
                ))
              ) : (
                <>
                  <StatCard label="Total Bookings" value={summary.total_bookings.toLocaleString()} icon={ClipboardList} />
                  <StatCard label="Today's Bookings" value={summary.today_bookings.toLocaleString()} icon={CalendarClock} tone="accent" />
                  <StatCard label="Completed" value={summary.completed_bookings.toLocaleString()} icon={CheckCircle2} tone="positive" />
                  <StatCard label="Pending" value={summary.pending_bookings.toLocaleString()} icon={Clock} />
                  <StatCard label="Cancelled" value={summary.cancelled_bookings.toLocaleString()} icon={XCircle} tone="negative" />
                  <StatCard label="Total Revenue" value={formatCurrency(summary.total_revenue)} icon={IndianRupee} tone="accent" hint="From completed jobs" />
                  <StatCard label="Active Mechanics" value={summary.active_mechanics.toLocaleString()} icon={Wrench} tone="positive" />
                  <StatCard label="New Customers" value={summary.new_customers_this_week.toLocaleString()} icon={UserPlus} hint="Last 7 days" />
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <Card className="xl:col-span-2">
                <CardHeader title="Bookings, last 21 days" subtitle="Daily booking volume" />
                <div className="p-5 pt-4">
                  {loading || !analytics ? (
                    <Skeleton className="h-[260px] w-full" />
                  ) : (
                    <BookingsRevenueChart data={analytics.time_series} metric="bookings" />
                  )}
                </div>
              </Card>

              <Card>
                <CardHeader title="Booking status" subtitle="All-time distribution" />
                <div className="p-5 pt-4">
                  {loading || !analytics ? (
                    <Skeleton className="h-[260px] w-full" />
                  ) : (
                    <StatusPieChart data={analytics.status_breakdown} />
                  )}
                </div>
              </Card>
            </div>

            <Card>
              <CardHeader
                title="Live activity feed"
                subtitle="Booking status changes stream in here in real time via WebSocket"
                action={
                  <span className="flex items-center gap-1.5 text-xs text-base-muted">
                    <Radio size={13} className="text-accent" /> /ws/live
                  </span>
                }
              />
              <div className="max-h-72 divide-y divide-base-border/70 overflow-y-auto">
                {events.length === 0 && (
                  <p className="px-5 py-8 text-center text-xs text-base-muted">
                    Waiting for the next live status change... this updates automatically, no refresh needed.
                  </p>
                )}
                {events.map((e, i) => (
                  <div key={`${e.booking_id}-${e.timestamp}-${i}`} className="flex items-center justify-between px-5 py-3 text-xs">
                    <span className="text-base-muted">
                      Booking <span className="font-mono text-base-text">{e.booking_id}</span>
                      {e.mechanic_name && <> · {e.mechanic_name}</>}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-accent">{STATUS_LABEL[e.status || ""] || e.status}</span>
                      <span className="text-base-faint">
                        {new Date(e.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </main>
    </>
  );
}
