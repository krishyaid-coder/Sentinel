"""
Agent Pipeline Orchestrator
Chains Monitor → Analyst → Action → Briefing agents.
Called on every data upload and on the scheduler tick.
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.agents import monitor_agent, analyst_agent, action_agent, briefing_agent
from app.models.db_models import (
    DataSource, Anomaly, AgentAction, ExecutiveBriefing, SeverityLevel, StatusType
)
from app.services.logger import log_agent_step


async def run_full_pipeline(
    db: AsyncSession,
    raw_data: str,
    source_name: str,
    source_type: str,
    file_name: str = None,
    image_bytes: bytes = None,
    mime_type: str = None
) -> dict:
    """
    Full 4-agent pipeline:
    1. Monitor Agent  → extract metrics, detect anomalies
    2. Analyst Agent  → root cause + correlation analysis
    3. Action Agent   → generate autonomous actions
    4. Briefing Agent → executive narrative
    """

    source_id = str(uuid.uuid4())
    await log_agent_step("Pipeline", "started", f"Processing '{source_name}' ({source_type})", source_id)

    # ── Step 1: Monitor Agent ────────────────────────────────────────────────
    if image_bytes and mime_type:
        metrics_result = await monitor_agent.process_image_data(image_bytes, mime_type)
    else:
        metrics_result = await monitor_agent.extract_metrics(raw_data, source_type, source_id)

    detected_source_type = metrics_result.get("source_type", source_type)
    metrics = metrics_result.get("metrics", [])

    # Persist data source
    ds = DataSource(
        id=source_id,
        name=source_name,
        source_type=detected_source_type,
        file_name=file_name,
        raw_data=raw_data[:10000] if raw_data else None,
        metrics=metrics
    )
    db.add(ds)
    await db.commit()

    # Detect anomalies
    anomaly_result = await monitor_agent.detect_anomalies(metrics, source_id)
    raw_anomalies = anomaly_result.get("anomalies", [])

    if not raw_anomalies:
        await log_agent_step("Pipeline", "no_anomalies", "No anomalies detected — all metrics nominal", source_id)
        return {"source_id": source_id, "anomalies": [], "actions": [], "briefing": None}

    # ── Step 2: Analyst Agent ────────────────────────────────────────────────
    persisted_anomalies = []
    all_analyses = []

    for raw_anomaly in raw_anomalies:
        anomaly_id = str(uuid.uuid4())
        analysis = await analyst_agent.analyze_anomaly(raw_anomaly, metrics, anomaly_id)
        all_analyses.append(analysis)

        severity_map = {
            "low": SeverityLevel.low,
            "medium": SeverityLevel.medium,
            "high": SeverityLevel.high,
            "critical": SeverityLevel.critical
        }

        anomaly = Anomaly(
            id=anomaly_id,
            data_source_id=source_id,
            source_type=detected_source_type,
            title=raw_anomaly.get("title", "Untitled Anomaly"),
            description=raw_anomaly.get("description", ""),
            severity=severity_map.get(raw_anomaly.get("severity", "medium"), SeverityLevel.medium),
            metric_name=raw_anomaly.get("metric_name"),
            metric_value=raw_anomaly.get("metric_value"),
            metric_baseline=raw_anomaly.get("metric_baseline"),
            deviation_pct=raw_anomaly.get("deviation_pct"),
            raw_analysis=str(analysis),
            status=StatusType.open
        )
        db.add(anomaly)
        await db.commit()
        await db.refresh(anomaly)
        persisted_anomalies.append(anomaly)

    # Cross-anomaly correlation if multiple
    if len(raw_anomalies) > 1:
        await analyst_agent.correlate_anomalies(raw_anomalies)

    # ── Step 3: Action Agent ─────────────────────────────────────────────────
    all_actions_db = []

    for anomaly, analysis in zip(persisted_anomalies, all_analyses):
        actions = await action_agent.generate_actions(
            {
                "title": anomaly.title,
                "severity": anomaly.severity.value,
                "description": anomaly.description
            },
            analysis,
            anomaly.id
        )

        for act in actions:
            action_db = AgentAction(
                id=str(uuid.uuid4()),
                anomaly_id=anomaly.id,
                action_type=act.get("action_type", "alert"),
                title=act.get("title", "Action"),
                content=act.get("content", ""),
                recipient=act.get("recipient")
            )
            db.add(action_db)
            all_actions_db.append(action_db)

        anomaly.status = StatusType.actioned

    await db.commit()

    # ── Step 4: Briefing Agent ───────────────────────────────────────────────
    anomaly_dicts = [
        {
            "title": a.title,
            "severity": a.severity.value,
            "description": a.description,
            "metric_name": a.metric_name,
            "deviation_pct": a.deviation_pct
        }
        for a in persisted_anomalies
    ]
    action_dicts = [
        {
            "action_type": a.action_type,
            "title": a.title,
            "recipient": a.recipient
        }
        for a in all_actions_db
    ]

    briefing_data = await briefing_agent.generate_briefing(anomaly_dicts, action_dicts)

    briefing = ExecutiveBriefing(
        id=str(uuid.uuid4()),
        title=briefing_data.get("title", "Executive Briefing"),
        summary=briefing_data.get("summary", ""),
        key_insights=briefing_data.get("key_insights", []),
        anomaly_count=briefing_data.get("anomaly_count", len(persisted_anomalies)),
        critical_count=briefing_data.get("critical_count", 0),
        actions_taken=briefing_data.get("actions_taken", len(all_actions_db)),
        briefing_date=briefing_data.get("briefing_date")
    )
    db.add(briefing)
    await db.commit()

    await log_agent_step("Pipeline", "complete",
                         f"Pipeline done: {len(persisted_anomalies)} anomalies, {len(all_actions_db)} actions, briefing generated",
                         source_id)

    return {
        "source_id": source_id,
        "anomalies": [a.id for a in persisted_anomalies],
        "actions": [a.id for a in all_actions_db],
        "briefing": briefing.id
    }
