"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { StageBadge, PriorityBadge } from "@/components/status-badges"
import { CompanyFormDialog } from "@/components/company-form-dialog"
import { FormSelect } from "@/components/form-select"
import { useCrm } from "@/lib/store"
import { formatDate } from "@/lib/helpers"
import { PIPELINE_STAGES, type Company } from "@/lib/types"
import { Globe, MapPin, Factory, Calendar, PencilLine, ExternalLink, Building2 } from "lucide-react"

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Globe
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    </div>
  )
}

export function CompanyOverview({ company }: { company: Company }) {
  const { setStage } = useCrm()
  const [editing, setEditing] = useState(false)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Company details</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <PencilLine data-icon="inline-start" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <InfoRow icon={Factory} label="Product category" value={company.productCategory} />
            <InfoRow icon={Building2} label="Country" value={company.country} />
            <InfoRow icon={MapPin} label="Market" value="Scotland / UK" />
            <InfoRow
              icon={Globe}
              label="Website"
              value={
                company.website ? (
                  <a
                    href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {company.website.replace(/^https?:\/\//, "")}
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <InfoRow icon={Calendar} label="Added" value={formatDate(company.createdAt)} />
            <InfoRow icon={Calendar} label="Last updated" value={formatDate(company.updatedAt)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market opportunity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {company.marketOpportunity || "No opportunity assessment recorded yet."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {company.notes || "No notes recorded yet."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">Current stage</span>
              <FormSelect
                value={company.stage}
                onValueChange={(v) => setStage(company.id, v as Company["stage"])}
                options={PIPELINE_STAGES}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Priority</span>
              <PriorityBadge priority={company.priority} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Stage</span>
              <StageBadge stage={company.stage} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Contacts</span>
              <span className="text-sm font-medium">{company.contacts.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <CompanyFormDialog open={editing} onOpenChange={setEditing} company={company} />
    </div>
  )
}
