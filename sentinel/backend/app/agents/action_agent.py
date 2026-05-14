"""
Action Agent (Gemini Flash)
Responsibility: Autonomously draft emails, create tasks, and decide escalation paths.
"""

import json
from app.services.gemini_service import generate_with_flash, extract_json
from app.services.logger import log_agent_step


ACTION_PROMPT = """
You are an autonomous enterprise operations agent. An anomaly was analyzed; propose concrete next steps.

Anomaly:
- Title: {title}
- Severity: {severity}
- Description: {description}

Analysis:
- Root Cause: {root_cause}
- Business Impact: {business_impact}
- Urgency: {urgency}
- Recommended Owner: {recommended_owner}

Generate 2-3 realistic actions (drafts only — human review assumed).

Return a single JSON object (no markdown):
{{
  "actions": [
    {{
      "action_type": "email_draft|task|escalation|alert",
      "title": "short title",
      "recipient": "role or team",
      "content": "full email (subject line + body), task with acceptance criteria, escalation note, or short alert"
    }}
  ]
}}

Keep content professional and specific to the anomaly. Only return valid JSON.
"""


async def generate_actions(anomaly: dict, analysis: dict, anomaly_id: str = None) -> list:
    """Generate autonomous actions for a detected and analyzed anomaly."""

    await log_agent_step("Action Agent", "generating_actions",
                         f"Creating response plan for: {anomaly.get('title', 'anomaly')}", anomaly_id)

    prompt = ACTION_PROMPT.format(
        title=anomaly.get("title", ""),
        severity=anomaly.get("severity", ""),
        description=anomaly.get("description", ""),
        root_cause=analysis.get("root_cause", "Unknown"),
        business_impact=analysis.get("business_impact", "Unknown"),
        urgency=analysis.get("urgency", "monitor"),
        recommended_owner=analysis.get("recommended_owner", "Operations Team")
    )

    response = await generate_with_flash(prompt)
    result = extract_json(response)
    actions = result.get("actions", [])

    await log_agent_step("Action Agent", "actions_ready",
                         f"Generated {len(actions)} autonomous action(s)", anomaly_id)

    return actions
