"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Trash2, Globe } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StageBadge, PriorityBadge } from "@/components/status-badges"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CompanyOverview } from "@/components/company/company-overview"
import { CompanyContacts } from "@/components/company/company-contacts"
import { CompanyActivity } from "@/components/company/company-activity"
import { CompanyIntelligencePanel } from "@/components/company/company-intelligence"
import { OutreachComposer } from "@/components/outreach/outreach-composer"
import { ProposalComposer } from "@/components/proposals/proposal-composer"
import { FollowUpList } from "@/components/follow-up-list"
import { useCrm } from "@/lib/store"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export default function CompanyWorkspacePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { getCompany, deleteCompany, followUpsFor } = useCrm()
  const [tab, setTab] = useState("overview")

  const company = getCompany(params.id)

  if (!company) {
    return (
      <div className="flex flex-1 items-center justify-center p-10">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Globe />
            </EmptyMedia>
            <EmptyTitle>Company not found</EmptyTitle>
            <EmptyDescription>
              This prospect may have been removed.
            </EmptyDescription>
          </EmptyHeader>
          <Button render={<Link href="/companies">Back to companies</Link>} />
        </Empty>
      </div>
    )
  }

  const openFollowUps = followUpsFor(company.id).filter((f) => f.status === "pending")

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-4 border-b border-border bg-card px-6 py-5">
        <Link
          href="/companies"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All companies
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-balance">
              {company.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>{company.country}</span>
              <span aria-hidden>·</span>
              <span>{company.productCategory}</span>
              <StageBadge stage={company.stage} />
              <PriorityBadge priority={company.priority} />
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" size="sm">
                  <Trash2 data-icon="inline-start" />
                  Delete
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {company.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently removes the company, its contacts, activity and
                  proposals. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    deleteCompany(company.id)
                    toast.success("Company deleted")
                    router.push("/companies")
                  }}
                >
                  Delete company
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="intelligence">Intelligence</TabsTrigger>
            <TabsTrigger value="contacts">Contacts ({company.contacts.length})</TabsTrigger>
            <TabsTrigger value="outreach">Outreach</TabsTrigger>
            <TabsTrigger value="proposal">Proposal</TabsTrigger>
            <TabsTrigger value="followups">Follow-ups ({openFollowUps.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <CompanyOverview company={company} />
          </TabsContent>
          <TabsContent value="intelligence" className="mt-6">
            <CompanyIntelligencePanel company={company} />
          </TabsContent>
          <TabsContent value="contacts" className="mt-6">
            <CompanyContacts company={company} />
          </TabsContent>
          <TabsContent value="outreach" className="mt-6">
            <OutreachComposer company={company} />
          </TabsContent>
          <TabsContent value="proposal" className="mt-6">
            <ProposalComposer company={company} />
          </TabsContent>
          <TabsContent value="followups" className="mt-6">
            <FollowUpList
              followUps={followUpsFor(company.id)}
              emptyLabel="No follow-ups scheduled for this company."
            />
          </TabsContent>
          <TabsContent value="activity" className="mt-6">
            <CompanyActivity company={company} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
