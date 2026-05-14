"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api, DashboardStats, getApiErrorMessage } from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import SeverityBadge from "@/components/SeverityBadge";
import LoadingState from "@/components/ui/LoadingState";
import ErrorBanner from "@/components/ui/ErrorBanner";
import EmptyState from "@/components/ui/EmptyState";
import { AlertTriangle, Zap, Database, TrendingUp, Activity, RefreshCw, Radio } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <div className="glass-card p-5">
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold tracking-tight text-white">{value}</p>
      <p className="mt-1 text-sm text-zinc-400">{label}</p>
    </div>
  );
}

const agentColors: Record<string, string> = {
  "Monitor Agent": "text-cyan-400",
  "Analyst Agent": "text-purple-400",
  "Action Agent": "text-emerald-400",
  "Briefing Agent": "text-amber-400",
  Pipeline: "text-amber-400/90",
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const refresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center p-8">
          <LoadingState message="Connecting to Sentinel agents…" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-auto p-8 text-zinc-100 lg:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold text-zinc-400 backdrop-blur-md">
                <Radio className="h-3 w-3 text-emerald-400" />
                Live situation room
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Situation room</h1>
              <p className="mt-1 text-sm text-zinc-400">
                Four autonomous agents monitor data, analyze risk, act, and brief leadership.
              </p>
            </div>
            <button type="button" onClick={refresh} className="btn-ghost self-start sm:self-auto">
              <RefreshCw className={`h-4 w-4 text-zinc-400 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-8">
              <ErrorBanner message={error} onDismiss={() => setError("")} />
            </div>
          )}

          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total anomalies"
              value={stats?.total_anomalies ?? 0}
              icon={AlertTriangle}
              accent="bg-red-500/15 text-red-400"
            />
            <StatCard
              label="Critical issues"
              value={stats?.critical_anomalies ?? 0}
              icon={TrendingUp}
              accent="bg-orange-500/15 text-orange-400"
            />
            <StatCard
              label="Actions taken"
              value={stats?.actions_taken ?? 0}
              icon={Zap}
              accent="bg-emerald-500/15 text-emerald-400"
            />
            <StatCard
              label="Data sources"
              value={stats?.data_sources ?? 0}
              icon={Database}
              accent="bg-amber-500/15 text-amber-400"
            />
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="glass-section p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                Recent anomalies
              </h2>
              {!stats?.recent_anomalies?.length ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="All clear for now"
                  description="No anomalies in the database yet. Upload a spreadsheet, PDF, or paste data to run the monitor agent."
                  action={{ label: "Upload data", href: "/upload" }}
                />
              ) : (
                <ul className="space-y-3">
                  {stats.recent_anomalies.map((a) => (
                    <li key={a.id} className="glass-nested p-4">
                      <div className="flex items-start gap-3">
                        <SeverityBadge severity={a.severity} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">{a.title}</p>
                          <p className="truncate text-xs text-zinc-400">{a.description}</p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="glass-section p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                <Activity className="h-4 w-4 text-amber-400" />
                Agent activity
              </h2>
              {!stats?.recent_logs?.length ? (
                <EmptyState
                  icon={Activity}
                  title="No traces yet"
                  description="Agent reasoning logs appear after you process data through the pipeline."
                  action={{ label: "Go to upload", href: "/upload" }}
                  secondaryAction={{ label: "View full logs", href: "/logs" }}
                />
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {stats.recent_logs.map((log) => (
                    <div key={log.id} className="flex gap-3 text-xs">
                      <span
                        className={`shrink-0 font-semibold whitespace-nowrap ${agentColors[log.agent_name] ?? "text-zinc-500"}`}
                      >
                        {log.agent_name}
                      </span>
                      <span className="min-w-0 truncate text-zinc-400">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="glass-section p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
              <Zap className="h-4 w-4 text-emerald-400" />
              Autonomous actions
            </h2>
            {!stats?.recent_actions?.length ? (
              <EmptyState
                icon={Zap}
                title="No autonomous actions yet"
                description="When the monitor finds anomalies, the action agent drafts emails, tasks, and escalations automatically."
                action={{ label: "Upload sample data", href: "/upload" }}
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {stats.recent_actions.map((action) => (
                  <div key={action.id} className="glass-nested p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-400">
                        {action.action_type.replace("_", " ")}
                      </span>
                      {action.recipient && <span className="text-xs text-zinc-500">To: {action.recipient}</span>}
                    </div>
                    <p className="text-sm font-medium text-white">{action.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-400">{action.content}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="mt-6 text-center text-xs text-zinc-500">
              Need the board narrative?{" "}
              <Link href="/briefing" className="font-semibold text-amber-400 transition hover:text-amber-300">
                Open executive briefing →
              </Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
