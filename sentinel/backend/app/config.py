from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    gemini_api_key: str = ""
    database_url: str = "sqlite+aiosqlite:///./sentinel.db"
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"
    # Optional comma-separated extra CORS origins (e.g. https://www.example.com,https://preview.vercel.app)
    cors_extra_origins: str = ""

    # Monitor + Action agents use Flash; Analyst + Briefing use Pro (see agents/*).
    gemini_flash_model: str = "gemini-2.5-flash"
    # Defaults to Flash so Analyst + Briefing run without Pro quota; set to gemini-2.5-pro when available.
    gemini_pro_model: str = "gemini-2.5-flash"

    # Scheduler config (seconds)
    monitor_interval_seconds: int = 60

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
