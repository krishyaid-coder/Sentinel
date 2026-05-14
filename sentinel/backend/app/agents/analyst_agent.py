"""
Analyst Agent (Gemini Pro)
Responsibility: Deep reasoning — root cause analysis, cross-metric correlation, business impact.
"""

import json
from app.services.gemini_service import generate_with_pro, extract_json
from app.services.logger import log_agent_step


ANALYSIS_PROMPT = """
You are a senior business intelligence analyst. Ground every claim in the anomaly and metrics provided; if evidence is thin, say so and lower confidence.

Anomaly:
- Title: {title}
- Metric: {metric_name}
- Current Value: {metric_value}
- Expected Baseline: {metric_baseline}
- Deviation: {deviation_pct}%
- Severity: {severity}
- Description: {description}

All available metrics from the same data source for context:
{all_metrics}

Return a single JSON object (no markdown):
{{
  "root_cause": "most likely root cause in plain language",
  "correlated_metrics": ["metrics that may move together with this signal"],
  "business_impact": "what happens if unaddressed",
  "urgency": "immediate|24h|this_week|monitor",
  "confidence": "high|medium|low",
  "recommended_owner": "VP Sales|VP Support|CFO|CTO|COO|CEO|Ops",
  "analysis_summary": "2-3 sentences for executives; no speculation beyond the data"
}}

Only return valid JSON.
"""


async def analyze_anomaly(anomaly: dict, all_metrics: list = None, anomaly_id: str = None) -> dict:
    """Deep analysis of a detected anomaly using Gemini Pro."""

    await log_agent_step("Analyst Agent", "starting_analysis",
                         f"Analyzing: {anomaly.get('title', 'Unknown anomaly')}", anomaly_id)

    prompt = ANALYSIS_PROMPT.format(
        title=anomaly.get("title", ""),
        metric_name=anomaly.get("metric_name", ""),
        metric_value=anomaly.get("metric_value", ""),
        metric_baseline=anomaly.get("metric_baseline", ""),
        deviation_pct=anomaly.get("deviation_pct", ""),
        severity=anomaly.get("severity", ""),
        description=anomaly.get("description", ""),
        all_metrics=json.dumps(all_metrics or [], indent=2)[:3000]
    )

    response = await generate_with_pro(prompt)
    result = extract_json(response)

    await log_agent_step("Analyst Agent", "analysis_complete",
                         f"Root cause identified: {result.get('root_cause', 'N/A')[:100]}", anomaly_id)

    return result


CORRELATION_PROMPT = """
You are analyzing multiple business anomalies that may be related.

Anomalies detected:
{anomalies}

Identify if any of these anomalies share a common root cause or are causally linked.

Return JSON:
{{
  "clusters": [
    {{
      "anomaly_ids": ["list of related anomaly titles"],
      "common_cause": "what links these anomalies",
      "combined_impact": "what happens if all of these continue"
    }}
  ],
  "overall_health": "critical|concerning|stable|good",
  "executive_headline": "one alarming or reassuring sentence for the CEO"
}}

Only return valid JSON.
"""


async def correlate_anomalies(anomalies: list) -> dict:
    """Find correlations across multiple anomalies — big picture reasoning."""

    await log_agent_step("Analyst Agent", "correlating",
                         f"Cross-analyzing {len(anomalies)} anomalies for patterns", None)

    prompt = CORRELATION_PROMPT.format(
        anomalies=json.dumps([{
            "title": a.get("title"),
            "metric_name": a.get("metric_name"),
            "severity": a.get("severity"),
            "description": a.get("description")
        } for a in anomalies], indent=2)
    )

    response = await generate_with_pro(prompt)
    result = extract_json(response)

    await log_agent_step("Analyst Agent", "correlation_complete",
                         f"Overall health: {result.get('overall_health', 'unknown')}", None)

    return result
