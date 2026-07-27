"use client"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export function FormSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select…",
  className,
  size = "default",
  ariaInvalid,
  id,
}: {
  value: string
  onValueChange: (value: string) => void
  options: readonly string[] | { value: string; label: string }[]
  placeholder?: string
  className?: string
  size?: "sm" | "default"
  ariaInvalid?: boolean
  id?: string
}) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  )
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as string)}>
      <SelectTrigger
        id={id}
        size={size}
        aria-invalid={ariaInvalid}
        className={cn("w-full", className)}
      >
        <SelectValue placeholder={placeholder}>
          {(val: string) =>
            normalized.find((o) => o.value === val)?.label ?? placeholder
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {normalized.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
