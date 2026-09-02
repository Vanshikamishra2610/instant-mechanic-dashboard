import math
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_, asc, desc
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Booking, Customer, Vehicle, Mechanic, BookingStatus
from app.schemas import BookingListItem, BookingDetailOut, BookingStatusUpdate, Paginated
from app.websocket_manager import manager

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

SORTABLE_FIELDS = {
    "scheduled_at": Booking.scheduled_at,
    "amount": Booking.amount,
    "status": Booking.status,
    "created_at": Booking.created_at,
}

# Valid forward transitions for the demo status-update endpoint.
NEXT_STATUS = {
    BookingStatus.pending: BookingStatus.assigned,
    BookingStatus.assigned: BookingStatus.on_the_way,
    BookingStatus.on_the_way: BookingStatus.in_progress,
    BookingStatus.in_progress: BookingStatus.completed,
}


def _to_list_item(b: Booking) -> BookingListItem:
    return BookingListItem(
        id=b.id,
        customer_name=b.customer.name,
        vehicle_label=f"{b.vehicle.make} {b.vehicle.model} ({b.vehicle.plate_number})",
        service_category=b.service_category,
        mechanic_name=b.mechanic.name if b.mechanic else None,
        status=b.status,
        amount=b.amount,
        scheduled_at=b.scheduled_at,
        created_at=b.created_at,
    )


@router.get("", response_model=Paginated[BookingListItem])
def list_bookings(
    search: Optional[str] = Query(None, description="Search by customer, vehicle plate or booking id"),
    status: Optional[BookingStatus] = None,
    category: Optional[str] = None,
    sort_by: str = Query("scheduled_at", pattern="^(scheduled_at|amount|status|created_at)$"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    q = (
        db.query(Booking)
        .options(
            joinedload(Booking.customer),
            joinedload(Booking.vehicle),
            joinedload(Booking.mechanic),
        )
    )

    if search:
        like = f"%{search}%"
        q = q.join(Customer).join(Vehicle).filter(
            or_(
                Customer.name.ilike(like),
                Vehicle.plate_number.ilike(like),
                Booking.id.ilike(like),
            )
        )

    if status:
        q = q.filter(Booking.status == status)

    if category:
        q = q.filter(Booking.service_category == category)

    total = q.count()

    sort_col = SORTABLE_FIELDS[sort_by]
    q = q.order_by(asc(sort_col) if sort_dir == "asc" else desc(sort_col))

    items = q.offset((page - 1) * page_size).limit(page_size).all()

    return Paginated(
        items=[_to_list_item(b) for b in items],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, math.ceil(total / page_size)),
    )


@router.get("/{booking_id}", response_model=BookingDetailOut)
def get_booking(booking_id: str, db: Session = Depends(get_db)):
    b = (
        db.query(Booking)
        .options(
            joinedload(Booking.customer),
            joinedload(Booking.vehicle),
            joinedload(Booking.mechanic),
        )
        .filter(Booking.id == booking_id)
        .first()
    )
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")
    return b


@router.patch("/{booking_id}/status")
async def update_booking_status(booking_id: str, payload: BookingStatusUpdate, db: Session = Depends(get_db)):
    b = db.query(Booking).options(joinedload(Booking.mechanic)).filter(Booking.id == booking_id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Booking not found")

    b.status = payload.status
    b.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(b)

    await manager.broadcast({
        "type": "booking_status_changed",
        "booking_id": b.id,
        "status": b.status.value,
        "mechanic_name": b.mechanic.name if b.mechanic else None,
        "timestamp": datetime.now(timezone.utc),
    })

    return {"ok": True, "booking_id": b.id, "status": b.status.value}
