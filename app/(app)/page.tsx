"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCards } from "@/components/dashboard/stat-cards"
import { PriorityProspects } from "@/components/dashboard/priority-prospects"
import { PipelineOverview } from "@/components/dashboard/pipeline-overview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { FollowUpList } from "@/components/follow-up-list"
import { useCrm } from "@/lib/store"
import { dueLabel } from "@/lib/helpers"

export default function DashboardPage() {
  const { followUps } = useCrm()

  const pending = followUps
    .filter((f) => f.status === "pending")
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))

  const dueNow = pending.filter((f) => {
    const { overdue, today } = dueLabel(f.dueDate)
    return overdue || today
  })

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your representation pipeline across overseas technical manufacturers targeting the Scottish market."
        actions={
          <Button render={<Link href="/companies?new=1" />}>
            <Plus data-icon="inline-start" />
            Add company
          </Button>
        }
      />

      <div className="flex flex-col gap-6 p-6">
        <StatCards />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <PriorityProspects />
            <PipelineOverview />
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Follow-ups due</CardTitle>
              </CardHeader>
              <CardContent>
                <FollowUpList
                  followUps={dueNow.length > 0 ? dueNow : pending.slice(0, 4)}
                  emptyLabel="You're all caught up."
                />
              </CardContent>
            </Card>
            <RecentActivity />
          </div>
        </div>
      </div>
    </>
  )
}
