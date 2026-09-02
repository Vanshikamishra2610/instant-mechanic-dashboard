from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Booking, Mechanic, Customer, MechanicStatus, BookingStatus
from app.schemas import (
    DashboardSummary,
    AnalyticsOut,
    TimeSeriesPoint,
    StatusBreakdownPoint,
    CategoryBreakdownPoint,
)

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_summary(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)

    total_bookings = db.query(func.count(Booking.id)).scalar()
    today_bookings = (
        db.query(func.count(Booking.id)).filter(Booking.scheduled_at >= today_start).scalar()
    )
    completed = (
        db.query(func.count(Booking.id))
        .filter(Booking.status == BookingStatus.completed)
        .scalar()
    )
    pending = (
        db.query(func.count(Booking.id))
        .filter(Booking.status == BookingStatus.pending)
        .scalar()
    )
    cancelled = (
        db.query(func.count(Booking.id))
        .filter(Booking.status == BookingStatus.cancelled)
        .scalar()
    )
    total_revenue = (
        db.query(func.coalesce(func.sum(Booking.amount), 0.0))
        .filter(Booking.status == BookingStatus.completed)
        .scalar()
    )
    active_mechanics = (
        db.query(func.count(Mechanic.id))
        .filter(Mechanic.status != MechanicStatus.offline)
        .scalar()
    )
    new_customers = (
        db.query(func.count(Customer.id)).filter(Customer.created_at >= week_ago).scalar()
    )

    return DashboardSummary(
        total_bookings=total_bookings or 0,
        today_bookings=today_bookings or 0,
        completed_bookings=completed or 0,
        pending_bookings=pending or 0,
        cancelled_bookings=cancelled or 0,
        total_revenue=round(total_revenue or 0.0, 2),
        active_mechanics=active_mechanics or 0,
        new_customers_this_week=new_customers or 0,
    )


@router.get("/analytics", response_model=AnalyticsOut)
def get_analytics(days: int = 30, db: Session = Depends(get_db)):
    since = datetime.now(timezone.utc) - timedelta(days=days)

    # Bookings + revenue per day
    rows = (
        db.query(
            func.date(Booking.scheduled_at).label("day"),
            func.count(Booking.id).label("bookings"),
            func.coalesce(func.sum(Booking.amount), 0.0).label("revenue"),
        )
        .filter(Booking.scheduled_at >= since)
        .group_by("day")
        .order_by("day")
        .all()
    )
    time_series = [
        TimeSeriesPoint(date=str(r.day), bookings=r.bookings, revenue=round(r.revenue, 2))
        for r in rows
    ]

    # Status breakdown (all-time, for a clear pie chart)
    status_rows = (
        db.query(Booking.status, func.count(Booking.id).label("count"))
        .group_by(Booking.status)
        .all()
    )
    status_breakdown = [
        StatusBreakdownPoint(status=s.value, count=c) for s, c in status_rows
    ]

    # Category breakdown
    cat_rows = (
        db.query(
            Booking.service_category,
            func.count(Booking.id).label("count"),
            func.coalesce(func.sum(Booking.amount), 0.0).label("revenue"),
        )
        .group_by(Booking.service_category)
        .order_by(func.count(Booking.id).desc())
        .all()
    )
    category_breakdown = [
        CategoryBreakdownPoint(category=cat, count=count, revenue=round(rev, 2))
        for cat, count, rev in cat_rows
    ]

    return AnalyticsOut(
        time_series=time_series,
        status_breakdown=status_breakdown,
        category_breakdown=category_breakdown,
    )
