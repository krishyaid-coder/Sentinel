import { AlertCircle } from "lucide-react";

type Props = {
  message: string;
  onDismiss?: () => void;
};

export default function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-400/25 bg-red-950/40 px-4 py-3 text-sm text-red-100 backdrop-blur-md"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <p className="min-w-0 flex-1 leading-relaxed">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-xs font-semibold text-red-200/90 underline-offset-2 hover:underline"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
