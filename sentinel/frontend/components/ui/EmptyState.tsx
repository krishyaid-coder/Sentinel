import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
};

export default function EmptyState({ icon: Icon, title, description, action, secondaryAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.03] px-8 py-14 text-center backdrop-blur-md">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-600/10 text-amber-400 ring-1 ring-white/10">
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-400">{description}</p>
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Link href={action.href} className="btn-warm px-5 py-2.5 text-sm">
              {action.label}
            </Link>
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href}
              className="text-sm font-semibold text-amber-400/90 transition hover:text-amber-300"
            >
              {secondaryAction.label} →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
