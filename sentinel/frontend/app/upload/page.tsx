"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { api, getApiErrorMessage } from "@/lib/api";
import ErrorBanner from "@/components/ui/ErrorBanner";
import { Upload, FileText, CheckCircle, Loader2, ArrowRight } from "lucide-react";

const SOURCE_TYPES = [
  { value: "auto", label: "Auto-detect" },
  { value: "support", label: "Customer Support" },
  { value: "sales", label: "Sales Pipeline" },
  { value: "finance", label: "Finance / Revenue" },
  { value: "health", label: "Customer Health" },
];

type Status = "idle" | "loading" | "success" | "error";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [sourceType, setSourceType] = useState("auto");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<{
    anomalies?: unknown[];
    actions?: unknown[];
    briefing?: string | null;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [textMode, setTextMode] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!sourceName.trim()) {
      setErrorMsg("Please enter a data source name.");
      return;
    }
    if (!textMode && !file) {
      setErrorMsg("Please select a file.");
      return;
    }
    if (textMode && !pastedText.trim()) {
      setErrorMsg("Please paste some data.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    try {
      let res;
      if (textMode) {
        res = await api.uploadText(pastedText, sourceName, sourceType);
      } else {
        res = await api.uploadFile(file!, sourceName, sourceType);
      }
      setResult(res.result);
      setStatus("success");
    } catch (e) {
      setErrorMsg(getApiErrorMessage(e));
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="relative z-10 flex-1 p-8 text-zinc-100 lg:p-10">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white">Upload business data</h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">
            CSV, Excel, PDF, images, JSON, or pasted text. Sentinel runs the full four-agent pipeline: extract
            metrics, detect anomalies, analyze, act, and brief.
          </p>

          <div className="glass-section mt-8 space-y-5 p-6 lg:p-8">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTextMode(false)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  !textMode
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 shadow-md shadow-orange-500/20"
                    : "border border-white/10 bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                File upload
              </button>
              <button
                type="button"
                onClick={() => setTextMode(true)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  textMode
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 shadow-md shadow-orange-500/20"
                    : "border border-white/10 bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                }`}
              >
                Paste data
              </button>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-200">Data source name</label>
              <input
                type="text"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="e.g. Q2 Support Tickets, May Sales Report"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-200">Data type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              >
                {SOURCE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {!textMode ? (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-200">File</label>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] px-6 py-10 text-center transition hover:border-amber-500/40 hover:bg-white/[0.06]"
                >
                  <Upload className="mx-auto mb-2 h-8 w-8 text-zinc-500" />
                  {file ? (
                    <p className="text-sm font-medium text-amber-400">{file.name}</p>
                  ) : (
                    <>
                      <p className="text-sm text-zinc-400">Click to choose a file</p>
                      <p className="mt-1 text-xs text-zinc-500">CSV, Excel, PDF, PNG, JPEG, JSON, TXT</p>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.json,.pdf,.png,.jpg,.jpeg,.txt,.webp"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </button>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-200">Paste data</label>
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={8}
                  placeholder="Paste CSV, JSON, logs, or narrative text."
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-white placeholder:text-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
            )}

            {errorMsg && <ErrorBanner message={errorMsg} onDismiss={() => setErrorMsg("")} />}

            <button
              type="button"
              onClick={handleUpload}
              disabled={status === "loading"}
              className="btn-warm w-full justify-center py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Running 4-agent pipeline…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Analyze with Sentinel
                </>
              )}
            </button>
          </div>

          {status === "success" && result && (
            <div className="glass-section mt-8 border border-emerald-500/20 bg-emerald-500/[0.06] p-6 lg:p-8">
              <div className="mb-6 flex items-center gap-2 font-semibold text-emerald-400">
                <CheckCircle className="h-5 w-5" /> Pipeline complete
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-white">{result.anomalies?.length ?? 0}</p>
                  <p className="text-xs text-zinc-400">Anomalies</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{result.actions?.length ?? 0}</p>
                  <p className="text-xs text-zinc-400">Actions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{result.briefing ? "1" : "0"}</p>
                  <p className="text-xs text-zinc-400">Briefing</p>
                </div>
              </div>
              <p className="mt-6 text-center text-sm text-zinc-400">
                Review outcomes in the situation room or open the executive briefing.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Link href="/dashboard" className="btn-warm px-5 py-2 text-sm">
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/briefing" className="text-sm font-semibold text-amber-400 hover:text-amber-300">
                  View briefing →
                </Link>
              </div>
            </div>
          )}

          <div className="glass-section mt-8 p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <FileText className="h-4 w-4 text-zinc-500" /> Supported formats
            </h3>
            <ul className="grid gap-2 text-xs text-zinc-400 sm:grid-cols-2">
              <li>CSV / Excel: tables and KPIs</li>
              <li>PDF: reports and statements</li>
              <li>PNG / JPEG: dashboard screenshots</li>
              <li>JSON: exports and payloads</li>
              <li>Plain text: tickets and notes</li>
              <li>Paste mode: anything else</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
