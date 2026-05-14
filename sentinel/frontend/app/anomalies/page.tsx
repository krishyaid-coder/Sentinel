"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import SeverityBadge from "@/components/SeverityBadge";
import { api, Anomaly, getApiErrorMessage } from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAnomalies()
      .then((data) => {
        setAnomalies(data);
        setError("");
      })
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? anomalies : anomalies.filter((a) => a.severity === filter);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative z-10 flex-1 p-8 text-zinc-100 lg:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Anomalies</h1>
              <p className="mt-1 text-sm text-zinc-400">{anomalies.length} total in database</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {["all", "critical", "high", "medium", "low"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilter(s)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                    filter === s
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 shadow-md shadow-orange-500/20"
                      : "border border-white/10 bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorBanner message={error} onDismiss={() => setError("")} />
            </div>
          )}

          {loading ? (
            <LoadingState message="Loading anomalies…" />
          ) : !filtered.length ? (
            <EmptyState
              icon={AlertTriangle}
              title="No anomalies match this view"
              description="Upload operational data to run the monitor agent. When metrics drift from baseline, they appear here with severity and context."
              action={{ label: "Upload data", href: "/upload" }}
              secondaryAction={{ label: "Situation room", href: "/dashboard" }}
            />
          ) : (
            <ul className="space-y-3">
              {filtered.map((a) => (
                <li key={a.id} className="glass-nested p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <SeverityBadge severity={a.severity} />
                        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                          {a.source_type}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-white">{a.title}</h2>
                      <p className="mt-1 text-sm leading-relaxed text-zinc-400">{a.description}</p>
                      {a.metric_name && (
                        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400">
                          <div>
                            <dt className="inline text-zinc-500">Metric </dt>
                            <dd className="inline text-zinc-200">{a.metric_name}</dd>
                          </div>
                          {a.metric_value !== undefined && (
                            <div>
                              <dt className="inline text-zinc-500">Value </dt>
                              <dd className="inline text-zinc-200">{a.metric_value}</dd>
                            </div>
                          )}
                          {a.deviation_pct !== undefined && (
                            <div>
                              <dt className="inline text-zinc-500">Deviation </dt>
                              <dd className="inline font-semibold text-red-400">{a.deviation_pct.toFixed(1)}%</dd>
                            </div>
                          )}
                        </dl>
                      )}
                    </div>
                    <p className="shrink-0 text-xs text-zinc-500 sm:text-right">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
