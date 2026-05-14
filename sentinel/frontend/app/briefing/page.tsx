"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { api, Briefing, getApiErrorMessage } from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { FileText, RefreshCw, Loader2, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function BriefingPage() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await api.getLatestBriefing();
      setBriefing(data);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async () => {
    setGenerating(true);
    try {
      setError("");
      await api.generateBriefing();
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative z-10 flex-1 p-8 text-zinc-100 lg:p-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Executive briefing</h1>
              <p className="mt-1 text-sm text-zinc-400">Boardroom narrative from the Briefing Agent</p>
            </div>
            <button
              type="button"
              onClick={generate}
              disabled={generating}
              className="btn-warm self-start px-5 py-2.5 text-sm sm:self-auto"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              {generating ? "Generating…" : "Generate now"}
            </button>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorBanner message={error} onDismiss={() => setError("")} />
            </div>
          )}

          {loading ? (
            <LoadingState message="Loading latest briefing…" />
          ) : !briefing ? (
            <div className="glass-section border border-dashed border-white/15 px-8 py-14 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-zinc-500" strokeWidth={1.25} />
              <p className="text-sm leading-relaxed text-zinc-400">
                No briefing on file yet. Process data with anomalies, or tap{" "}
                <strong className="text-white">Generate now</strong> to synthesize from the latest anomalies and
                actions in the database.
              </p>
              <Link href="/upload" className="mt-6 inline-block text-sm font-semibold text-amber-400 hover:text-amber-300">
                Upload data →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <section className="glass-section p-6 lg:p-8">
                <h2 className="text-xl font-bold text-white">{briefing.title}</h2>
                <p className="mt-1 text-sm text-zinc-400">
                  {briefing.briefing_date} · Generated{" "}
                  {formatDistanceToNow(new Date(briefing.created_at), { addSuffix: true })}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="glass-nested p-3 text-center">
                    <AlertTriangle className="mx-auto mb-1 h-4 w-4 text-red-400" />
                    <p className="text-xl font-bold text-white">{briefing.anomaly_count}</p>
                    <p className="text-xs text-zinc-500">Anomalies</p>
                  </div>
                  <div className="glass-nested p-3 text-center">
                    <TrendingUp className="mx-auto mb-1 h-4 w-4 text-orange-400" />
                    <p className="text-xl font-bold text-white">{briefing.critical_count}</p>
                    <p className="text-xs text-zinc-500">Critical</p>
                  </div>
                  <div className="glass-nested p-3 text-center">
                    <Zap className="mx-auto mb-1 h-4 w-4 text-emerald-400" />
                    <p className="text-xl font-bold text-white">{briefing.actions_taken}</p>
                    <p className="text-xs text-zinc-500">Actions</p>
                  </div>
                </div>
              </section>

              <section className="glass-section p-6 lg:p-8">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Situation summary</h3>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">{briefing.summary}</div>
              </section>

              {briefing.key_insights?.length > 0 && (
                <section className="glass-section p-6 lg:p-8">
                  <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Key insights</h3>
                  <ol className="space-y-3">
                    {briefing.key_insights.map((insight, i) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-200">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 text-xs font-bold text-neutral-950">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{insight}</span>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
