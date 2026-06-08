import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertTriangle, CheckCircle2, Info, WifiOff, XCircle } from "lucide-react"

import { cn } from "@/lib/utils"

const statusBannerVariants = cva(
  "flex items-start gap-3 rounded-app-xl border px-4 py-3 text-sm leading-6",
  {
    variants: {
      variant: {
        info: "border-info/25 bg-info/10 text-text-primary",
        success: "border-success/25 bg-success/10 text-text-primary",
        warning: "border-warning/25 bg-warning/10 text-text-primary",
        danger: "border-danger/25 bg-danger/10 text-text-primary",
        offline: "border-warning/25 bg-warning/10 text-text-primary",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

const iconByVariant = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  offline: WifiOff,
}

const iconClassByVariant = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  offline: "text-warning",
}

type StatusBannerProps = React.ComponentProps<"div"> &
  VariantProps<typeof statusBannerVariants> & {
    title?: string
    message: React.ReactNode
    icon?: React.ReactNode
  }

function StatusBanner({
  className,
  variant = "info",
  title,
  message,
  icon,
  ...props
}: StatusBannerProps) {
  const Icon = iconByVariant[variant ?? "info"]

  return (
    <div
      data-slot="status-banner"
      className={cn(statusBannerVariants({ variant }), className)}
      {...props}
    >
      <span
        className={cn(
          "mt-0.5 shrink-0",
          iconClassByVariant[variant ?? "info"]
        )}
      >
        {icon ?? <Icon className="size-4" />}
      </span>
      <span>
        {title ? (
          <span className="block font-semibold text-text-primary">{title}</span>
        ) : null}
        <span className="text-text-secondary">{message}</span>
      </span>
    </div>
  )
}

export { StatusBanner, statusBannerVariants }
