"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  FileText,
  Home,
  LayoutDashboard,
  Settings,
  Upload,
  Zap,
} from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/anomalies", label: "Anomalies", icon: AlertTriangle },
  { href: "/actions", label: "Actions", icon: Zap },
  { href: "/briefing", label: "Briefing", icon: FileText },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/logs", label: "Agent logs", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="glass-panel glass-edge flex min-h-screen w-[260px] shrink-0 flex-col border-r border-white/[0.08] bg-white/[0.03] backdrop-blur-xl">
      <div className="border-b border-white/[0.08] px-5 py-5">
        <Link href="/" className="flex items-center gap-3 rounded-xl p-1 transition hover:bg-white/[0.06]">
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl ring-2 ring-amber-500/30 shadow-lg shadow-orange-500/20">
            <Image src="/sentinel-logo.png" alt="Sentinel" width={44} height={44} className="h-full w-full object-cover" priority />
          </span>
          <div>
            <p className="text-sm font-bold tracking-tight text-white">Sentinel</p>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">Situation room</p>
          </div>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-neutral-950 shadow-md shadow-orange-500/20"
                  : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-90" strokeWidth={active ? 2.25 : 1.75} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/[0.08] px-5 py-4">
        <p className="text-[11px] text-zinc-500">Autonomous monitoring</p>
        <p className="mt-1 text-[11px] text-zinc-600">Four agents · situation room</p>
      </div>
    </aside>
  );
}
