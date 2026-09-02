import enum
import uuid

from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    DateTime,
    ForeignKey,
    Enum as SAEnum,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base


def gen_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:10]}"


class MechanicStatus(str, enum.Enum):
    available = "available"
    on_job = "on_job"
    offline = "offline"


class BookingStatus(str, enum.Enum):
    pending = "pending"
    assigned = "assigned"
    on_the_way = "on_the_way"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"


SERVICE_CATEGORIES = [
    "Oil Change",
    "Brake Repair",
    "Engine Diagnostics",
    "Tire Service",
    "Battery Replacement",
    "AC Repair",
    "Transmission Service",
    "General Maintenance",
    "Wheel Alignment",
    "Car Wash & Detailing",
]


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String, primary_key=True, default=lambda: gen_id("cust"))
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    phone = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    vehicles = relationship("Vehicle", back_populates="customer", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="customer")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True, default=lambda: gen_id("veh"))
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    make = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    plate_number = Column(String, nullable=False)

    customer = relationship("Customer", back_populates="vehicles")
    bookings = relationship("Booking", back_populates="vehicle")


class Mechanic(Base):
    __tablename__ = "mechanics"

    id = Column(String, primary_key=True, default=lambda: gen_id("mech"))
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    phone = Column(String, nullable=False)
    specialty = Column(String, nullable=False)
    status = Column(SAEnum(MechanicStatus), nullable=False, default=MechanicStatus.available)
    rating = Column(Float, nullable=False, default=4.5)
    jobs_completed = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    bookings = relationship("Booking", back_populates="mechanic")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=lambda: gen_id("bkg"))
    customer_id = Column(String, ForeignKey("customers.id"), nullable=False)
    vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    mechanic_id = Column(String, ForeignKey("mechanics.id"), nullable=True)

    service_category = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(SAEnum(BookingStatus), nullable=False, default=BookingStatus.pending, index=True)
    amount = Column(Float, nullable=False)

    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    customer = relationship("Customer", back_populates="bookings")
    vehicle = relationship("Vehicle", back_populates="bookings")
    mechanic = relationship("Mechanic", back_populates="bookings")
