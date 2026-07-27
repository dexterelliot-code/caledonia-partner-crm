"use client"

import Link from "next/link"
import { Check, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCrm } from "@/lib/store"
import { dueLabel } from "@/lib/helpers"
import type { FollowUp } from "@/lib/types"

export function FollowUpList({
  followUps,
  emptyLabel = "No follow-ups.",
}: {
  followUps: FollowUp[]
  emptyLabel?: string
}) {
  const { getCompany, completeFollowUp, deleteFollowUp } = useCrm()

  if (followUps.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">{emptyLabel}</p>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {followUps.map((f) => {
        const company = getCompany(f.companyId)
        const { label, overdue, today } = dueLabel(f.dueDate)
        return (
          <li
            key={f.id}
            className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2.5"
          >
            <div className="flex min-w-0 flex-col gap-0.5">
              <Link
                href={company ? `/companies/${company.id}` : "#"}
                className="truncate text-sm font-medium text-foreground hover:underline"
              >
                {company?.name ?? "Unknown company"}
              </Link>
              <span className="truncate text-xs text-muted-foreground">
                {f.reason}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  overdue
                    ? "text-rose-600"
                    : today
                      ? "text-amber-600"
                      : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Mark complete"
                onClick={() => {
                  completeFollowUp(f.id)
                  toast.success("Follow-up completed")
                }}
              >
                <Check />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Dismiss follow-up"
                onClick={() => {
                  deleteFollowUp(f.id)
                  toast("Follow-up removed")
                }}
              >
                <X />
              </Button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
