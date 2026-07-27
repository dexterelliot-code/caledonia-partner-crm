"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Progress({ value = 0, className, ...props }: React.ComponentProps<"div"> & { value?: number }) {
  const safeValue = Math.max(0, Math.min(100, value))
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)} {...props}>
      <div className="h-full bg-primary transition-all" style={{ width: `${safeValue}%` }} />
    </div>
  )
}

export { Progress }
