import * as React from "react"

import { StatusBanner } from "@/components/ui/status-banner"

type SyncStatusVariant = "info" | "success" | "warning" | "danger" | "offline"

type SyncStatusProps = React.ComponentProps<"div"> & {
  variant?: SyncStatusVariant
  title?: string
  message: React.ReactNode
}

function SyncStatus({
  variant = "info",
  title,
  message,
  ...props
}: SyncStatusProps) {
  return (
    <StatusBanner
      variant={variant}
      title={title}
      message={message}
      {...props}
    />
  )
}

export { SyncStatus }
