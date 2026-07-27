"use client"

import { Suspense, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Plus, Search, Building2 } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { DialogTrigger } from "@/components/ui/dialog"
import { CompaniesTable } from "@/components/companies/companies-table"
import { CompanyFormDialog } from "@/components/company-form-dialog"
import { FormSelect } from "@/components/form-select"
import { useCrm } from "@/lib/store"
import {
  COUNTRIES,
  PIPELINE_STAGES,
  PRIORITIES,
  PRODUCT_CATEGORIES,
} from "@/lib/types"

function CompaniesContent() {
  const { companies } = useCrm()
  const searchParams = useSearchParams()
  const [addOpen, setAddOpen] = useState(searchParams.get("new") === "1")

  const [query, setQuery] = useState("")
  const [country, setCountry] = useState("all")
  const [category, setCategory] = useState("all")
  const [priority, setPriority] = useState("all")
  const [stage, setStage] = useState("all")

  const filtered = useMemo(() => {
    return companies
      .filter((c) => {
        const q = query.trim().toLowerCase()
        const matchesQuery =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.productCategory.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.contacts.some((ct) => ct.name.toLowerCase().includes(q))
        return (
          matchesQuery &&
          (country === "all" || c.country === country) &&
          (category === "all" || c.productCategory === category) &&
          (priority === "all" || c.priority === priority) &&
          (stage === "all" || c.stage === stage)
        )
      })
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
  }, [companies, query, country, category, priority, stage])

  return (
    <>
      <PageHeader
        title="Companies"
        description="Every overseas manufacturer you are evaluating for Scottish representation or distribution."
        actions={
          <CompanyFormDialog
            open={addOpen}
            onOpenChange={setAddOpen}
            trigger={
              <DialogTrigger
                render={
                  <Button>
                    <Plus data-icon="inline-start" />
                    Add company
                  </Button>
                }
              />
            }
          />
        }
      />

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies, contacts, categories…"
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <FormSelect
              value={country}
              onValueChange={setCountry}
              options={[{ value: "all", label: "All countries" }, ...COUNTRIES.map((c) => ({ value: c, label: c }))]}
            />
            <FormSelect
              value={category}
              onValueChange={setCategory}
              options={[{ value: "all", label: "All categories" }, ...PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))]}
            />
            <FormSelect
              value={priority}
              onValueChange={setPriority}
              options={[{ value: "all", label: "All priorities" }, ...PRIORITIES.map((c) => ({ value: c, label: c }))]}
            />
            <FormSelect
              value={stage}
              onValueChange={setStage}
              options={[{ value: "all", label: "All stages" }, ...PIPELINE_STAGES.map((c) => ({ value: c, label: c }))]}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {companies.length} companies
        </p>

        {filtered.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Building2 />
              </EmptyMedia>
              <EmptyTitle>No companies found</EmptyTitle>
              <EmptyDescription>
                Try adjusting your search or filters, or add a new company.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <CompaniesTable companies={filtered} />
        )}
      </div>
    </>
  )
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={null}>
      <CompaniesContent />
    </Suspense>
  )
}
