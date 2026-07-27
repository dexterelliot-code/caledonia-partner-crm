"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PIPELINE_STAGES } from "@/lib/types"
import { useCrm } from "@/lib/store"
import { cn } from "@/lib/utils"

export function PipelineOverview() {
  const { companies } = useCrm()
  const total = companies.length || 1

  const counts = PIPELINE_STAGES.map((stage) => ({
    stage,
    count: companies.filter((c) => c.stage === stage).length,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pipeline snapshot</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {counts.map(({ stage, count }) => (
          <Link
            key={stage}
            href="/pipeline"
            className="group flex items-center gap-3 rounded-md px-1 py-1 transition-colors hover:bg-accent/60"
          >
            <span className="w-32 shrink-0 text-sm text-muted-foreground group-hover:text-foreground">
              {stage}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full",
                  stage === "Won"
                    ? "bg-emerald-500"
                    : stage === "Lost"
                      ? "bg-rose-400"
                      : "bg-chart-3",
                )}
                style={{ width: `${(count / total) * 100}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-sm font-medium tabular-nums text-foreground">
              {count}
            </span>
          </Link>
        ))}
      </CardContent>
    </Card>
  )
}
