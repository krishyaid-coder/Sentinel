from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.connection import get_db
from app.services.pipeline import run_full_pipeline
import pandas as pd
import io
import json

router = APIRouter(prefix="/api/upload", tags=["upload"])

SUPPORTED_TYPES = {
    "text/csv": "csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/json": "json",
    "application/pdf": "pdf",
    "image/png": "image",
    "image/jpeg": "image",
    "image/webp": "image",
    "text/plain": "text"
}


def parse_file_to_text(content: bytes, content_type: str, filename: str) -> tuple[str, bytes, str]:
    """Convert uploaded file to text for the agent pipeline. Returns (text, image_bytes, mime_type)."""
    file_ext = SUPPORTED_TYPES.get(content_type, "text")

    if file_ext == "image":
        return "", content, content_type

    if file_ext == "csv":
        df = pd.read_csv(io.BytesIO(content))
        return df.to_string(index=False), None, None

    if file_ext == "xlsx":
        df = pd.read_excel(io.BytesIO(content))
        return df.to_string(index=False), None, None

    if file_ext == "json":
        data = json.loads(content)
        return json.dumps(data, indent=2), None, None

    if file_ext == "pdf":
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages)
            return text, None, None
        except Exception:
            return content.decode("utf-8", errors="ignore"), None, None

    # Plain text
    return content.decode("utf-8", errors="ignore"), None, None


@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    source_name: str = Form(...),
    source_type: str = Form("auto"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db)
):
    """Upload any file (CSV, Excel, PDF, image, JSON) and run the full agent pipeline."""
    if file.content_type not in SUPPORTED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Supported: CSV, Excel, PDF, PNG, JPEG, JSON, TXT"
        )

    content = await file.read()

    try:
        raw_text, image_bytes, mime_type = parse_file_to_text(content, file.content_type, file.filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to parse file: {str(e)}")

    result = await run_full_pipeline(
        db=db,
        raw_data=raw_text,
        source_name=source_name,
        source_type=source_type,
        file_name=file.filename,
        image_bytes=image_bytes,
        mime_type=mime_type
    )

    return {
        "message": "File processed successfully. Agent pipeline complete.",
        "result": result
    }


@router.post("/text")
async def upload_text(
    data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Upload raw text or pasted data and run the full agent pipeline."""
    raw_text = data.get("text", "")
    source_name = data.get("source_name", "Manual Input")
    source_type = data.get("source_type", "auto")

    if not raw_text.strip():
        raise HTTPException(status_code=400, detail="No text data provided")

    result = await run_full_pipeline(
        db=db,
        raw_data=raw_text,
        source_name=source_name,
        source_type=source_type
    )

    return {
        "message": "Data processed. Agent pipeline complete.",
        "result": result
    }
