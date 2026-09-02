import os
from dotenv import load_dotenv

load_dotenv()


def _normalize_db_url(url: str) -> str:
    """Force the pg8000 dialect onto whatever Postgres URL we're handed.

    We install pg8000 (pure Python, no libpq needed) rather than psycopg2,
    but SQLAlchemy maps a bare "postgresql://" to psycopg2 and rejects the
    legacy "postgres://" scheme outright. Managed providers (Render, Heroku,
    RDS) hand out both forms, so we rewrite them here instead of relying on
    every environment to spell the driver out.
    """
    for prefix in ("postgresql+pg8000://", "postgresql+psycopg://"):
        if url.startswith(prefix):
            return url
    for prefix in ("postgresql://", "postgres://"):
        if url.startswith(prefix):
            return "postgresql+pg8000://" + url[len(prefix):]
    return url


class Settings:
    """Central place for environment-driven configuration.

    Keeping this separate from database.py / main.py makes it obvious,
    at a glance, exactly which env vars the app depends on.
    """

    DATABASE_URL: str = _normalize_db_url(
        os.getenv(
            "DATABASE_URL",
            "postgresql://postgres:postgres@localhost:5432/instant_mechanic",
        )
    )

    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]

    # How often (seconds) the background simulator advances a random
    # booking's status, to make the "live" behaviour visible without
    # needing a second client to trigger changes manually.
    LIVE_SIMULATOR_INTERVAL: int = int(os.getenv("LIVE_SIMULATOR_INTERVAL", "6"))


settings = Settings()
