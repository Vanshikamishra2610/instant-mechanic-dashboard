const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(`${res.status} ${res.statusText}: ${body}`, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getSummary: () => request(`/api/dashboard/summary`),
  getAnalytics: (days = 30) => request(`/api/dashboard/analytics?days=${days}`),
  listBookings: (params: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") q.set(k, String(v));
    });
    return request(`/api/bookings?${q.toString()}`);
  },
  getBooking: (id: string) => request(`/api/bookings/${id}`),
  updateBookingStatus: (id: string, status: string) =>
    request(`/api/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  listMechanics: () => request(`/api/mechanics`),
  getMechanic: (id: string) => request(`/api/mechanics/${id}`),
  listCustomers: (search?: string) =>
    request(`/api/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),
};

export { ApiError, API_URL };
