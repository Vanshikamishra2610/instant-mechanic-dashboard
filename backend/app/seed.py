"""
Generates realistic sample data: 60 customers (with 1-2 vehicles each),
25 mechanics, and 550 bookings spread across the last 60 days with varied
statuses, categories and amounts.

Run with:  python -m app.seed
"""
import random
from datetime import datetime, timedelta, timezone

from faker import Faker

from app.database import SessionLocal, engine, Base
from app.models import (
    Customer,
    Vehicle,
    Mechanic,
    Booking,
    MechanicStatus,
    BookingStatus,
    SERVICE_CATEGORIES,
)

fake = Faker()

CAR_MAKES_MODELS = [
    ("Toyota", ["Corolla", "Camry", "Innova", "Fortuner"]),
    ("Honda", ["City", "Civic", "Amaze", "WR-V"]),
    ("Hyundai", ["Creta", "i20", "Venue", "Verna"]),
    ("Maruti Suzuki", ["Swift", "Baleno", "Ertiga", "Brezza"]),
    ("Tata", ["Nexon", "Punch", "Harrier", "Altroz"]),
    ("Mahindra", ["XUV700", "Scorpio", "Thar", "Bolero"]),
    ("Kia", ["Seltos", "Sonet", "Carens"]),
    ("Ford", ["EcoSport", "Endeavour"]),
]

MECHANIC_SPECIALTIES = [
    "Engine Specialist",
    "Brake & Suspension",
    "Electrical Systems",
    "AC & Cooling",
    "Transmission Expert",
    "General Technician",
    "Tire & Alignment",
    "Diagnostics Specialist",
]

STATUS_WEIGHTS = {
    BookingStatus.completed: 0.45,
    BookingStatus.pending: 0.12,
    BookingStatus.assigned: 0.1,
    BookingStatus.on_the_way: 0.08,
    BookingStatus.in_progress: 0.1,
    BookingStatus.cancelled: 0.15,
}

CATEGORY_PRICE_RANGE = {
    "Oil Change": (800, 2500),
    "Brake Repair": (1500, 6000),
    "Engine Diagnostics": (1000, 4000),
    "Tire Service": (600, 5000),
    "Battery Replacement": (2500, 7000),
    "AC Repair": (1200, 5500),
    "Transmission Service": (3000, 12000),
    "General Maintenance": (1000, 3500),
    "Wheel Alignment": (500, 1800),
    "Car Wash & Detailing": (300, 2000),
}


def weighted_status() -> BookingStatus:
    statuses, weights = zip(*STATUS_WEIGHTS.items())
    return random.choices(statuses, weights=weights, k=1)[0]


def seed(num_customers=60, num_mechanics=25, num_bookings=550):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Clearing existing data...")
        db.query(Booking).delete()
        db.query(Vehicle).delete()
        db.query(Mechanic).delete()
        db.query(Customer).delete()
        db.commit()

        print(f"Creating {num_customers} customers with vehicles...")
        customers = []
        for _ in range(num_customers):
            c = Customer(
                name=fake.name(),
                email=fake.unique.email(),
                phone=fake.phone_number()[:20],
                created_at=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 400)),
            )
            db.add(c)
            customers.append(c)
        db.flush()

        vehicles = []
        for c in customers:
            for _ in range(random.choice([1, 1, 2])):
                make, models = random.choice(CAR_MAKES_MODELS)
                v = Vehicle(
                    customer_id=c.id,
                    make=make,
                    model=random.choice(models),
                    year=random.randint(2014, 2025),
                    plate_number=f"{fake.state_abbr()}-{random.randint(10,99)}-{fake.random_uppercase_letter()}{fake.random_uppercase_letter()}-{random.randint(1000,9999)}",
                )
                db.add(v)
                vehicles.append(v)
        db.flush()

        print(f"Creating {num_mechanics} mechanics...")
        mechanics = []
        for _ in range(num_mechanics):
            m = Mechanic(
                name=fake.name(),
                email=fake.unique.email(),
                phone=fake.phone_number()[:20],
                specialty=random.choice(MECHANIC_SPECIALTIES),
                status=random.choices(
                    [MechanicStatus.available, MechanicStatus.on_job, MechanicStatus.offline],
                    weights=[0.5, 0.35, 0.15],
                )[0],
                rating=round(random.uniform(3.6, 5.0), 1),
                jobs_completed=random.randint(5, 400),
            )
            db.add(m)
            mechanics.append(m)
        db.flush()

        print(f"Creating {num_bookings} bookings...")
        now = datetime.now(timezone.utc)
        for _ in range(num_bookings):
            customer = random.choice(customers)
            customer_vehicles = [v for v in vehicles if v.customer_id == customer.id]
            vehicle = random.choice(customer_vehicles)
            category = random.choice(SERVICE_CATEGORIES)
            low, high = CATEGORY_PRICE_RANGE[category]
            status = weighted_status()

            days_ago = random.randint(0, 60)
            scheduled_at = now - timedelta(
                days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59)
            )

            mechanic = None
            if status != BookingStatus.pending:
                mechanic = random.choice(mechanics)

            b = Booking(
                customer_id=customer.id,
                vehicle_id=vehicle.id,
                mechanic_id=mechanic.id if mechanic else None,
                service_category=category,
                description=f"{category} requested for {vehicle.make} {vehicle.model}",
                status=status,
                amount=round(random.uniform(low, high), 2),
                scheduled_at=scheduled_at,
                created_at=scheduled_at - timedelta(hours=random.randint(1, 48)),
            )
            db.add(b)

        db.commit()
        print("Seed complete: "
              f"{len(customers)} customers, {len(vehicles)} vehicles, "
              f"{len(mechanics)} mechanics, {num_bookings} bookings.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
