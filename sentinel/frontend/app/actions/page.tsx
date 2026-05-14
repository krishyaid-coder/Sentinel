"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { api, AgentAction, getApiErrorMessage } from "@/lib/api";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Zap, Mail, ListTodo, AlertOctagon, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const actionIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  email_draft: Mail,
  task: ListTodo,
  escalation: AlertOctagon,
  alert: Bell,
};
const actionColors: Record<string, string> = {
  email_draft: "border-blue-500/30 bg-blue-500/15 text-blue-300",
  task: "border-purple-500/30 bg-purple-500/15 text-purple-300",
  escalation: "border-red-500/30 bg-red-500/15 text-red-300",
  alert: "border-amber-500/30 bg-amber-500/15 text-amber-200",
};

export default function ActionsPage() {
  const [actions, setActions] = useState<AgentAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getAllActions()
      .then((data) => {
        setActions(data);
        setError("");
      })
      .catch((e) => setError(getApiErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative z-10 flex-1 p-8 text-zinc-100 lg:p-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">Autonomous actions</h1>
            <p className="mt-1 text-sm text-zinc-400">{actions.length} drafted by the Action Agent</p>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorBanner message={error} onDismiss={() => setError("")} />
            </div>
          )}

          {loading ? (
            <LoadingState message="Loading actions…" />
          ) : !actions.length ? (
            <EmptyState
              icon={Zap}
              title="No actions yet"
              description="After anomalies are analyzed, Sentinel drafts emails, tasks, escalations, and alerts. They show up here with full content."
              action={{ label: "Upload data", href: "/upload" }}
            />
          ) : (
            <ul className="space-y-3">
              {actions.map((action) => {
                const Icon = actionIcons[action.action_type] ?? Bell;
                const colorClass = actionColors[action.action_type] ?? "border-white/10 bg-white/[0.05] text-zinc-400";
                const isExpanded = expanded === action.id;
                return (
                  <li key={action.id} className="glass-nested overflow-hidden">
                    <button
                      type="button"
                      className="w-full p-5 text-left"
                      onClick={() => setExpanded(isExpanded ? null : action.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${colorClass}`}
                          >
                            <Icon className="h-3 w-3" />
                            {action.action_type.replace("_", " ")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-white">{action.title}</p>
                            {action.recipient && <p className="mt-0.5 text-xs text-zinc-500">To: {action.recipient}</p>}
                          </div>
                        </div>
                        <span className="shrink-0 text-xs text-zinc-500">
                          {formatDistanceToNow(new Date(action.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-white/[0.08] px-5 pb-5 pt-4">
                        <pre className="whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-4 font-sans text-xs leading-relaxed text-zinc-300">
                          {action.content}
                        </pre>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
