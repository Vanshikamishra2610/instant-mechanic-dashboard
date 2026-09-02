from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Customer
from app.schemas import CustomerOut, VehicleOut

router = APIRouter(prefix="/api/customers", tags=["customers"])


@router.get("", response_model=list[CustomerOut])
def list_customers(
    search: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    q = db.query(Customer)
    if search:
        q = q.filter(Customer.name.ilike(f"%{search}%"))
    return q.order_by(Customer.created_at.desc()).limit(limit).all()


@router.get("/{customer_id}")
def get_customer(customer_id: str, db: Session = Depends(get_db)):
    c = (
        db.query(Customer)
        .options(joinedload(Customer.vehicles))
        .filter(Customer.id == customer_id)
        .first()
    )
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
    return {
        **CustomerOut.model_validate(c).model_dump(),
        "vehicles": [VehicleOut.model_validate(v).model_dump() for v in c.vehicles],
    }
