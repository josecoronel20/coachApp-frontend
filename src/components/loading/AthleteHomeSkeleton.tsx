import { Skeleton } from "@/components/ui/skeleton";

export function AthleteHomeSkeleton() {
  const rows = Array.from({ length: 5 }, (_, i) => i);
  const chips = Array.from({ length: 4 }, (_, i) => i);

  return (
    <div className="min-h-dvh bg-bg-base">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <header className="border-b border-border-subtle p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Skeleton className="h-9 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-app-full bg-bg-surface-3" />
              <Skeleton className="h-9 w-24 rounded-app-full bg-bg-surface-3" />
            </div>
          </div>
        </header>

        <div className="flex flex-col items-center gap-4 px-2">
          <Skeleton className="h-7 w-48 bg-bg-surface-3" />
          <div className="flex flex-wrap justify-center gap-2">
            {chips.map((i) => (
              <Skeleton key={i} className="h-9 w-20 rounded-app-full bg-bg-surface-3" />
            ))}
          </div>
        </div>

        <div className="m-4 space-y-3 rounded-app-2xl border border-border-subtle bg-bg-surface-1 p-4">
          <Skeleton className="h-6 w-32 bg-bg-surface-3" />
          {rows.map((i) => (
            <div
              key={i}
              className="grid grid-cols-4 items-center gap-2 border-b border-border-subtle py-3 last:border-0"
            >
              <Skeleton className="col-span-3 h-4 w-full max-w-[240px] bg-bg-surface-3" />
              <Skeleton className="col-span-1 h-4 w-14 justify-self-end bg-bg-surface-3" />
            </div>
          ))}
        </div>

        <div className="app-fixed-bottom fixed bottom-0 left-0 right-0 border-t border-border-subtle bg-bg-base/90 px-4 pt-4 backdrop-blur-xl">
          <Skeleton className="mx-auto h-12 w-full max-w-2xl rounded-app-full bg-bg-surface-3" />
        </div>
      </div>
    </div>
  );
}
