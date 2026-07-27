"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Download, Trash2, FileText, Building2 } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FormSelect } from "@/components/form-select"
import { Field, FieldLabel } from "@/components/ui/field"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { ProposalComposer } from "@/components/proposals/proposal-composer"
import { useCrm } from "@/lib/store"
import { buildProposalDocument } from "@/lib/proposal-content"
import { proposalToHtml } from "@/lib/proposal-html"
import { formatDate } from "@/lib/helpers"

function ProposalsContent() {
  const { companies, proposals, getCompany, deleteProposal } = useCrm()
  const searchParams = useSearchParams()
  const initial = searchParams.get("company") ?? ""

  const [tab, setTab] = useState(initial ? "generate" : "vault")
  const [companyId, setCompanyId] = useState(initial || companies[0]?.id || "")
  const company = getCompany(companyId)

  function exportProposal(proposalId: string) {
    const proposal = proposals.find((p) => p.id === proposalId)
    if (!proposal) return
    const c = getCompany(proposal.companyId)
    if (!c) return
    const win = window.open("", "_blank")
    if (!win) {
      toast.error("Please allow pop-ups to export the PDF")
      return
    }
    win.document.write(proposalToHtml(buildProposalDocument(proposal, c)))
    win.document.close()
  }

  return (
    <>
      <PageHeader
        title="Proposals"
        description="Build and store market representation proposals for your prospects."
      />
      <div className="p-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="vault">Vault ({proposals.length})</TabsTrigger>
            <TabsTrigger value="generate">Generate</TabsTrigger>
          </TabsList>

          <TabsContent value="vault" className="mt-6">
            {proposals.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileText />
                  </EmptyMedia>
                  <EmptyTitle>No proposals yet</EmptyTitle>
                  <EmptyDescription>
                    Generate your first market representation proposal.
                  </EmptyDescription>
                </EmptyHeader>
                <Button onClick={() => setTab("generate")}>Generate a proposal</Button>
              </Empty>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {proposals.map((p) => (
                  <li key={p.id}>
                    <Card className="h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">{p.companyName}</CardTitle>
                          <Badge variant="secondary">{p.validity}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-3 text-sm">
                        <div className="flex flex-col gap-1 text-muted-foreground">
                          <span>{p.commercialModel}</span>
                          <span>{p.territory}</span>
                          <span className="text-xs">Created {formatDate(p.createdAt)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => exportProposal(p.id)}>
                            <Download data-icon="inline-start" />
                            Export
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            render={<Link href={`/companies/${p.companyId}`}>
                              <Building2 data-icon="inline-start" />
                              Company
                            </Link>}
                          />
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Delete proposal"
                            onClick={() => {
                              deleteProposal(p.id)
                              toast.success("Proposal deleted")
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="generate" className="mt-6 flex flex-col gap-6">
            <div className="max-w-sm">
              <Field>
                <FieldLabel htmlFor="proposal-company">Company</FieldLabel>
                <FormSelect
                  id="proposal-company"
                  value={companyId}
                  onValueChange={setCompanyId}
                  options={companies.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="Choose a company"
                />
              </Field>
            </div>
            {company ? (
              <ProposalComposer key={company.id} company={company} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Add a company to generate a proposal.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export default function ProposalsPage() {
  return (
    <Suspense fallback={null}>
      <ProposalsContent />
    </Suspense>
  )
}
