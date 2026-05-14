import clsx from "clsx";

const config = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

export default function SeverityBadge({ severity }: { severity: string }) {
  return (
    <span className={clsx(
      "text-xs font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wide",
      config[severity as keyof typeof config] ?? "border border-border bg-card-elevated text-muted"
    )}>
      {severity}
    </span>
  );
}
