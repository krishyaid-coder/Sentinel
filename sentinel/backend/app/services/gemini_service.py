import google.generativeai as genai
from fastapi import HTTPException
from google.api_core import exceptions as google_api_exceptions

from app.config import get_settings
from app.services import gemini_key
import json
import re

settings = get_settings()


def init_gemini():
    key = gemini_key.get_effective_gemini_api_key()
    if key:
        genai.configure(api_key=key)


def get_flash_model():
    return genai.GenerativeModel(settings.gemini_flash_model)


def get_pro_model():
    """Analyst + Briefing agents (Pro tier for deeper reasoning)."""
    return genai.GenerativeModel(settings.gemini_pro_model)


def extract_json(text: str) -> dict:
    """Robustly extract JSON from a Gemini response."""
    # Try direct parse first
    try:
        return json.loads(text)
    except Exception:
        pass

    # Try extracting from markdown code block
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except Exception:
            pass

    # Try finding a JSON object anywhere in the text
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass

    return {}


def _generate_content(model, contents):
    try:
        return model.generate_content(contents)
    except google_api_exceptions.ResourceExhausted as e:
        raise HTTPException(
            status_code=429,
            detail=(
                "Gemini API quota or rate limit exceeded. "
                "Try again later, enable billing, or set GEMINI_FLASH_MODEL / GEMINI_PRO_MODEL "
                "to models your key can use. See https://ai.google.dev/gemini-api/docs/rate-limits"
            ),
        ) from e
    except google_api_exceptions.GoogleAPIError as e:
        msg = getattr(e, "message", None) or str(e)
        raise HTTPException(status_code=502, detail=f"Gemini API error: {msg}") from e


async def generate_with_flash(prompt: str, image_data: bytes = None, mime_type: str = None) -> str:
    """Call Gemini Flash (fast, low latency)."""
    model = get_flash_model()
    parts = []

    if image_data and mime_type:
        parts.append({"mime_type": mime_type, "data": image_data})

    parts.append(prompt)

    response = _generate_content(model, parts if len(parts) > 1 else prompt)
    return response.text


async def generate_with_pro(prompt: str) -> str:
    """Call Gemini Pro (deep reasoning, long context)."""
    model = get_pro_model()
    response = _generate_content(model, prompt)
    return response.text
