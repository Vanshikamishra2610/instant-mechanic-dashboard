export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  on_the_way: "On The Way",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_COLOR: Record<string, string> = {
  pending: "bg-status-pending/15 text-status-pending border-status-pending/30",
  assigned: "bg-status-assigned/15 text-status-assigned border-status-assigned/30",
  on_the_way: "bg-status-onway/15 text-status-onway border-status-onway/30",
  in_progress: "bg-status-progress/15 text-status-progress border-status-progress/30",
  completed: "bg-status-completed/15 text-status-completed border-status-completed/30",
  cancelled: "bg-status-cancelled/15 text-status-cancelled border-status-cancelled/30",
};

export const MECH_STATUS_LABEL: Record<string, string> = {
  available: "Available",
  on_job: "On a Job",
  offline: "Offline",
};

export const MECH_STATUS_COLOR: Record<string, string> = {
  available: "bg-status-completed/15 text-status-completed border-status-completed/30",
  on_job: "bg-status-progress/15 text-status-progress border-status-progress/30",
  offline: "bg-base-faint/15 text-base-faint border-base-faint/30",
};
