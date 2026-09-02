from datetime import datetime
from typing import Optional, Generic, TypeVar, List

from pydantic import BaseModel, ConfigDict

from app.models import MechanicStatus, BookingStatus

T = TypeVar("T")


class CustomerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    phone: str
    created_at: datetime


class VehicleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    make: str
    model: str
    year: int
    plate_number: str


class MechanicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    name: str
    email: str
    phone: str
    specialty: str
    status: MechanicStatus
    rating: float
    jobs_completed: int


class MechanicDetailOut(MechanicOut):
    recent_bookings: List["BookingListItem"] = []


class BookingListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    customer_name: str
    vehicle_label: str
    service_category: str
    mechanic_name: Optional[str] = None
    status: BookingStatus
    amount: float
    scheduled_at: datetime
    created_at: datetime


class BookingDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    status: BookingStatus
    service_category: str
    description: Optional[str] = None
    amount: float
    scheduled_at: datetime
    created_at: datetime
    updated_at: datetime
    customer: CustomerOut
    vehicle: VehicleOut
    mechanic: Optional[MechanicOut] = None


class Paginated(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int


class BookingStatusUpdate(BaseModel):
    status: BookingStatus


class DashboardSummary(BaseModel):
    total_bookings: int
    today_bookings: int
    completed_bookings: int
    pending_bookings: int
    cancelled_bookings: int
    total_revenue: float
    active_mechanics: int
    new_customers_this_week: int


class TimeSeriesPoint(BaseModel):
    date: str
    bookings: int
    revenue: float


class StatusBreakdownPoint(BaseModel):
    status: str
    count: int


class CategoryBreakdownPoint(BaseModel):
    category: str
    count: int
    revenue: float


class AnalyticsOut(BaseModel):
    time_series: List[TimeSeriesPoint]
    status_breakdown: List[StatusBreakdownPoint]
    category_breakdown: List[CategoryBreakdownPoint]


class LiveEvent(BaseModel):
    """Shape of every message broadcast over the /ws/live WebSocket."""
    type: str  # "booking_status_changed" | "ping"
    booking_id: Optional[str] = None
    status: Optional[str] = None
    mechanic_name: Optional[str] = None
    timestamp: datetime
