type Props = {
  message?: string;
  className?: string;
};

export default function LoadingState({ message = "Loading…", className = "" }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div
        className="h-9 w-9 rounded-full border-2 border-amber-400/20 border-t-amber-400 animate-spin"
        aria-hidden
      />
      <p className="mt-4 text-sm text-zinc-400">{message}</p>
    </div>
  );
}
