"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormSelect } from "@/components/form-select"
import { Field, FieldLabel } from "@/components/ui/field"
import { OutreachComposer } from "@/components/outreach/outreach-composer"
import { StageBadge } from "@/components/status-badges"
import { useCrm } from "@/lib/store"
import { primaryContact } from "@/lib/helpers"
import { isOpen } from "@/lib/helpers"

function OutreachContent() {
  const { companies } = useCrm()
  const searchParams = useSearchParams()
  const initial = searchParams.get("company") ?? ""

  const selectable = companies.filter((c) => isOpen(c) && c.contacts.length > 0)
  const [companyId, setCompanyId] = useState(
    initial || selectable[0]?.id || "",
  )
  const company = companies.find((c) => c.id === companyId)

  const options = selectable.map((c) => ({ value: c.id, label: c.name }))

  return (
    <>
      <PageHeader
        title="Outreach"
        description="Generate tailored representation emails for each manufacturer, then log them to the pipeline."
      />
      <div className="grid flex-1 gap-6 p-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Select prospect</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="company">Company</FieldLabel>
                <FormSelect
                  id="company"
                  value={companyId}
                  onValueChange={setCompanyId}
                  options={options}
                  placeholder="Choose a company"
                />
              </Field>
              {company ? (
                <div className="flex flex-col gap-3 rounded-md border border-border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Stage</span>
                    <StageBadge stage={company.stage} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Primary contact</span>
                    <span className="font-medium">
                      {primaryContact(company)?.name ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{company.productCategory}</span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Compose email</CardTitle>
          </CardHeader>
          <CardContent>
            {company ? (
              <OutreachComposer company={company} />
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Select a company with at least one contact to compose outreach.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default function OutreachPage() {
  return (
    <Suspense fallback={null}>
      <OutreachContent />
    </Suspense>
  )
}
