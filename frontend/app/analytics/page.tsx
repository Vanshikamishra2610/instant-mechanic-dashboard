"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/Topbar";
import { Card, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Button } from "@/components/ui/Button";
import { BookingsRevenueChart } from "@/components/charts/BookingsRevenueChart";
import { StatusPieChart } from "@/components/charts/StatusPieChart";
import { CategoryBarChart } from "@/components/charts/CategoryBarChart";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { AnalyticsOut } from "@/lib/types";

const RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState<AnalyticsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getAnalytics(days)
      .then((a) => setAnalytics(a as AnalyticsOut))
      .catch((e) => setError(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <>
      <Topbar title="Analytics" subtitle="Trends across bookings, revenue and service mix" />
      <main className="flex-1 space-y-6 px-6 py-6 md:px-8">
        {error && <ErrorState message={error} className="rounded-xl border border-base-border bg-base-surface" />}

        {!error && (
          <>
            <div className="flex justify-end gap-2">
              {RANGES.map((r) => (
                <Button
                  key={r.days}
                  variant={days === r.days ? "primary" : "secondary"}
                  className={cn("h-8 px-3 text-xs")}
                  onClick={() => setDays(r.days)}
                >
                  {r.label}
                </Button>
              ))}
            </div>

            <Card>
              <CardHeader title="Bookings over time" subtitle={`Daily volume, last ${days} days`} />
              <div className="p-5 pt-4">
                {loading || !analytics ? <Skeleton className="h-[260px] w-full" /> : (
                  <BookingsRevenueChart data={analytics.time_series} metric="bookings" />
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title="Revenue over time" subtitle={`Daily revenue, last ${days} days`} />
              <div className="p-5 pt-4">
                {loading || !analytics ? <Skeleton className="h-[260px] w-full" /> : (
                  <BookingsRevenueChart data={analytics.time_series} metric="revenue" />
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader title="Booking status" subtitle="All-time distribution" />
                <div className="p-5 pt-4">
                  {loading || !analytics ? <Skeleton className="h-[260px] w-full" /> : (
                    <StatusPieChart data={analytics.status_breakdown} />
                  )}
                </div>
              </Card>

              <Card>
                <CardHeader title="Service category breakdown" subtitle="Bookings by category, all-time" />
                <div className="p-5 pt-4">
                  {loading || !analytics ? <Skeleton className="h-[320px] w-full" /> : (
                    <CategoryBarChart data={analytics.category_breakdown} />
                  )}
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </>
  );
}
