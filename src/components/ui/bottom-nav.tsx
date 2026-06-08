import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"

type BottomNavItem = {
  href: string
  label: string
  icon: React.ReactNode
  active?: boolean
}

type BottomNavProps = React.ComponentProps<"nav"> & {
  items: BottomNavItem[]
}

function BottomNav({ items, className, ...props }: BottomNavProps) {
  return (
    <nav
      data-slot="bottom-nav"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-20 border-t border-border-subtle bg-bg-base/90 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 text-text-primary backdrop-blur-xl",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-md gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? "page" : undefined}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-app-xl px-3 py-2 text-sm font-semibold transition",
              item.active
                ? "bg-purple-primary/15 text-purple-soft"
                : "text-text-secondary hover:bg-bg-surface-1 hover:text-text-primary"
            )}
          >
            <span className="[&_svg]:size-4">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export { BottomNav }
export type { BottomNavItem }
