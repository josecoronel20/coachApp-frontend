import * as React from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "onChange" | "variant"
> & {
  /** Current search text. */
  value: string
  /** Called with the next text value when the user types. */
  onValueChange: (value: string) => void
}

function SearchInput({
  className,
  value,
  onValueChange,
  placeholder = "Buscar",
  ...props
}: SearchInputProps) {
  return (
    <label className={cn("relative block text-text-secondary", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-purple-soft" />
      <Input
        {...props}
        value={value}
        variant="search"
        placeholder={placeholder}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </label>
  )
}

export { SearchInput }
