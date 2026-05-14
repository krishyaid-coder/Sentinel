from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import get_settings
from app.database.connection import init_db, AsyncSessionLocal
from app.services.gemini_service import init_gemini
from app.services import gemini_key
from app.routers import upload, anomalies, briefings, dashboard, settings as settings_router

settings = get_settings()
scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    async with AsyncSessionLocal() as session:
        await gemini_key.load_from_db(session)
    init_gemini()
    scheduler.start()
    print("Sentinel started: DB ready, Gemini initialised, scheduler running")
    yield
    # Shutdown
    scheduler.shutdown()
    print("Sentinel shutting down")


app = FastAPI(
    title="Sentinel · Enterprise situation room",
    description="Autonomous AI agent that monitors business data, detects anomalies, and acts.",
    version="1.0.0",
    lifespan=lifespan
)

_origins = [
    settings.frontend_url.rstrip("/"),
    "http://localhost:3000",
    "http://localhost:3001",
]
for part in settings.cors_extra_origins.split(","):
    p = part.strip().rstrip("/")
    if p and p not in _origins:
        _origins.append(p)

# Localhost + any *.vercel.app (production and preview) so Railway does not require exact FRONTEND_URL for Vercel.
_cors_origin_regex = (
    r"^https://[a-zA-Z0-9][a-zA-Z0-9.-]*\.vercel\.app$"
    r"|^https?://(localhost|127\.0\.0\.1)(:\d+)?$"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_origin_regex=_cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(anomalies.router)
app.include_router(briefings.router)
app.include_router(dashboard.router)
app.include_router(settings_router.router)


@app.get("/")
async def root():
    return {
        "name": "Sentinel",
        "tagline": "Autonomous Enterprise Situation Room",
        "status": "operational",
        "agents": ["Monitor Agent", "Analyst Agent", "Action Agent", "Briefing Agent"],
        "powered_by": "Google Gemini"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
