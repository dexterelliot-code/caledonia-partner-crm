"use client"

import { Building2, Handshake, MailCheck, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useCrm } from "@/lib/store"
import { isOpen } from "@/lib/helpers"

export function StatCards() {
  const { companies, followUps } = useCrm()

  const active = companies.filter(isOpen).length
  const inConversation = companies.filter((c) =>
    ["Replied", "Meeting booked", "Proposal sent", "Negotiation"].includes(c.stage),
  ).length
  const won = companies.filter((c) => c.stage === "Won").length
  const pendingFollowUps = followUps.filter((f) => f.status === "pending").length

  const stats = [
    {
      label: "Active prospects",
      value: active,
      icon: Building2,
      hint: "Manufacturers in the open pipeline",
    },
    {
      label: "In conversation",
      value: inConversation,
      icon: MailCheck,
      hint: "Replied or further along",
    },
    {
      label: "Follow-ups due",
      value: pendingFollowUps,
      icon: Handshake,
      hint: "Actions awaiting you",
    },
    {
      label: "Partnerships won",
      value: won,
      icon: Trophy,
      hint: "Signed representation deals",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-start justify-between gap-4 p-5">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
              <span className="font-heading text-3xl font-semibold tabular-nums text-foreground">
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground">{stat.hint}</span>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <stat.icon className="size-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
