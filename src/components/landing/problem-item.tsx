import type { ComponentType } from "react";

export function ProblemItem({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="py-7 first:pt-0 last:pb-0">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 shrink-0 rounded-app-md bg-bg-surface-2 p-2.5">
          <Icon className="size-5 text-purple-soft" />
        </div>
        <div>
          <p className="font-bold leading-snug text-text-primary">{title}</p>
          <p className="mt-2 text-sm leading-7 text-text-secondary">{text}</p>
        </div>
      </div>
    </div>
  );
}
