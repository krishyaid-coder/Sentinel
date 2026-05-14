from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.connection import get_db
from app.services import gemini_key
from app.services.gemini_service import init_gemini

router = APIRouter(prefix="/api/settings", tags=["settings"])


class GeminiKeyIn(BaseModel):
    api_key: str = Field(..., min_length=8, description="API key from Google AI Studio")


class GeminiStatusOut(BaseModel):
    configured: bool
    source: str  # database | environment | none


@router.get("/gemini", response_model=GeminiStatusOut)
async def gemini_status(db: AsyncSession = Depends(get_db)):
    """Whether the model API is configured. Never returns the key."""
    await gemini_key.load_from_db(db)
    key = gemini_key.get_effective_gemini_api_key()
    return GeminiStatusOut(configured=bool(key), source=gemini_key.key_source())


@router.post("/gemini")
async def save_gemini_key(body: GeminiKeyIn, db: AsyncSession = Depends(get_db)):
    """Save API key to the app database and reconfigure the client. Prefer this or env; DB wins when set."""
    await gemini_key.save_to_db(db, body.api_key)
    await db.commit()
    init_gemini()
    return {"ok": True, "message": "API key saved. The model client is ready to use."}


@router.delete("/gemini")
async def clear_gemini_key(db: AsyncSession = Depends(get_db)):
    """Remove the key from the database. Falls back to GEMINI_API_KEY in environment if set."""
    await gemini_key.clear_from_db(db)
    await db.commit()
    init_gemini()
    if not gemini_key.get_effective_gemini_api_key():
        raise HTTPException(
            status_code=400,
            detail="No API key in database and GEMINI_API_KEY is not set in the environment.",
        )
    return {"ok": True, "message": "Stored key removed. Using environment variable if present."}
