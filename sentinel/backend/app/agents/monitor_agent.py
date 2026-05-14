"""
Monitor Agent (Gemini Flash)
Responsibility: Extract metrics from any data format and detect anomalies fast.
"""

import json
from app.services.gemini_service import generate_with_flash, extract_json
from app.services.logger import log_agent_step


EXTRACT_METRICS_PROMPT = """
You are a precise business data analyst. Analyze the following data and extract key business metrics.

Rules:
- Infer realistic numeric values from the text or tables. If a baseline is unknown, estimate from context or set baseline equal to value and trend "stable".
- Prefer 4–12 distinct metrics when the data supports it; fewer is fine for sparse input.
- source_type must be one of: support | sales | finance | health | auto (use "auto" if none fit).

Data:
{data}

Return a single JSON object with this exact structure (no markdown, no commentary):
{{
  "source_type": "support|sales|finance|health|auto",
  "metrics": [
    {{
      "name": "metric name",
      "value": 0,
      "unit": "unit of measurement",
      "baseline": 0,
      "trend": "up|down|stable",
      "description": "what this metric means in one line"
    }}
  ],
  "summary": "one sentence summary of the data"
}}

Focus on: ticket volumes, CSAT, deal velocity, win rates, MRR/churn, adoption, latency, error rates, staffing.
Only return valid JSON.
"""

DETECT_ANOMALIES_PROMPT = """
You are an anomaly detection system for enterprise business data.

Metrics (JSON):
{metrics}

Flag anomalies where a metric deviates meaningfully from its baseline or from stated expectations.
Use severity: low (under 15% deviation or minor), medium (15-30%), high (30-50%), critical (over 50% or business-critical).

Return a single JSON object (no markdown):
{{
  "anomalies": [
    {{
      "metric_name": "name of metric",
      "metric_value": 0,
      "metric_baseline": 0,
      "deviation_pct": 0,
      "severity": "low|medium|high|critical",
      "title": "short title",
      "description": "what is wrong and why it matters to the business"
    }}
  ]
}}

If none qualify, return {{"anomalies": []}}. Only return valid JSON.
"""


async def extract_metrics(raw_data: str, source_type: str = None, anomaly_id: str = None) -> dict:
    """Extract structured metrics from raw data using Gemini Flash."""
    await log_agent_step("Monitor Agent", "extracting_metrics", f"Parsing {len(raw_data)} chars of input data", anomaly_id)

    prompt = EXTRACT_METRICS_PROMPT.format(data=raw_data[:8000])  # Flash context limit
    response = await generate_with_flash(prompt)
    result = extract_json(response)

    if source_type and "source_type" not in result:
        result["source_type"] = source_type

    await log_agent_step("Monitor Agent", "metrics_extracted",
                         f"Extracted {len(result.get('metrics', []))} metrics", anomaly_id)
    return result


async def detect_anomalies(metrics: list, source_id: str) -> dict:
    """Run anomaly detection on extracted metrics using Gemini Flash."""
    await log_agent_step("Monitor Agent", "detecting_anomalies",
                         f"Scanning {len(metrics)} metrics for anomalies", source_id)

    prompt = DETECT_ANOMALIES_PROMPT.format(metrics=json.dumps(metrics, indent=2))
    response = await generate_with_flash(prompt)
    result = extract_json(response)

    anomaly_count = len(result.get("anomalies", []))
    await log_agent_step("Monitor Agent", "detection_complete",
                         f"Found {anomaly_count} anomalie(s)", source_id)
    return result


async def process_image_data(image_bytes: bytes, mime_type: str) -> dict:
    """Process a dashboard screenshot or image using Gemini Flash multimodal."""
    prompt = """
    You are analyzing a business dashboard screenshot or report image.
    Extract all visible metrics, KPIs, charts, and data points.

    Return JSON:
    {
      "source_type": "support|sales|finance|health|auto",
      "metrics": [{"name": "...", "value": number, "unit": "...", "baseline": number, "trend": "up|down|stable", "description": "..."}],
      "summary": "one sentence summary"
    }

    Only return valid JSON.
    """
    response = await generate_with_flash(prompt, image_bytes, mime_type)
    return extract_json(response)
