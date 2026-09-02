import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Central place for environment-driven configuration.

    Keeping this separate from database.py / main.py makes it obvious,
    at a glance, exactly which env vars the app depends on.
    """

    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://postgres:postgres@localhost:5432/instant_mechanic",
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
