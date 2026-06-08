import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type IconButtonProps = Omit<React.ComponentProps<typeof Button>, "children"> &
  VariantProps<typeof buttonVariants> & {
    /** Accessible label for icon-only actions. */
    label: string
    icon: React.ReactNode
  }

function IconButton({
  label,
  icon,
  className,
  variant = "ghost",
  size = "icon",
  ...props
}: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      title={label}
      variant={variant}
      size={size}
      className={cn("rounded-app-full", className)}
      {...props}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </Button>
  )
}

export { IconButton }
