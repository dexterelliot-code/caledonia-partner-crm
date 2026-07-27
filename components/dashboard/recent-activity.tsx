"use client"

import {
  Mail,
  MailOpen,
  CalendarCheck,
  FileText,
  StickyNote,
  GitBranch,
  BellRing,
  CheckCircle2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCrm } from "@/lib/store"
import { relativeTime } from "@/lib/helpers"
import type { ActivityType } from "@/lib/types"

const ICONS: Record<ActivityType, typeof Mail> = {
  email_sent: Mail,
  reply_received: MailOpen,
  meeting_booked: CalendarCheck,
  proposal_sent: FileText,
  note: StickyNote,
  stage_change: GitBranch,
  follow_up_scheduled: BellRing,
  follow_up_completed: CheckCircle2,
}

export function RecentActivity() {
  const { activities, getCompany } = useCrm()
  const recent = activities.slice(0, 8)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No activity yet.
          </p>
        ) : (
          <ol className="flex flex-col gap-4">
            {recent.map((a) => {
              const Icon = ICONS[a.type]
              const company = getCompany(a.companyId)
              return (
                <li key={a.id} className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <Icon className="size-4" />
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm text-foreground">{a.title}</span>
                    {company ? (
                      <span className="text-xs text-muted-foreground">
                        {company.name}
                      </span>
                    ) : null}
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(a.date)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
