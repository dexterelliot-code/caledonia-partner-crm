"use client"

import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { PriorityBadge } from "@/components/status-badges"
import { CompanyFormDialog } from "@/components/company-form-dialog"
import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/form-select"
import { useCrm } from "@/lib/store"
import { primaryContact, relativeTime } from "@/lib/helpers"
import { PIPELINE_STAGES, type Company, type PipelineStage } from "@/lib/types"
import { Plus, GripVertical } from "lucide-react"

const OPEN: PipelineStage[] = [
  "Research",
  "Draft ready",
  "Email sent",
  "Follow-up due",
  "Replied",
  "Meeting booked",
  "Proposal sent",
  "Negotiation",
]

function PipelineCard({ company }: { company: Company }) {
  const router = useRouter()
  const { setStage } = useCrm()
  const contact = primaryContact(company)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <button
          className="text-left text-sm font-semibold leading-tight hover:underline"
          onClick={() => router.push(`/companies/${company.id}`)}
        >
          {company.name}
        </button>
        <PriorityBadge priority={company.priority} />
      </div>
      <span className="text-xs text-muted-foreground">{company.country}</span>
      <span className="truncate text-xs text-muted-foreground">
        {contact ? contact.name : "No contact"}
      </span>
      <div className="mt-1 flex items-center justify-between gap-2 border-t border-border pt-2">
        <span className="text-[0.7rem] text-muted-foreground">
          {relativeTime(company.updatedAt)}
        </span>
        <FormSelect
          value={company.stage}
          onValueChange={(v) => setStage(company.id, v as PipelineStage)}
          options={PIPELINE_STAGES}
          className="h-7 w-auto min-w-0 gap-1 px-2 text-xs"
        />
      </div>
    </div>
  )
}

export default function PipelinePage() {
  const { companies } = useCrm()

  return (
    <>
      <PageHeader
        title="Pipeline"
        description="Track every overseas manufacturer through the representation pipeline."
        actions={
          <CompanyFormDialog
            trigger={
              <Button>
                <Plus data-icon="inline-start" />
                Add company
              </Button>
            }
          />
        }
      />
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4">
          {OPEN.map((stage) => {
            const stageCompanies = companies.filter((c) => c.stage === stage)
            return (
              <div key={stage} className="flex w-72 shrink-0 flex-col gap-3">
                <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="size-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium">{stage}</span>
                  </div>
                  <span className="rounded-full bg-card px-2 text-xs font-medium text-muted-foreground">
                    {stageCompanies.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {stageCompanies.map((company) => (
                    <PipelineCard key={company.id} company={company} />
                  ))}
                  {stageCompanies.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                      Empty
                    </div>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
