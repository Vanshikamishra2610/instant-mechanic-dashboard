from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Mechanic, Booking
from app.schemas import MechanicOut, MechanicDetailOut, BookingListItem

router = APIRouter(prefix="/api/mechanics", tags=["mechanics"])


@router.get("", response_model=list[MechanicOut])
def list_mechanics(db: Session = Depends(get_db)):
    return db.query(Mechanic).order_by(Mechanic.jobs_completed.desc()).all()


@router.get("/{mechanic_id}", response_model=MechanicDetailOut)
def get_mechanic(mechanic_id: str, db: Session = Depends(get_db)):
    m = db.query(Mechanic).filter(Mechanic.id == mechanic_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Mechanic not found")

    recent = (
        db.query(Booking)
        .options(joinedload(Booking.customer), joinedload(Booking.vehicle), joinedload(Booking.mechanic))
        .filter(Booking.mechanic_id == mechanic_id)
        .order_by(Booking.scheduled_at.desc())
        .limit(10)
        .all()
    )

    detail = MechanicDetailOut.model_validate(m)
    detail.recent_bookings = [
        BookingListItem(
            id=b.id,
            customer_name=b.customer.name,
            vehicle_label=f"{b.vehicle.make} {b.vehicle.model} ({b.vehicle.plate_number})",
            service_category=b.service_category,
            mechanic_name=m.name,
            status=b.status,
            amount=b.amount,
            scheduled_at=b.scheduled_at,
            created_at=b.created_at,
        )
        for b in recent
    ]
    return detail
