"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { api } from "@/lib/api";
import { useLive } from "./LiveProvider";
import { Badge } from "./ui/Badge";
import { Skeleton } from "./ui/Skeleton";
import { EmptyState } from "./ui/EmptyState";
import { ErrorState } from "./ui/ErrorState";
import { cn, formatCurrency, formatDateTime, STATUS_LABEL, STATUS_COLOR } from "@/lib/utils";
import type { BookingListItem, Paginated } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "on_the_way", label: "On The Way" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function BookingsTable() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("scheduled_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<Paginated<BookingListItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());

  const { latestEvent } = useLive();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, sortBy, sortDir]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.listBookings({
        search: debouncedSearch || undefined,
        status: status || undefined,
        sort_by: sortBy,
        sort_dir: sortDir,
        page,
        page_size: 15,
      });
      setData(res as Paginated<BookingListItem>);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, sortBy, sortDir, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Re-fetch quietly when a live status change affects a booking we're
  // currently displaying, and flash that row so the update is obvious.
  const lastHandled = useRef<string | null>(null);
  useEffect(() => {
    if (!latestEvent?.booking_id) return;
    const key = `${latestEvent.booking_id}-${latestEvent.timestamp}`;
    if (lastHandled.current === key) return;
    lastHandled.current = key;

    const affectsCurrentPage = data?.items.some((b) => b.id === latestEvent.booking_id);
    if (affectsCurrentPage) {
      setFlashIds((prev) => new Set(prev).add(latestEvent.booking_id!));
      load();
      setTimeout(() => {
        setFlashIds((prev) => {
          const next = new Set(prev);
          next.delete(latestEvent.booking_id!);
          return next;
        });
      }, 1800);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestEvent]);

  function toggleSort(field: string) {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  }

  const columns: { key: string; label: string; sortable?: boolean }[] = [
    { key: "id", label: "Booking ID" },
    { key: "customer_name", label: "Customer" },
    { key: "vehicle_label", label: "Vehicle" },
    { key: "service_category", label: "Service" },
    { key: "mechanic_name", label: "Mechanic" },
    { key: "status", label: "Status", sortable: true },
    { key: "amount", label: "Amount", sortable: true },
    { key: "scheduled_at", label: "Date / Time", sortable: true },
  ];

  return (
    <div className="rounded-xl border border-base-border bg-base-surface shadow-panel">
      <div className="flex flex-wrap items-center gap-3 border-b border-base-border px-5 py-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base-faint" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, plate number or booking ID..."
            className="w-full rounded-lg border border-base-border bg-base-surface2 py-2 pl-9 pr-3 text-sm text-base-text placeholder:text-base-faint focus:border-accent/50 focus:outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-base-border bg-base-surface2 px-3 py-2 text-sm text-base-text focus:border-accent/50 focus:outline-none"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorState message={error} />}

      {!error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-base-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && toggleSort(col.key)}
                    className={cn(
                      "whitespace-nowrap px-5 py-3 text-xs font-medium text-base-muted",
                      col.sortable && "cursor-pointer select-none hover:text-base-text"
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortable && sortBy === col.key && (
                        sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-base-border/60">
                    {columns.map((c) => (
                      <td key={c.key} className="px-5 py-3.5">
                        <Skeleton className="h-4 w-full max-w-[140px]" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!loading &&
                data?.items.map((b) => (
                  <tr
                    key={b.id}
                    className={cn(
                      "border-b border-base-border/60 transition-colors hover:bg-base-surface2/60",
                      flashIds.has(b.id) && "animate-flash-row"
                    )}
                  >
                    <td className="px-5 py-3.5 font-mono text-xs text-base-muted">
                      <Link href={`/bookings/${b.id}`} className="hover:text-accent">
                        {b.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-base-text">{b.customer_name}</td>
                    <td className="px-5 py-3.5 text-base-muted">{b.vehicle_label}</td>
                    <td className="px-5 py-3.5 text-base-muted">{b.service_category}</td>
                    <td className="px-5 py-3.5 text-base-muted">{b.mechanic_name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <Badge className={STATUS_COLOR[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                    </td>
                    <td className="px-5 py-3.5 tabular text-base-text">{formatCurrency(b.amount)}</td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-base-muted">
                      {formatDateTime(b.scheduled_at)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && data && data.items.length === 0 && (
            <EmptyState
              icon={<ClipboardList size={22} />}
              title="No bookings match your filters"
              description="Try a different search term or clear the status filter."
            />
          )}
        </div>
      )}

      {!error && data && data.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-base-border px-5 py-3">
          <p className="text-xs text-base-muted">
            Page {data.page} of {data.total_pages} · {data.total} bookings
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-border text-base-muted hover:text-base-text disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
              disabled={page >= data.total_pages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-base-border text-base-muted hover:text-base-text disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
