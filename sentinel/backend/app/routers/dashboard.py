from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.database.connection import get_db
from app.models.db_models import Anomaly, AgentAction, AgentLog, DataSource, ExecutiveBriefing
from app.models.schemas import DashboardStats, AnomalyOut, AgentActionOut, AgentLogOut

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    """All the data the frontend dashboard needs in one call."""

    # Counts
    total_anomalies = (await db.execute(select(func.count(Anomaly.id)))).scalar() or 0
    critical_anomalies = (await db.execute(
        select(func.count(Anomaly.id)).where(Anomaly.severity == "critical")
    )).scalar() or 0
    actions_taken = (await db.execute(select(func.count(AgentAction.id)))).scalar() or 0
    data_sources = (await db.execute(select(func.count(DataSource.id)))).scalar() or 0

    # Recent items
    recent_anomalies_result = await db.execute(
        select(Anomaly).order_by(desc(Anomaly.created_at)).limit(10)
    )
    recent_actions_result = await db.execute(
        select(AgentAction).order_by(desc(AgentAction.created_at)).limit(10)
    )
    recent_logs_result = await db.execute(
        select(AgentLog).order_by(desc(AgentLog.created_at)).limit(20)
    )

    return DashboardStats(
        total_anomalies=total_anomalies,
        critical_anomalies=critical_anomalies,
        actions_taken=actions_taken,
        data_sources=data_sources,
        recent_anomalies=recent_anomalies_result.scalars().all(),
        recent_actions=recent_actions_result.scalars().all(),
        recent_logs=recent_logs_result.scalars().all()
    )


@router.get("/logs")
async def get_agent_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentLog).order_by(desc(AgentLog.created_at)).limit(50)
    )
    logs = result.scalars().all()
    return [
        {
            "id": log.id,
            "agent_name": log.agent_name,
            "step": log.step,
            "message": log.message,
            "related_id": log.related_id,
            "created_at": log.created_at.isoformat() if log.created_at else None
        }
        for log in logs
    ]


@router.get("/actions")
async def get_all_actions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentAction).order_by(desc(AgentAction.created_at)).limit(50)
    )
    actions = result.scalars().all()
    return [
        {
            "id": a.id,
            "anomaly_id": a.anomaly_id,
            "action_type": a.action_type,
            "title": a.title,
            "content": a.content,
            "recipient": a.recipient,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in actions
    ]
