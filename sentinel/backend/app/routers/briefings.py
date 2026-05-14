from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database.connection import get_db
from app.models.db_models import ExecutiveBriefing, Anomaly, AgentAction
from app.models.schemas import ExecutiveBriefingOut
from app.agents.briefing_agent import generate_briefing
from typing import List, Optional

router = APIRouter(prefix="/api/briefings", tags=["briefings"])


@router.get("", response_model=List[ExecutiveBriefingOut])
async def get_briefings(
    limit: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ExecutiveBriefing).order_by(desc(ExecutiveBriefing.created_at)).limit(limit)
    )
    return result.scalars().all()


@router.get("/latest", response_model=Optional[ExecutiveBriefingOut])
async def get_latest_briefing(db: AsyncSession = Depends(get_db)):
    """Latest briefing, or JSON `null` if none exist yet (avoids 404 for empty state)."""
    result = await db.execute(
        select(ExecutiveBriefing).order_by(desc(ExecutiveBriefing.created_at)).limit(1)
    )
    return result.scalar_one_or_none()


@router.post("/generate")
async def generate_now(db: AsyncSession = Depends(get_db)):
    """Manually trigger a new executive briefing from today's anomalies and actions."""
    anomalies_result = await db.execute(
        select(Anomaly).order_by(desc(Anomaly.created_at)).limit(20)
    )
    anomalies = anomalies_result.scalars().all()

    actions_result = await db.execute(
        select(AgentAction).order_by(desc(AgentAction.created_at)).limit(30)
    )
    actions = actions_result.scalars().all()

    anomaly_dicts = [
        {"title": a.title, "severity": a.severity.value,
         "description": a.description, "metric_name": a.metric_name,
         "deviation_pct": a.deviation_pct}
        for a in anomalies
    ]
    action_dicts = [
        {"action_type": a.action_type, "title": a.title, "recipient": a.recipient}
        for a in actions
    ]

    briefing_data = await generate_briefing(anomaly_dicts, action_dicts)

    from app.models.db_models import ExecutiveBriefing
    import uuid
    briefing = ExecutiveBriefing(
        id=str(uuid.uuid4()),
        title=briefing_data.get("title", "Executive Briefing"),
        summary=briefing_data.get("summary", ""),
        key_insights=briefing_data.get("key_insights", []),
        anomaly_count=briefing_data.get("anomaly_count", len(anomalies)),
        critical_count=briefing_data.get("critical_count", 0),
        actions_taken=briefing_data.get("actions_taken", len(actions)),
        briefing_date=briefing_data.get("briefing_date")
    )
    db.add(briefing)
    await db.commit()
    await db.refresh(briefing)

    return {"message": "Briefing generated", "briefing_id": briefing.id}
