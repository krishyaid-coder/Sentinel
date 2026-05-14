"""
Briefing Agent (Gemini Pro)
Responsibility: Generate boardroom-ready executive narratives — not charts, but clear prose.
"""

import json
from datetime import date
from app.services.gemini_service import generate_with_pro, extract_json
from app.services.logger import log_agent_step


BRIEFING_PROMPT = """
You are the Chief of Staff writing an executive situation briefing for the CEO and leadership team.
Use only the facts implied by the anomaly and action lists below; do not invent companies, dollar amounts, or dates not supported by the input.

Today's Date: {today}

Anomalies ({anomaly_count}):
{anomalies}

Actions taken by the agent ({action_count}):
{actions}

Return a single JSON object (no markdown):
{{
  "title": "Executive Situation Briefing — {today}",
  "summary": "300-400 words, short paragraphs: situation, what changed, what the agent did, what leadership should watch",
  "key_insights": [
    "specific insight tied to the data (one sentence)",
    "second insight",
    "third insight"
  ],
  "decisions_needed": [
    "concrete watch item or decision",
    "second item if warranted"
  ],
  "overall_status": "All Clear|Monitor|Action Required|Critical"
}}

Tone: direct, calm, confident. Only return valid JSON.
"""


async def generate_briefing(anomalies: list, actions: list) -> dict:
    """Generate the daily executive briefing from all anomalies and actions."""

    await log_agent_step("Briefing Agent", "generating_briefing",
                         f"Synthesizing {len(anomalies)} anomalies and {len(actions)} actions into executive brief", None)

    today = date.today().strftime("%B %d, %Y")

    # Summarise anomalies for the prompt
    anomaly_summary = json.dumps([{
        "title": a.get("title"),
        "severity": a.get("severity"),
        "description": a.get("description"),
        "metric_name": a.get("metric_name"),
        "deviation_pct": a.get("deviation_pct")
    } for a in anomalies], indent=2)[:4000]

    action_summary = json.dumps([{
        "action_type": a.get("action_type"),
        "title": a.get("title"),
        "recipient": a.get("recipient")
    } for a in actions], indent=2)[:2000]

    prompt = BRIEFING_PROMPT.format(
        today=today,
        anomaly_count=len(anomalies),
        anomalies=anomaly_summary,
        action_count=len(actions),
        actions=action_summary
    )

    response = await generate_with_pro(prompt)
    result = extract_json(response)

    result["anomaly_count"] = len(anomalies)
    result["critical_count"] = sum(1 for a in anomalies if a.get("severity") == "critical")
    result["actions_taken"] = len(actions)
    result["briefing_date"] = today

    await log_agent_step("Briefing Agent", "briefing_ready",
                         f"Executive briefing generated — Status: {result.get('overall_status', 'Unknown')}", None)

    return result
