import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PipelineStage, Priority } from "@/lib/types"

const STAGE_STYLES: Record<PipelineStage, string> = {
  Research: "bg-muted text-muted-foreground",
  "Draft ready": "bg-accent text-accent-foreground",
  "Email sent": "bg-chart-4/25 text-primary",
  "Follow-up due": "bg-amber-100 text-amber-800",
  Replied: "bg-chart-3/20 text-primary",
  "Meeting booked": "bg-chart-2/20 text-primary",
  "Proposal sent": "bg-chart-2/25 text-primary",
  Negotiation: "bg-primary/15 text-primary",
  Won: "bg-emerald-100 text-emerald-800",
  Lost: "bg-rose-100 text-rose-800",
}

const PRIORITY_STYLES: Record<Priority, string> = {
  High: "bg-rose-100 text-rose-800",
  Medium: "bg-amber-100 text-amber-800",
  Low: "bg-muted text-muted-foreground",
}

export function StageBadge({
  stage,
  className,
}: {
  stage: PipelineStage
  className?: string
}) {
  return (
    <Badge
      variant="secondary"
      className={cn("border-transparent font-medium", STAGE_STYLES[stage], className)}
    >
      {stage}
    </Badge>
  )
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: Priority
  className?: string
}) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-transparent font-medium",
        PRIORITY_STYLES[priority],
        className,
      )}
    >
      {priority}
    </Badge>
  )
}
