"use client";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { api, GeminiStatus, getApiErrorMessage } from "@/lib/api";
import ErrorBanner from "@/components/ui/ErrorBanner";
import LoadingState from "@/components/ui/LoadingState";
import { KeyRound, Loader2, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [status, setStatus] = useState<GeminiStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [keyInput, setKeyInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const s = await api.getGeminiStatus();
      setStatus(s);
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!keyInput.trim()) {
      setError("Paste your API key first.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await api.setGeminiKey(keyInput.trim());
      setMessage(res.message);
      setKeyInput("");
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const clearStored = async () => {
    setClearing(true);
    setError("");
    setMessage("");
    try {
      const res = await api.clearGeminiKey();
      setMessage(res.message);
      await load();
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative z-10 flex-1 p-8 text-zinc-100 lg:p-10">
        <div className="mx-auto max-w-xl">
          <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Add your API key from{" "}
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300"
            >
              Google AI Studio
            </a>
            , or use <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">GEMINI_API_KEY</code> in{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">backend/.env</code> when you clone from GitHub. If both are set, the key saved in
            the app database is used.
          </p>

          {loading ? (
            <LoadingState message="Loading settings…" className="py-12" />
          ) : (
            <div className="glass-section mt-8 space-y-6 p-6 lg:p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-white">API key</h2>
                  <p className="mt-1 text-xs text-zinc-500">
                    Keys are stored only on this server (SQLite). They are never sent to the browser after save.
                  </p>
                  <p className="mt-2 text-xs font-medium text-zinc-400">
                    Status:{" "}
                    {status?.configured ? (
                      <span className="text-emerald-400">Configured</span>
                    ) : (
                      <span className="text-amber-400">Not configured</span>
                    )}{" "}
                    <span className="text-zinc-500">
                      ({status?.source === "database" ? "saved in app" : status?.source === "environment" ? "from environment" : "none"})
                    </span>
                  </p>
                </div>
              </div>

              {error && <ErrorBanner message={error} onDismiss={() => setError("")} />}
              {message && (
                <p className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">{message}</p>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-200">New API key</label>
                <input
                  type="password"
                  autoComplete="off"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="AIza…"
                  className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={save} disabled={saving} className="btn-warm px-5 py-2.5 text-sm disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Save key
                </button>
                {status?.source === "database" && (
                  <button
                    type="button"
                    onClick={clearStored}
                    disabled={clearing}
                    className="btn-ghost border-red-500/20 text-red-200 hover:border-red-500/40 hover:bg-red-500/10"
                  >
                    {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Remove stored key
                  </button>
                )}
              </div>
            </div>
          )}

          <p className="mt-6 text-xs leading-relaxed text-zinc-500">
            For production, restrict who can reach this app and your API backend. The settings endpoint has no built-in admin login.
          </p>
        </div>
      </main>
    </div>
  );
}
