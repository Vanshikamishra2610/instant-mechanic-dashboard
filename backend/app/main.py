import asyncio
import random
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import joinedload

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models import Booking, BookingStatus
from app.websocket_manager import manager
from app.routers import dashboard, bookings, mechanics, customers

# Forward transitions the simulator is allowed to apply, mirroring the
# real-world flow: Pending -> Assigned -> On The Way -> Completed.
SIM_NEXT_STATUS = {
    BookingStatus.pending: BookingStatus.assigned,
    BookingStatus.assigned: BookingStatus.on_the_way,
    BookingStatus.on_the_way: BookingStatus.in_progress,
    BookingStatus.in_progress: BookingStatus.completed,
}


async def live_simulator():
    """Background task that periodically advances a random booking's status
    and broadcasts the change over WebSocket. This is what makes the
    dashboard feel "live" in a demo/interview setting without needing a
    second client to manually trigger updates. In production this loop
    would be replaced by real status changes coming from mechanics'
    mobile app / ops actions, still broadcast through the same
    manager.broadcast() call used in the PATCH endpoint.
    """
    if settings.LIVE_SIMULATOR_INTERVAL <= 0:
        return

    while True:
        await asyncio.sleep(settings.LIVE_SIMULATOR_INTERVAL)
        db = SessionLocal()
        try:
            candidates = (
                db.query(Booking)
                .options(joinedload(Booking.mechanic))
                .filter(Booking.status.in_(list(SIM_NEXT_STATUS.keys())))
                .order_by(Booking.updated_at.asc())
                .limit(25)
                .all()
            )
            if not candidates:
                continue

            b = random.choice(candidates)
            b.status = SIM_NEXT_STATUS[b.status]
            b.updated_at = datetime.now(timezone.utc)
            db.commit()

            await manager.broadcast({
                "type": "booking_status_changed",
                "booking_id": b.id,
                "status": b.status.value,
                "mechanic_name": b.mechanic.name if b.mechanic else None,
                "timestamp": datetime.now(timezone.utc),
            })
        except Exception as e:
            print(f"[live_simulator] error: {e}")
        finally:
            db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables if they don't exist yet (seed.py also does this).
    Base.metadata.create_all(bind=engine)
    task = asyncio.create_task(live_simulator())
    yield
    task.cancel()


app = FastAPI(
    title="Instant Mechanic — Live Operations Dashboard API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router)
app.include_router(bookings.router)
app.include_router(mechanics.router)
app.include_router(customers.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "instant-mechanic-dashboard-api"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect messages from the client, but this keeps
            # the connection alive and lets us detect disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
