"""
Shared logger that persists agent steps to the database in real time.
Used by all 4 agents to show their reasoning in the UI.
"""

from app.database.connection import AsyncSessionLocal
from app.models.db_models import AgentLog
import uuid


async def log_agent_step(agent_name: str, step: str, message: str, related_id: str = None):
    """Persist an agent reasoning step to the database."""
    async with AsyncSessionLocal() as session:
        log = AgentLog(
            id=str(uuid.uuid4()),
            agent_name=agent_name,
            step=step,
            message=message,
            related_id=related_id
        )
        session.add(log)
        await session.commit()
