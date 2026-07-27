"use client"

import { useMemo, useState } from "react"
import { isPast, isToday } from "date-fns"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { FollowUpList } from "@/components/follow-up-list"
import { useCrm } from "@/lib/store"
import type { FollowUp } from "@/lib/types"

type Filter = "all" | "overdue" | "today" | "upcoming" | "completed"

export default function FollowUpsPage() {
  const { followUps } = useCrm()
  const [filter, setFilter] = useState<Filter>("all")

  const pending = followUps.filter((f) => f.status === "pending")

  const counts = useMemo(() => {
    const overdue = pending.filter(
      (f) => isPast(new Date(f.dueDate)) && !isToday(new Date(f.dueDate)),
    ).length
    const today = pending.filter((f) => isToday(new Date(f.dueDate))).length
    const upcoming = pending.filter(
      (f) => !isPast(new Date(f.dueDate)) && !isToday(new Date(f.dueDate)),
    ).length
    return { overdue, today, upcoming, completed: followUps.length - pending.length }
  }, [pending, followUps])

  const filtered: FollowUp[] = useMemo(() => {
    const byDue = [...followUps].sort(
      (a, b) => +new Date(a.dueDate) - +new Date(b.dueDate),
    )
    switch (filter) {
      case "overdue":
        return byDue.filter(
          (f) =>
            f.status === "pending" &&
            isPast(new Date(f.dueDate)) &&
            !isToday(new Date(f.dueDate)),
        )
      case "today":
        return byDue.filter(
          (f) => f.status === "pending" && isToday(new Date(f.dueDate)),
        )
      case "upcoming":
        return byDue.filter(
          (f) =>
            f.status === "pending" &&
            !isPast(new Date(f.dueDate)) &&
            !isToday(new Date(f.dueDate)),
        )
      case "completed":
        return byDue.filter((f) => f.status === "completed")
      default:
        return byDue.filter((f) => f.status === "pending")
    }
  }, [followUps, filter])

  return (
    <>
      <PageHeader
        title="Follow-ups"
        description="Stay on top of every scheduled touchpoint so no prospect goes cold."
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatMini label="Overdue" value={counts.overdue} tone="rose" />
          <StatMini label="Due today" value={counts.today} tone="amber" />
          <StatMini label="Upcoming" value={counts.upcoming} tone="muted" />
          <StatMini label="Completed" value={counts.completed} tone="emerald" />
        </div>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <CardTitle>Queue</CardTitle>
            <ToggleGroup
              value={[filter]}
              onValueChange={(v) => v[0] && setFilter(v[0] as Filter)}
              className="flex-wrap"
            >
              <ToggleGroupItem value="all">Pending</ToggleGroupItem>
              <ToggleGroupItem value="overdue">Overdue</ToggleGroupItem>
              <ToggleGroupItem value="today">Today</ToggleGroupItem>
              <ToggleGroupItem value="upcoming">Upcoming</ToggleGroupItem>
              <ToggleGroupItem value="completed">Completed</ToggleGroupItem>
            </ToggleGroup>
          </CardHeader>
          <CardContent>
            <FollowUpList followUps={filtered} emptyLabel="Nothing here. You're all caught up." />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function StatMini({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "rose" | "amber" | "muted" | "emerald"
}) {
  const toneClass = {
    rose: "text-rose-600",
    amber: "text-amber-600",
    muted: "text-foreground",
    emerald: "text-emerald-600",
  }[tone]
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-heading text-2xl font-semibold ${toneClass}`}>{value}</span>
    </div>
  )
}
