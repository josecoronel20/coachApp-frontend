import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-app-full border px-2.5 py-1 text-xs font-semibold transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-purple-primary/25 bg-purple-primary/15 text-purple-soft [a&]:hover:bg-purple-primary/25",
        purple:
          "border-purple-primary/25 bg-purple-primary/15 text-purple-soft [a&]:hover:bg-purple-primary/25",
        secondary:
          "border-border-subtle bg-bg-surface-2 text-text-secondary [a&]:hover:bg-bg-surface-3",
        neutral:
          "border-border-subtle bg-bg-surface-2 text-text-secondary [a&]:hover:bg-bg-surface-3",
        destructive:
          "border-danger/25 bg-danger/10 text-danger [a&]:hover:bg-danger/15 focus-visible:ring-danger/25",
        danger:
          "border-danger/25 bg-danger/10 text-danger [a&]:hover:bg-danger/15 focus-visible:ring-danger/25",
        success:
          "border-success/25 bg-success/10 text-success [a&]:hover:bg-success/15",
        warning:
          "border-warning/25 bg-warning/10 text-warning [a&]:hover:bg-warning/15",
        outline:
          "border-border-subtle text-text-secondary [a&]:hover:bg-bg-surface-2 [a&]:hover:text-text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
