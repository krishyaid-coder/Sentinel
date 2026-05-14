from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


class DataSourceOut(BaseModel):
    id: str
    name: str
    source_type: str
    file_name: Optional[str]
    metrics: Optional[Any]
    created_at: datetime

    class Config:
        from_attributes = True


class AnomalyOut(BaseModel):
    id: str
    data_source_id: str
    source_type: str
    title: str
    description: str
    severity: str
    metric_name: Optional[str]
    metric_value: Optional[float]
    metric_baseline: Optional[float]
    deviation_pct: Optional[float]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class AgentActionOut(BaseModel):
    id: str
    anomaly_id: str
    action_type: str
    title: str
    content: str
    recipient: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ExecutiveBriefingOut(BaseModel):
    id: str
    title: str
    summary: str
    key_insights: Optional[Any]
    anomaly_count: int
    critical_count: int
    actions_taken: int
    briefing_date: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class AgentLogOut(BaseModel):
    id: str
    agent_name: str
    step: str
    message: str
    related_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_anomalies: int
    critical_anomalies: int
    actions_taken: int
    data_sources: int
    recent_anomalies: List[AnomalyOut]
    recent_actions: List[AgentActionOut]
    recent_logs: List[AgentLogOut]
