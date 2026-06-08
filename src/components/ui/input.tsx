import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "file:text-foreground selection:bg-primary selection:text-primary-foreground flex w-full min-w-0 border text-base transition-[border-color,color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-purple-soft focus-visible:ring-[3px] focus-visible:ring-purple-soft/30 aria-invalid:border-danger aria-invalid:ring-danger/20 dark:aria-invalid:ring-danger/40",
  {
    variants: {
      variant: {
        default:
          "h-10 rounded-app-lg border-border-subtle bg-bg-surface-1 px-3 py-2 text-text-primary shadow-elevation-0",
        search:
          "h-11 rounded-app-full border-border-subtle bg-bg-base px-10 py-2 text-text-primary shadow-elevation-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Input({
  className,
  type,
  variant,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
