from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.database.connection import get_db
from app.models.db_models import Anomaly, AgentAction, AgentLog
from app.models.schemas import AnomalyOut, AgentActionOut, AgentLogOut, DashboardStats
from typing import List, Optional

router = APIRouter(prefix="/api/anomalies", tags=["anomalies"])


@router.get("", response_model=List[AnomalyOut])
async def get_anomalies(
    severity: Optional[str] = Query(None),
    source_type: Optional[str] = Query(None),
    limit: int = Query(50, le=200),
    db: AsyncSession = Depends(get_db)
):
    """Get all detected anomalies, optionally filtered."""
    query = select(Anomaly).order_by(desc(Anomaly.created_at)).limit(limit)

    if severity:
        query = query.where(Anomaly.severity == severity)
    if source_type:
        query = query.where(Anomaly.source_type == source_type)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{anomaly_id}", response_model=AnomalyOut)
async def get_anomaly(anomaly_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Anomaly).where(Anomaly.id == anomaly_id))
    anomaly = result.scalar_one_or_none()
    if not anomaly:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Anomaly not found")
    return anomaly


@router.get("/{anomaly_id}/actions", response_model=List[AgentActionOut])
async def get_anomaly_actions(anomaly_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(AgentAction)
        .where(AgentAction.anomaly_id == anomaly_id)
        .order_by(AgentAction.created_at)
    )
    return result.scalars().all()
