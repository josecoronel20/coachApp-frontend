import type { ComponentType } from "react";

export function HeroProof({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-app-full border border-border-subtle bg-bg-surface-1/80 px-4 py-3 text-sm font-semibold text-text-primary">
      <Icon className="size-4 text-purple-soft" />
      {text}
    </div>
  );
}
