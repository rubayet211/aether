export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-label={label} aria-busy="true">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}
