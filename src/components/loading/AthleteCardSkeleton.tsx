import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder de tarjeta en el grid del dashboard. */
export function AthleteCardSkeleton() {
  return (
    <article className="rounded-app-2xl border border-border-subtle bg-bg-surface-1 p-4 shadow-elevation-1">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-app-xl bg-bg-surface-3" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 max-w-[180px] bg-bg-surface-3" />
          <Skeleton className="h-4 max-w-[220px] bg-bg-surface-2" />
          <Skeleton className="h-16 w-full rounded-app-lg bg-bg-surface-2" />
          <Skeleton className="h-9 w-full rounded-app-full bg-bg-surface-3" />
        </div>
      </div>
    </article>
  );
}
