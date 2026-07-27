"use client"

import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PriorityBadge, StageBadge } from "@/components/status-badges"
import { primaryContact, relativeTime } from "@/lib/helpers"
import type { Company } from "@/lib/types"

export function CompaniesTable({ companies }: { companies: Company[] }) {
  const router = useRouter()

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Primary contact</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-right">Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => {
            const contact = primaryContact(company)
            return (
              <TableRow
                key={company.id}
                className="cursor-pointer"
                onClick={() => router.push(`/companies/${company.id}`)}
              >
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-foreground">
                      {company.name}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {company.website.replace(/^https?:\/\//, "")}
                      <ExternalLink className="size-3" />
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {company.country}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {company.productCategory}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {contact?.name ?? "—"}
                </TableCell>
                <TableCell>
                  <PriorityBadge priority={company.priority} />
                </TableCell>
                <TableCell>
                  <StageBadge stage={company.stage} />
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {relativeTime(company.updatedAt)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
