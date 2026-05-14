"""Gemini API key: value saved in SQLite (Settings UI) overrides env GEMINI_API_KEY."""

from __future__ import annotations

from typing import Literal

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.db_models import AppSetting

GEMINI_STORE_KEY = "gemini_api_key"

_db_override: str | None = None


def set_db_cached_key(key: str | None) -> None:
    global _db_override
    if key and key.strip():
        _db_override = key.strip()
    else:
        _db_override = None


def get_effective_gemini_api_key() -> str:
    if _db_override:
        return _db_override
    return (get_settings().gemini_api_key or "").strip()


def key_source() -> Literal["database", "environment", "none"]:
    if _db_override:
        return "database"
    if (get_settings().gemini_api_key or "").strip():
        return "environment"
    return "none"


async def load_from_db(session: AsyncSession) -> None:
    r = await session.execute(select(AppSetting).where(AppSetting.key == GEMINI_STORE_KEY))
    row = r.scalar_one_or_none()
    set_db_cached_key(row.value if row and row.value else None)


async def save_to_db(session: AsyncSession, api_key: str) -> None:
    key_trim = api_key.strip()
    r = await session.execute(select(AppSetting).where(AppSetting.key == GEMINI_STORE_KEY))
    row = r.scalar_one_or_none()
    if row:
        row.value = key_trim
    else:
        session.add(AppSetting(key=GEMINI_STORE_KEY, value=key_trim))
    set_db_cached_key(key_trim)
    await session.flush()


async def clear_from_db(session: AsyncSession) -> None:
    await session.execute(delete(AppSetting).where(AppSetting.key == GEMINI_STORE_KEY))
    set_db_cached_key(None)
    await session.flush()
