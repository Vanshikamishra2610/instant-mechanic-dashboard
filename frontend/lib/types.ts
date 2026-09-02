export type BookingStatus =
  | "pending"
  | "assigned"
  | "on_the_way"
  | "in_progress"
  | "completed"
  | "cancelled";

export type MechanicStatus = "available" | "on_job" | "offline";

export interface DashboardSummary {
  total_bookings: number;
  today_bookings: number;
  completed_bookings: number;
  pending_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  active_mechanics: number;
  new_customers_this_week: number;
}

export interface TimeSeriesPoint {
  date: string;
  bookings: number;
  revenue: number;
}

export interface StatusBreakdownPoint {
  status: string;
  count: number;
}

export interface CategoryBreakdownPoint {
  category: string;
  count: number;
  revenue: number;
}

export interface AnalyticsOut {
  time_series: TimeSeriesPoint[];
  status_breakdown: StatusBreakdownPoint[];
  category_breakdown: CategoryBreakdownPoint[];
}

export interface BookingListItem {
  id: string;
  customer_name: string;
  vehicle_label: string;
  service_category: string;
  mechanic_name: string | null;
  status: BookingStatus;
  amount: number;
  scheduled_at: string;
  created_at: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CustomerOut {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface VehicleOut {
  id: string;
  make: string;
  model: string;
  year: number;
  plate_number: string;
}

export interface MechanicOut {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  status: MechanicStatus;
  rating: number;
  jobs_completed: number;
}

export interface MechanicDetailOut extends MechanicOut {
  recent_bookings: BookingListItem[];
}

export interface BookingDetailOut {
  id: string;
  status: BookingStatus;
  service_category: string;
  description: string | null;
  amount: number;
  scheduled_at: string;
  created_at: string;
  updated_at: string;
  customer: CustomerOut;
  vehicle: VehicleOut;
  mechanic: MechanicOut | null;
}

export interface LiveEvent {
  type: string;
  booking_id?: string;
  status?: string;
  mechanic_name?: string;
  timestamp: string;
}
