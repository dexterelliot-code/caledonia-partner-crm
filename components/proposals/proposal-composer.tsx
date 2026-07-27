"use client"

import { useState } from "react"
import { Download, Save, FileText } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { FormSelect } from "@/components/form-select"
import { ProposalDocumentView } from "@/components/proposals/proposal-document-view"
import { useCrm } from "@/lib/store"
import { buildProposalDocument } from "@/lib/proposal-content"
import { proposalToHtml } from "@/lib/proposal-html"
import type { Company, Proposal } from "@/lib/types"

const MODELS = [
  "Commission-based sales agency",
  "Exclusive distribution",
  "Non-exclusive distribution",
  "Value-added reseller",
  "Manufacturer representative",
]

const VALIDITY = ["14 days", "30 days", "60 days", "90 days"]

export function ProposalComposer({ company }: { company: Company }) {
  const { addProposal, logActivity, setStage } = useCrm()

  const [territory, setTerritory] = useState("Scotland (United Kingdom)")
  const [commercialModel, setCommercialModel] = useState(MODELS[0])
  const [commercialTerms, setCommercialTerms] = useState(
    "10% commission on net sales, 24-month initial term, exclusive territory. Terms open to negotiation based on order volume.",
  )
  const [targetSectors, setTargetSectors] = useState(company.productCategory)
  const [validity, setValidity] = useState("30 days")

  const draft: Proposal = {
    id: "preview",
    companyId: company.id,
    companyName: company.name,
    territory,
    commercialModel,
    commercialTerms,
    targetSectors,
    validity,
    createdAt: new Date().toISOString(),
  }

  const doc = buildProposalDocument(draft, company)

  function exportPdf() {
    const win = window.open("", "_blank")
    if (!win) {
      toast.error("Please allow pop-ups to export the PDF")
      return
    }
    win.document.write(proposalToHtml(doc))
    win.document.close()
  }

  function save() {
    addProposal({
      companyId: company.id,
      companyName: company.name,
      territory,
      commercialModel,
      commercialTerms,
      targetSectors,
      validity,
    })
    logActivity({
      companyId: company.id,
      type: "proposal_sent",
      title: "Market representation proposal created",
      detail: `${commercialModel} · ${territory}`,
    })
    if (!["Won", "Lost", "Negotiation"].includes(company.stage)) {
      setStage(company.id, "Proposal sent")
    }
    toast.success("Proposal saved to the vault")
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,380px)_1fr]">
      <div className="flex flex-col gap-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="territory">Territory</FieldLabel>
            <Input
              id="territory"
              value={territory}
              onChange={(e) => setTerritory(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="model">Commercial model</FieldLabel>
            <FormSelect
              id="model"
              value={commercialModel}
              onValueChange={setCommercialModel}
              options={MODELS}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="sectors">Target sectors</FieldLabel>
            <Input
              id="sectors"
              value={targetSectors}
              onChange={(e) => setTargetSectors(e.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="validity">Proposal validity</FieldLabel>
            <FormSelect
              id="validity"
              value={validity}
              onValueChange={setValidity}
              options={VALIDITY}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="terms">Commercial terms</FieldLabel>
            <Textarea
              id="terms"
              value={commercialTerms}
              onChange={(e) => setCommercialTerms(e.target.value)}
              rows={4}
            />
          </Field>
        </FieldGroup>

        <div className="flex flex-wrap gap-2">
          <Button onClick={save}>
            <Save data-icon="inline-start" />
            Save proposal
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            <Download data-icon="inline-start" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FileText className="size-4" />
          Live preview
        </div>
        <ProposalDocumentView doc={doc} />
      </div>
    </div>
  )
}
