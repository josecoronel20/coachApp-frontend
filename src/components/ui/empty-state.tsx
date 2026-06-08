import * as React from "react"

import { cn } from "@/lib/utils"

type EmptyStateProps = React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-app-2xl border border-dashed border-border-subtle bg-bg-surface-1 px-6 py-10 text-center",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="mb-4 rounded-app-xl border border-purple-primary/20 bg-purple-primary/10 p-3 text-purple-soft">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export { EmptyState }
