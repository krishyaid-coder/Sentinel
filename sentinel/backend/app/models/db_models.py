from sqlalchemy import Column, String, Float, DateTime, Text, JSON, Integer, Enum
from sqlalchemy.sql import func
import enum
import uuid
from app.database.connection import Base


def gen_uuid():
    return str(uuid.uuid4())


class SeverityLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class StatusType(str, enum.Enum):
    open = "open"
    actioned = "actioned"
    resolved = "resolved"


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    source_type = Column(String, nullable=False)  # support, sales, finance, health
    file_name = Column(String)
    raw_data = Column(Text)
    metrics = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(String, primary_key=True, default=gen_uuid)
    data_source_id = Column(String, nullable=False)
    source_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(Enum(SeverityLevel), nullable=False)
    metric_name = Column(String)
    metric_value = Column(Float)
    metric_baseline = Column(Float)
    deviation_pct = Column(Float)
    status = Column(Enum(StatusType), default=StatusType.open)
    raw_analysis = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(String, primary_key=True, default=gen_uuid)
    anomaly_id = Column(String, nullable=False)
    action_type = Column(String, nullable=False)  # email_draft, task, escalation, alert
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    recipient = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ExecutiveBriefing(Base):
    __tablename__ = "executive_briefings"

    id = Column(String, primary_key=True, default=gen_uuid)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=False)
    key_insights = Column(JSON)
    anomaly_count = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    actions_taken = Column(Integer, default=0)
    briefing_date = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AgentLog(Base):
    __tablename__ = "agent_logs"

    id = Column(String, primary_key=True, default=gen_uuid)
    agent_name = Column(String, nullable=False)
    step = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    related_id = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AppSetting(Base):
    """Key-value store for runtime config (e.g. Gemini API key from the Settings UI)."""

    __tablename__ = "app_settings"

    key = Column(String, primary_key=True)
    value = Column(Text, nullable=False)
