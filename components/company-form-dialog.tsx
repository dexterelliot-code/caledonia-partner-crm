"use client"

import { useEffect, useState, type ReactNode } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { FormSelect } from "@/components/form-select"
import { useCrm } from "@/lib/store"
import {
  COUNTRIES,
  PIPELINE_STAGES,
  PRIORITIES,
  PRODUCT_CATEGORIES,
} from "@/lib/types"
import type { Company } from "@/lib/types"

interface FormState {
  name: string
  website: string
  country: string
  productCategory: string
  priority: string
  stage: string
  marketOpportunity: string
  notes: string
}

const EMPTY: FormState = {
  name: "",
  website: "",
  country: COUNTRIES[0],
  productCategory: PRODUCT_CATEGORIES[0],
  priority: "Medium",
  stage: "Research",
  marketOpportunity: "",
  notes: "",
}

export function CompanyFormDialog({
  company,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  company?: Company
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { addCompany, updateCompany } = useCrm()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [form, setForm] = useState<FormState>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setForm(company ? { ...company } : EMPTY)
      setErrors({})
    }
  }, [open, company])

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = "Company name is required"
    if (form.website && !/^https?:\/\/.+\..+/.test(form.website))
      next.website = "Enter a valid URL (including https://)"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    if (company) {
      updateCompany(company.id, {
        name: form.name.trim(),
        website: form.website.trim(),
        country: form.country,
        productCategory: form.productCategory,
        priority: form.priority as Company["priority"],
        stage: form.stage as Company["stage"],
        marketOpportunity: form.marketOpportunity.trim(),
        notes: form.notes.trim(),
      })
      toast.success("Company updated")
    } else {
      addCompany({
        name: form.name.trim(),
        website: form.website.trim(),
        country: form.country,
        productCategory: form.productCategory,
        priority: form.priority as Company["priority"],
        stage: form.stage as Company["stage"],
        marketOpportunity: form.marketOpportunity.trim(),
        notes: form.notes.trim(),
      })
      toast.success("Company added")
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{company ? "Edit company" : "Add company"}</DialogTitle>
          <DialogDescription>
            {company
              ? "Update the details for this manufacturer."
              : "Add a new overseas manufacturer to your prospect pipeline."}
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="name">Company name</FieldLabel>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Bergmann Präzisionstechnik GmbH"
              aria-invalid={!!errors.name}
            />
            {errors.name ? <FieldError>{errors.name}</FieldError> : null}
          </Field>

          <Field data-invalid={!!errors.website}>
            <FieldLabel htmlFor="website">Website</FieldLabel>
            <Input
              id="website"
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://example.com"
              aria-invalid={!!errors.website}
            />
            {errors.website ? <FieldError>{errors.website}</FieldError> : null}
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="country">Country</FieldLabel>
              <FormSelect
                id="country"
                value={form.country}
                onValueChange={(v) => set("country", v)}
                options={COUNTRIES}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="category">Product category</FieldLabel>
              <FormSelect
                id="category"
                value={form.productCategory}
                onValueChange={(v) => set("productCategory", v)}
                options={PRODUCT_CATEGORIES}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="priority">Priority</FieldLabel>
              <FormSelect
                id="priority"
                value={form.priority}
                onValueChange={(v) => set("priority", v)}
                options={PRIORITIES}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="stage">Pipeline stage</FieldLabel>
              <FormSelect
                id="stage"
                value={form.stage}
                onValueChange={(v) => set("stage", v)}
                options={PIPELINE_STAGES}
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="opportunity">Market opportunity</FieldLabel>
            <Textarea
              id="opportunity"
              value={form.marketOpportunity}
              onChange={(e) => set("marketOpportunity", e.target.value)}
              placeholder="Why is there an opportunity for this manufacturer in the Scottish market?"
              rows={4}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Internal notes, context, referral source…"
              rows={3}
            />
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={handleSubmit}>
            {company ? "Save changes" : "Add company"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
