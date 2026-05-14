"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  FileText,
  LayoutDashboard,
  Radar,
  Settings,
  Shield,
  Upload,
  Zap,
} from "lucide-react";

const pillars = [
  {
    icon: Radar,
    title: "Always-on signal",
    body: "Ingest CSV, Excel, PDFs, screenshots, JSON, or paste. Metrics normalize automatically.",
  },
  {
    icon: Bot,
    title: "Four chained agents",
    body: "Monitor, Analyst, Action, Briefing. Signal to narrative without hand-offs.",
  },
  {
    icon: Shield,
    title: "Demo-grade transparency",
    body: "Reasoning logs, triage, and board copy so autonomy stays visible, not a black box.",
  },
];

const dock = [
  { href: "/", label: "Home", icon: Activity },
  { href: "/dashboard", label: "Room", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/briefing", label: "Brief", icon: FileText },
  { href: "/settings", label: "Setup", icon: Settings },
];

export default function LandingPage() {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-x-hidden text-zinc-100">
      <div
        className="pointer-events-none fixed -right-32 top-1/4 h-[min(80vw,520px)] w-[min(80vw,520px)] rounded-full bg-gradient-to-br from-amber-500/25 via-orange-600/15 to-transparent blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed -left-24 top-1/3 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl"
        aria-hidden
      />

      {/* Header */}
      <header className="relative z-20 px-4 pt-6 sm:px-6">
        <div className="glass-panel glass-edge mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-2.5 pl-4 sm:px-4 sm:py-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl ring-2 ring-amber-500/35 shadow-lg shadow-orange-500/25">
              <Image src="/sentinel-logo.png" alt="Sentinel" width={40} height={40} className="h-full w-full object-cover" priority />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold tracking-tight text-white sm:text-sm">Sentinel</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">Situation room</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Situation room
            </Link>
            <Link
              href="/upload"
              className="rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Upload
            </Link>
          </nav>

          <Link
            href="/dashboard"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-sm font-bold tracking-tight text-neutral-950 shadow-lg shadow-orange-500/30 transition hover:brightness-110 sm:px-5 sm:py-3"
          >
            Launch
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-36 pt-12 sm:px-6 sm:pb-40 sm:pt-16 lg:pt-20">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-4">
          <div>
            <div className="mb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Live demo · Four-agent pipeline
              </span>
            </div>

            <h1 className="max-w-xl text-balance text-[2.35rem] font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.25rem] lg:leading-[0.98]">
              <span className="block text-white">Sentinel</span>
              <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Your business,
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
                monitored autonomously.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg">
              Operational data in. Four agents watch drift, explain root cause, draft the next move, and brief
              leadership. Your team decides instead of digging.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 px-7 py-3.5 text-base font-bold text-neutral-950 shadow-xl shadow-orange-500/25 transition hover:brightness-110"
              >
                Open situation room
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-7 py-3.5 text-base font-semibold text-white backdrop-blur-md transition hover:bg-white/[0.1]"
              >
                <Zap className="h-5 w-5 text-amber-400" />
                Run live upload
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.08] pt-8 text-xs font-medium uppercase tracking-wider text-zinc-500">
              <span className="flex items-center gap-2 text-zinc-400">
                <BarChart3 className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
                CSV · Excel
              </span>
              <span className="flex items-center gap-2 text-zinc-400">
                <FileText className="h-4 w-4 text-zinc-500" strokeWidth={1.5} />
                PDF · JSON
              </span>
              <span className="flex items-center gap-2 text-zinc-400">
                <Bot className="h-4 w-4 text-amber-500/80" strokeWidth={1.5} />
                4 agents
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-orange-500/20 via-transparent to-indigo-600/10 blur-2xl" />
            <div className="glass-panel-strong glass-edge relative overflow-hidden rounded-[2rem] p-6 sm:p-8">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />

              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Agent mesh</p>
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                    Running
                  </span>
                </div>

                {[
                  { name: "Monitor", sub: "Metrics + anomaly scan" },
                  { name: "Analyst", sub: "Root cause + impact" },
                  { name: "Action + Briefing", sub: "Drafts + executive narrative" },
                ].map((row, i) => (
                  <div
                    key={row.name}
                    className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-black/20 p-4 backdrop-blur-sm"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] text-sm font-bold text-amber-400/90">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{row.name}</p>
                      <p className="text-sm text-zinc-500">{row.sub}</p>
                    </div>
                  </div>
                ))}

                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-center">
                  <p className="text-xs text-zinc-500">
                    Drop a file on Upload, then watch this pipeline in Agent logs, Dashboard, and Briefing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 sm:mt-28">
          <div className="mb-8 max-w-xl">
            <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">Why teams bring Sentinel to demos</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Depth without clutter: glass, glow, and confident type so the story reads as premium, not generic.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {pillars.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="glass-panel glass-edge group relative overflow-hidden rounded-2xl p-6 transition hover:border-amber-500/20"
              >
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/10 opacity-0 blur-2xl transition group-hover:opacity-100" />
                <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-white/10 to-transparent text-amber-400/90 ring-1 ring-white/10">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="relative text-base font-semibold text-white">{title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-zinc-500">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 sm:mt-24">
          <div className="glass-panel-strong glass-edge relative overflow-hidden rounded-[2rem] px-6 py-10 text-center sm:px-12 sm:py-14">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent" />
            <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-amber-500/90">Judge path</p>
            <p className="relative mx-auto mt-3 max-w-2xl text-lg font-medium leading-relaxed text-zinc-200 sm:text-xl">
              Landing, then upload, then anomalies and actions on the dashboard, then executive briefing, with full trace
              in agent logs.
            </p>
            <Link
              href="/dashboard"
              className="relative mt-8 inline-flex items-center gap-2 text-sm font-bold text-amber-400 transition hover:text-amber-300"
            >
              Enter the situation room
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <footer className="relative mt-20 border-t border-white/[0.06] pt-10 text-center text-[11px] leading-relaxed text-zinc-600 sm:mt-28">
          Sentinel is a demo or pilot stack, not compliance or production advice.
        </footer>
      </main>

      <nav
        className="glass-panel-strong glass-edge fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full px-2 py-2 shadow-2xl shadow-black/50 sm:bottom-8 sm:gap-2 sm:px-3"
        aria-label="Primary"
      >
        {dock.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-[13px] ${
                active
                  ? "bg-white text-neutral-950 shadow-md"
                  : "text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={active ? 2.25 : 1.75} />
              <span className="hidden sm:inline">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
