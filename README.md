# Instant Mechanic — Live Operations Dashboard

A live vehicle service operations dashboard built for the Instant Mechanic Full Stack Developer Internship assignment. Operations staff can monitor bookings, mechanics, customers and revenue in real time, with booking status changes streaming to the UI over WebSocket — no page reload required.

**[Add your live links here before submitting]**
- Live dashboard (Vercel): `https://your-app.vercel.app`
- Live API (AWS): `https://your-api-domain.com`
- API docs (Swagger): `https://your-api-domain.com/docs`
- GitHub repo: `https://github.com/your-username/your-repo`

---

## 1. Project overview

Instant Mechanic dispatches mechanics to customers for services like oil changes, brake repair and diagnostics. This dashboard gives the ops team one place to see: what's booked today, what's in progress, who's free, and how revenue is trending — updating live as bookings move through `Pending → Assigned → On The Way → In Progress → Completed`.

## 2. Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS + Recharts |
| Backend | Python + FastAPI |
| Database | PostgreSQL (SQLAlchemy ORM) |
| Real-time | Native WebSocket (`/ws/live`) |
| Frontend hosting | Vercel |
| Backend hosting | AWS (EC2 + Docker, or ECS) |
| Source control | GitHub |

## 3. Architecture

```
┌─────────────────┐        HTTPS / REST        ┌──────────────────┐
│  Next.js (Vercel)│ ─────────────────────────► │  FastAPI (AWS)   │
│  - Overview      │ ◄───────────────────────── │  - /api/dashboard│
│  - Analytics     │        JSON responses       │  - /api/bookings │
│  - Bookings      │                              │  - /api/mechanics│
│  - Mechanics     │        WebSocket             │  - /api/customers│
│                   │ ◄═══════════════════════════│  - /ws/live      │
└─────────────────┘   booking_status_changed     └────────┬─────────┘
                                                            │ SQLAlchemy
                                                            ▼
                                                   ┌──────────────────┐
                                                   │   PostgreSQL     │
                                                   │  customers        │
                                                   │  vehicles         │
                                                   │  mechanics        │
                                                   │  bookings         │
                                                   └──────────────────┘
```

**Data model.** `Customer 1—N Vehicle`, `Mechanic 1—N Booking`, `Booking N—1 Customer`, `Booking N—1 Vehicle`. A booking's `service_category` and `status` are enums; amounts and timestamps drive all the analytics.

**Live updates.** Every booking status change (from the `PATCH /api/bookings/{id}/status` endpoint, or from the background simulator described below) is broadcast to every connected browser through a single WebSocket connection managed by `ConnectionManager` in `websocket_manager.py`. The frontend keeps one shared connection (`LiveProvider`) for the whole app and merges incoming events into whatever page is open — flashing the affected row in the bookings table, refreshing the detail page if it's the one open, and appending to the live activity feed on the overview page.

**Live simulator.** Because a real ops dashboard's "live" behaviour is driven by mechanics updating jobs from the field, and there's no such mobile app here, `main.py` runs a background task that advances a random in-flight booking's status every few seconds (configurable via `LIVE_SIMULATOR_INTERVAL`) and broadcasts it exactly like a real status change would. This is what makes the "no reload needed" requirement demonstrably true without a second client. In a real deployment, you'd remove the simulator and rely solely on real status changes from the ops/mechanic workflow — the broadcast code path is identical either way.

## 4. Local setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker (optional, for the easiest Postgres setup)

### Backend

```bash
cd backend
cp .env.example .env          # adjust if needed
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Easiest: start Postgres with Docker
docker compose -f ../docker-compose.yml up -d db

# Generate 550+ realistic bookings, 60 customers, 25 mechanics
python -m app.seed

# Run the API
uvicorn app.main:app --reload --port 8000
```

API is now live at `http://localhost:8000`, interactive docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
cp .env.local.example .env.local   # points at localhost:8000 by default
npm install
npm run dev
```

Dashboard is now live at `http://localhost:3000`.

### Everything with Docker Compose

```bash
docker compose up -d       # Postgres + backend
cd backend && python -m app.seed   # one-time seed
cd ../frontend && npm run dev      # frontend still run separately (Vercel dev pattern)
```

## 5. Environment variables

**Backend (`backend/.env`)**

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Postgres connection string | `postgresql://postgres:postgres@localhost:5432/instant_mechanic` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:3000,https://your-app.vercel.app` |
| `LIVE_SIMULATOR_INTERVAL` | Seconds between simulated status changes, `0` to disable | `6` |

**Frontend (`frontend/.env.local`)**

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST base URL | `https://your-api-domain.com` |
| `NEXT_PUBLIC_WS_URL` | Backend WebSocket URL | `wss://your-api-domain.com/ws/live` |

## 6. API documentation

Full interactive docs are auto-generated by FastAPI at `/docs` (Swagger UI) and `/redoc`. Summary of major endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard/summary` | Overview stat cards (totals, today, revenue, active mechanics, etc.) |
| GET | `/api/dashboard/analytics?days=30` | Time series (bookings/revenue), status breakdown, category breakdown |
| GET | `/api/bookings` | Paginated bookings list — supports `search`, `status`, `category`, `sort_by`, `sort_dir`, `page`, `page_size` |
| GET | `/api/bookings/{id}` | Full booking detail with customer, vehicle and mechanic |
| PATCH | `/api/bookings/{id}/status` | Update a booking's status; broadcasts the change over WebSocket |
| GET | `/api/mechanics` | Mechanic roster |
| GET | `/api/mechanics/{id}` | Mechanic detail with recent bookings |
| GET | `/api/customers` | Customer list, supports `search` |
| GET | `/api/customers/{id}` | Customer detail with their vehicles |
| WS | `/ws/live` | Subscribe to real-time `booking_status_changed` events |

## 7. Deployment

### Frontend → Vercel
1. Push this repo to GitHub.
2. Import the repo in Vercel, set the **root directory** to `frontend`.
3. Add environment variables `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` pointing at your deployed backend.
4. Deploy.

### Backend → AWS
1. Provision an EC2 instance (Free Tier eligible, e.g. `t2.micro`/`t3.micro`) with Docker installed, and a managed Postgres instance (RDS Free Tier) or Postgres running in a second container.
2. Copy the `backend/` folder to the instance (or `git clone` the repo there).
3. Set `DATABASE_URL` and `CORS_ORIGINS` as environment variables (or a `.env` file).
4. Build and run:
   ```bash
   docker build -t instant-mechanic-api .
   docker run -d -p 8000:8000 --env-file .env instant-mechanic-api
   ```
5. Open port 8000 (or put it behind an Nginx reverse proxy / ALB on 80/443 — recommended so the frontend can use `wss://` for the WebSocket without a mixed-content warning).
6. Run `python -m app.seed` once against the production database to populate sample data.

## 8. AI usage

*(Fill this in honestly before submitting — this is a template.)*

- **AI tools used:** Claude (Anthropic), used inside Claude's own coding environment to scaffold and iterate on this project.
- **What it was used for:** initial project scaffolding (FastAPI backend structure, SQLAlchemy models, Next.js App Router pages), the Faker-based seed script, the WebSocket connection manager and live-update wiring on the frontend, chart components with Recharts, and this README.
- **What I reviewed/modified:** [describe the parts you changed — e.g. adjusted the data model, changed specific business logic, tuned the UI, fixed bugs you found while testing, added/removed bonus features]. Be specific here; this section is what you'll be asked to defend in the next round.
- **What I can explain:** the full request lifecycle (frontend → REST/WebSocket → FastAPI → SQLAlchemy → Postgres), why the schema is normalized the way it is, how the live simulator works and how it differs from a production trigger, and the pagination/sorting/filtering implementation in `/api/bookings`.

## 9. What I'm most proud of

*(Fill in before submitting.)*

## 10. Project structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, WebSocket endpoint, live simulator
│   │   ├── config.py          # env-driven settings
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # Customer, Vehicle, Mechanic, Booking
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── seed.py            # generates realistic sample data
│   │   ├── websocket_manager.py
│   │   └── routers/
│   │       ├── dashboard.py   # summary + analytics
│   │       ├── bookings.py    # list/detail/status-update
│   │       ├── mechanics.py
│   │       └── customers.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Overview
│   │   ├── analytics/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── bookings/[id]/page.tsx
│   │   ├── mechanics/page.tsx
│   │   └── mechanics/[id]/page.tsx
│   ├── components/                  # Sidebar, Topbar, charts, tables, ui primitives
│   ├── lib/                         # api client, types, WebSocket hook, formatting utils
│   └── package.json
└── docker-compose.yml                # Postgres + backend for local dev
```

## 11. Known limitations / what I'd add next

- Authentication and role-based access were left out of this scope but the API layer is structured to add a dependency-based auth check per router without much rework.
- The live simulator is a stand-in for real mechanic-driven status changes; swapping it out for a real trigger source is a one-function change (`live_simulator()` in `main.py`).
- No automated test suite yet — `pytest` + `httpx.AsyncClient` would be the natural next step for the API, and Playwright for the frontend's live-update behaviour.
#   i n s t a n t - m e c h a n i c - d a s h b o a r d  
 