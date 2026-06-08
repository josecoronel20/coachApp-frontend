import * as React from "react"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

type LoadingStateProps = React.ComponentProps<"div"> & {
  title?: string
  description?: string
}

function LoadingState({
  title = "Cargando...",
  description,
  className,
  ...props
}: LoadingStateProps) {
  return (
    <div
      data-slot="loading-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-app-2xl border border-border-subtle bg-bg-surface-1 px-6 py-10 text-center",
        className
      )}
      {...props}
    >
      <div className="rounded-app-xl border border-purple-primary/20 bg-purple-primary/10 p-3 text-purple-soft">
        <Loader2 className="size-5 animate-spin" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-text-primary">
        {title}
      </h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
          {description}
        </p>
      ) : null}
    </div>
  )
}

export { LoadingState }
