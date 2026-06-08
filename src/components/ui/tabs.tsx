import * as React from "react"

import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="tabs" className={cn("space-y-4", className)} {...props} />
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "inline-flex rounded-app-full border border-border-subtle bg-bg-surface-1 p-1",
        className
      )}
      {...props}
    />
  )
}

type TabsTriggerProps = React.ComponentProps<"button"> & {
  active?: boolean
}

function TabsTrigger({
  className,
  active = false,
  type = "button",
  ...props
}: TabsTriggerProps) {
  return (
    <button
      data-slot="tabs-trigger"
      data-active={active}
      type={type}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-app-full px-4 text-sm font-semibold transition outline-none focus-visible:ring-[3px] focus-visible:ring-purple-soft/30",
        active
          ? "bg-purple-primary text-white shadow-purple-glow"
          : "text-text-secondary hover:bg-bg-surface-2 hover:text-text-primary",
        className
      )}
      {...props}
    />
  )
}

function TabsPanel({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="tabs-panel" className={cn(className)} {...props} />
}

export { Tabs, TabsList, TabsPanel, TabsTrigger }
