"use client";
import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { api, AgentLog, getApiErrorMessage } from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const agentColors: Record<string, string> = {
  "Monitor Agent": "text-cyan-300 bg-cyan-500/10 border-cyan-500/25",
  "Analyst Agent": "text-purple-300 bg-purple-500/10 border-purple-500/25",
  "Action Agent": "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
  "Briefing Agent": "text-amber-300 bg-amber-500/10 border-amber-500/25",
  Pipeline: "text-amber-400 bg-amber-500/10 border-amber-500/25",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .getAgentLogs()
      .then((data) => {
        setLogs(data);
        setError("");
      })
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative z-10 flex-1 p-8 text-zinc-100 lg:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Agent reasoning logs</h1>
            <p className="mt-1 text-sm text-zinc-400">Step-by-step trace from all four agents. Refreshes every 5s.</p>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorBanner message={error} onDismiss={() => setError("")} />
            </div>
          )}

          {loading ? (
            <LoadingState message="Fetching logs…" />
          ) : !logs.length ? (
            <EmptyState
              icon={Activity}
              title="No log lines yet"
              description="Each pipeline run and scheduler tick writes structured steps here. Ideal for demos and debugging."
              action={{ label: "Run an upload", href: "/upload" }}
            />
          ) : (
            <div className="glass-section overflow-hidden p-0">
              <ul className="divide-y divide-white/[0.06]">
                {logs.map((log) => {
                  const colorClass = agentColors[log.agent_name] ?? "text-zinc-400 bg-white/[0.05] border-white/10";
                  return (
                    <li key={log.id} className="flex items-start gap-4 px-5 py-3.5 transition hover:bg-white/[0.03]">
                      <div className="mt-0.5 shrink-0">
                        <span className={`inline-block rounded-lg border px-2 py-0.5 text-xs font-semibold ${colorClass}`}>
                          {log.agent_name}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          {log.step}
                        </p>
                        <p className="text-sm leading-relaxed text-zinc-200">{log.message}</p>
                      </div>
                      <time className="shrink-0 text-xs text-zinc-500">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </time>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
