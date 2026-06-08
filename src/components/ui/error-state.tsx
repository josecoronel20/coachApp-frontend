import * as React from "react"
import { AlertTriangle } from "lucide-react"

import { cn } from "@/lib/utils"

type ErrorStateProps = React.ComponentProps<"div"> & {
  title?: string
  description: React.ReactNode
  action?: React.ReactNode
}

function ErrorState({
  title = "No pudimos cargar esto",
  description,
  action,
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      data-slot="error-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-app-2xl border border-danger/25 bg-danger/10 px-6 py-10 text-center",
        className
      )}
      {...props}
    >
      <div className="rounded-app-xl border border-danger/25 bg-danger/10 p-3 text-danger">
        <AlertTriangle className="size-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-text-primary">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export { ErrorState }
