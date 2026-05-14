const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function getApiErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const m = err.message;
    if (
      m === "Load failed" ||
      m === "Failed to fetch" ||
      m.includes("NetworkError") ||
      m.includes("network error")
    ) {
      return (
        `${m}: cannot reach the API. Confirm NEXT_PUBLIC_API_URL is your Railway HTTPS base URL, ` +
        `redeploy Vercel after changing it, and that the backend is up (open /health in a new tab). ` +
        `If the backend is up, redeploy Railway after pulling the latest CORS update.`
      );
    }
    return m;
  }
  return "Something went wrong.";
}

async function readErrorBody(res: Response): Promise<string> {
  const text = await res.text();
  const trimmed = text.trimStart();
  if (trimmed.startsWith("<!") || trimmed.startsWith("<html")) {
    return (
      `Got an HTML page instead of JSON (${res.status}). Your app is calling the wrong host: ` +
      `set Vercel env NEXT_PUBLIC_API_URL to your FastAPI base URL only (e.g. https://your-service.up.railway.app), ` +
      `then redeploy. Do not use your *.vercel.app URL there.`
    );
  }
  try {
    const j = JSON.parse(text) as { detail?: unknown };
    if (j.detail != null) {
      if (typeof j.detail === "string") return j.detail;
      if (Array.isArray(j.detail)) {
        return j.detail
          .map((d: { msg?: string }) => d?.msg)
          .filter(Boolean)
          .join("; ");
      }
    }
  } catch {
    /* not JSON */
  }
  return text || `Request failed (${res.status})`;
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) throw new Error(await readErrorBody(res));
  const text = await res.text();
  if (!text.trim()) return null as T;
  return JSON.parse(text) as T;
}

export interface Anomaly {
  id: string;
  data_source_id: string;
  source_type: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  metric_name?: string;
  metric_value?: number;
  metric_baseline?: number;
  deviation_pct?: number;
  status: string;
  created_at: string;
}

export interface AgentAction {
  id: string;
  anomaly_id: string;
  action_type: string;
  title: string;
  content: string;
  recipient?: string;
  created_at: string;
}

export interface AgentLog {
  id: string;
  agent_name: string;
  step: string;
  message: string;
  related_id?: string;
  created_at: string;
}

export interface DashboardStats {
  total_anomalies: number;
  critical_anomalies: number;
  actions_taken: number;
  data_sources: number;
  recent_anomalies: Anomaly[];
  recent_actions: AgentAction[];
  recent_logs: AgentLog[];
}

export interface Briefing {
  id: string;
  title: string;
  summary: string;
  key_insights: string[];
  anomaly_count: number;
  critical_count: number;
  actions_taken: number;
  briefing_date?: string;
  created_at: string;
}

export interface GeminiStatus {
  configured: boolean;
  source: "database" | "environment" | "none";
}

export const api = {
  getGeminiStatus: () => fetchAPI<GeminiStatus>("/api/settings/gemini"),
  setGeminiKey: (api_key: string) =>
    fetchAPI<{ ok: boolean; message: string }>("/api/settings/gemini", {
      method: "POST",
      body: JSON.stringify({ api_key }),
    }),
  clearGeminiKey: () =>
    fetchAPI<{ ok: boolean; message: string }>("/api/settings/gemini", { method: "DELETE" }),
  getDashboardStats: () => fetchAPI<DashboardStats>("/api/dashboard/stats"),
  getAgentLogs: () => fetchAPI<AgentLog[]>("/api/dashboard/logs"),
  getAllActions: () => fetchAPI<AgentAction[]>("/api/dashboard/actions"),
  getAnomalies: (severity?: string) =>
    fetchAPI<Anomaly[]>(`/api/anomalies${severity ? `?severity=${severity}` : ""}`),
  getAnomaly: (id: string) => fetchAPI<Anomaly>(`/api/anomalies/${id}`),
  getAnomalyActions: (id: string) => fetchAPI<AgentAction[]>(`/api/anomalies/${id}/actions`),
  getBriefings: () => fetchAPI<Briefing[]>("/api/briefings"),
  getLatestBriefing: () => fetchAPI<Briefing | null>("/api/briefings/latest"),
  generateBriefing: () =>
    fetchAPI<{ message: string; briefing_id: string }>("/api/briefings/generate", { method: "POST" }),
  uploadFile: async (file: File, sourceName: string, sourceType: string) => {
    const form = new FormData();
    form.append("file", file);
    form.append("source_name", sourceName);
    form.append("source_type", sourceType);
    const res = await fetch(`${BASE_URL}/api/upload/file`, { method: "POST", body: form });
    if (!res.ok) throw new Error(await readErrorBody(res));
    return res.json();
  },
  uploadText: (text: string, sourceName: string, sourceType: string) =>
    fetchAPI("/api/upload/text", {
      method: "POST",
      body: JSON.stringify({ text, source_name: sourceName, source_type: sourceType }),
    }),
};
