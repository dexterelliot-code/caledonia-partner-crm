"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StageBadge } from "@/components/status-badges"
import { useCrm } from "@/lib/store"
import { isOpen, primaryContact, relativeTime } from "@/lib/helpers"

export function PriorityProspects() {
  const { companies } = useCrm()

  const prospects = companies
    .filter((c) => isOpen(c) && c.priority === "High")
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 5)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>High-priority prospects</CardTitle>
        <Button variant="ghost" size="sm" render={<Link href="/companies" />}>
          View all
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {prospects.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No high-priority prospects right now.
          </p>
        ) : (
          prospects.map((company) => {
            const contact = primaryContact(company)
            return (
              <Link
                key={company.id}
                href={`/companies/${company.id}`}
                className="flex items-center justify-between gap-4 rounded-md px-2 py-3 transition-colors hover:bg-accent/60"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground">
                    {company.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {company.country} · {company.productCategory}
                    {contact ? ` · ${contact.name}` : ""}
                  </span>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StageBadge stage={company.stage} />
                  <span className="text-xs text-muted-foreground">
                    {relativeTime(company.updatedAt)}
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
