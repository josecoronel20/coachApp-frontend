import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-app-lg text-sm font-semibold transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        primary:
          "bg-purple-primary text-white shadow-purple-glow hover:bg-purple-bright",
        default:
          "bg-purple-primary text-white shadow-purple-glow hover:bg-purple-bright",
        destructive:
          "bg-danger text-white shadow-elevation-1 hover:bg-danger/85 focus-visible:ring-danger/25",
        danger:
          "bg-danger text-white shadow-elevation-1 hover:bg-danger/85 focus-visible:ring-danger/25",
        outline:
          "border border-border-subtle bg-bg-surface-1 text-text-primary shadow-elevation-0 hover:border-border-strong hover:bg-bg-surface-2",
        secondary:
          "border border-border-subtle bg-bg-surface-2 text-text-primary shadow-elevation-0 hover:bg-bg-surface-3",
        ghost:
          "text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary",
        link: "text-purple-soft underline-offset-4 hover:text-text-primary hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 gap-1.5 rounded-app-md px-3 has-[>svg]:px-2.5",
        lg: "h-11 rounded-app-xl px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
