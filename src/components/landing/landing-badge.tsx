import type { ReactNode } from "react";

export function LandingBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-app-full border border-purple-primary/40 bg-purple-primary/15 px-4 py-1.5 text-xs font-bold uppercase text-purple-soft shadow-purple-glow">
      {children}
    </span>
  );
}
