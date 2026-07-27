"use client"

import { useEffect, useState, type ReactNode } from "react"
import { toast } from "sonner"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { useCrm } from "@/lib/store"
import type { Contact } from "@/lib/types"

interface ContactForm {
  name: string
  jobTitle: string
  email: string
  linkedinUrl: string
  notes: string
  isPrimary: boolean
}

const EMPTY: ContactForm = {
  name: "",
  jobTitle: "",
  email: "",
  linkedinUrl: "",
  notes: "",
  isPrimary: false,
}

export function ContactDialog({
  companyId,
  contact,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: {
  companyId: string
  contact?: Contact
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const { addContact, updateContact } = useCrm()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const [form, setForm] = useState<ContactForm>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setForm(
        contact
          ? {
              name: contact.name,
              jobTitle: contact.jobTitle,
              email: contact.email,
              linkedinUrl: contact.linkedinUrl ?? "",
              notes: contact.notes ?? "",
              isPrimary: contact.isPrimary,
            }
          : EMPTY,
      )
      setErrors({})
    }
  }, [open, contact])

  const set = <K extends keyof ContactForm>(key: K, value: ContactForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  function validate(): boolean {
    const next: Record<string, string> = {}
    if (!form.name.trim()) next.name = "Name is required"
    if (!form.email.trim()) next.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const payload = {
      name: form.name.trim(),
      jobTitle: form.jobTitle.trim(),
      email: form.email.trim(),
      linkedinUrl: form.linkedinUrl.trim() || undefined,
      notes: form.notes.trim() || undefined,
      isPrimary: form.isPrimary,
    }
    if (contact) {
      updateContact(companyId, contact.id, payload)
      toast.success("Contact updated")
    } else {
      addContact(companyId, payload)
      toast.success("Contact added")
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "Add contact"}</DialogTitle>
        </DialogHeader>

        <FieldGroup>
          <Field data-invalid={!!errors.name}>
            <FieldLabel htmlFor="c-name">Full name</FieldLabel>
            <Input
              id="c-name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors.name}
            />
            {errors.name ? <FieldError>{errors.name}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="c-title">Job title</FieldLabel>
            <Input
              id="c-title"
              value={form.jobTitle}
              onChange={(e) => set("jobTitle", e.target.value)}
              placeholder="e.g. Export Manager"
            />
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="c-email">Email</FieldLabel>
            <Input
              id="c-email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              aria-invalid={!!errors.email}
            />
            {errors.email ? <FieldError>{errors.email}</FieldError> : null}
          </Field>

          <Field>
            <FieldLabel htmlFor="c-linkedin">LinkedIn URL</FieldLabel>
            <Input
              id="c-linkedin"
              value={form.linkedinUrl}
              onChange={(e) => set("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/…"
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="c-notes">Notes</FieldLabel>
            <Textarea
              id="c-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
            />
          </Field>

          <Field orientation="horizontal">
            <Switch
              id="c-primary"
              checked={form.isPrimary}
              onCheckedChange={(v) => set("isPrimary", v)}
            />
            <FieldLabel htmlFor="c-primary">Primary contact</FieldLabel>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={handleSubmit}>
            {contact ? "Save contact" : "Add contact"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
