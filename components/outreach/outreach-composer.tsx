"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Copy, Send, Sparkles, CalendarPlus, XCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"
import { FormSelect } from "@/components/form-select"
import { useCrm } from "@/lib/store"
import { EMAIL_TEMPLATES, type EmailTemplateKey } from "@/lib/types"
import { generateEmail } from "@/lib/email-templates"
import { effectiveEmailValidity, suggestEmailAlternatives } from "@/lib/email-validation"
import type { Company } from "@/lib/types"

export function OutreachComposer({
  company,
  defaultContactId,
}: {
  company: Company
  defaultContactId?: string
}) {
  const { logActivity, setStage, addFollowUp, logEmail, settings, updateContact } = useCrm()

  const [template, setTemplate] = useState<EmailTemplateKey>(EMAIL_TEMPLATES[0])
  const [sending, setSending] = useState(false)
  const [contactId, setContactId] = useState(
    defaultContactId ?? company.contacts.find((c) => c.isPrimary)?.id ?? company.contacts[0]?.id ?? "",
  )
  const contact = company.contacts.find((c) => c.id === contactId)

  const generated = useMemo(
    () => generateEmail(template, company, contact, settings),
    [template, company, contact, settings],
  )

  const emailValidity = effectiveEmailValidity(contact)
  const alternatives = contact ? suggestEmailAlternatives(contact).slice(0, 3) : []

  const [subject, setSubject] = useState(generated.subject)
  const [body, setBody] = useState(generated.body)

  useEffect(() => {
    setSubject(generated.subject)
    setBody(generated.body)
  }, [generated])

  const contactOptions = company.contacts.map((c) => ({
    value: c.id,
    label: `${c.name}${c.isPrimary ? " (primary)" : ""}`,
  }))

  function copy() {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`)
    toast.success("Email copied to clipboard")
  }

  async function sendWithMicrosoft() {
    if (!contact?.email || emailValidity === "invalid") {
      toast.error("This recipient address cannot be used", { description: "Update or verify the contact before sending." })
      return
    }
    setSending(true)
    try {
      const response = await fetch("/api/microsoft/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: contact.email, subject, body }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || "Microsoft 365 could not send the email")
      recordSentEmail()
      toast.success("Email sent through Microsoft 365", {
        description: result.sender ? `Sent from ${result.sender}` : "Saved to Outlook Sent Items.",
      })
    } catch (error) {
      toast.error("Email was not sent", {
        description: error instanceof Error ? error.message : "Connect Microsoft 365 in Settings and try again.",
      })
    } finally {
      setSending(false)
    }
  }

  function recordSentEmail() {
    if (emailValidity === "invalid") {
      toast.error("Cannot mark as sent", { description: "This recipient address is invalid." })
      return
    }
    logEmail({
      companyId: company.id,
      contactId: contact?.id,
      template,
      subject,
      body,
      recipient: contact?.email ?? "",
      deliveryStatus: "sent",
    })
    logActivity({
      companyId: company.id,
      type: "email_sent",
      title: `${template} sent`,
      detail: contact ? `To ${contact.name} — "${subject}"` : subject,
    })
    if (["Research", "Draft ready"].includes(company.stage)) {
      setStage(company.id, "Email sent")
    }
    const days = settings.followUpDays > 0 ? settings.followUpDays : 5
    addFollowUp({
      companyId: company.id,
      contactId: contact?.id,
      dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
      reason: `Follow up on "${template}"`,
    })

  }

  if (company.contacts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Add a contact to this company before generating outreach.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="template">Template</FieldLabel>
          <FormSelect
            id="template"
            value={template}
            onValueChange={(v) => setTemplate(v as EmailTemplateKey)}
            options={EMAIL_TEMPLATES as unknown as string[]}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="contact">Recipient</FieldLabel>
          <FormSelect
            id="contact"
            value={contactId}
            onValueChange={setContactId}
            options={contactOptions}
          />
        </Field>
      </div>

      <div className="flex items-center gap-2 rounded-md bg-accent/50 px-3 py-2 text-xs text-muted-foreground">
        <Sparkles className="size-3.5 text-primary" />
        Draft generated from the {company.name} profile. Edit freely before sending.
      </div>


      {contact ? (
        <div className="rounded-md border border-border p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {emailValidity === "invalid" ? (
                <XCircle className="size-4 text-destructive" />
              ) : emailValidity === "valid" ? (
                <CheckCircle2 className="size-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="size-4 text-amber-500" />
              )}
              <span className="font-medium">{contact.email}</span>
              <Badge variant={emailValidity === "invalid" ? "destructive" : "secondary"}>
                {emailValidity === "invalid" ? "Invalid / bounced" : emailValidity === "valid" ? "Verified" : "Unverified"}
              </Badge>
            </div>
            <div className="flex gap-2">
              {emailValidity !== "valid" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateContact(company.id, contact.id, { emailValidity: "valid", emailLastCheckedAt: new Date().toISOString() })
                    toast.success("Address marked as verified")
                  }}
                >
                  Mark verified
                </Button>
              ) : null}
              {emailValidity !== "invalid" ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    updateContact(company.id, contact.id, { emailValidity: "invalid", emailLastCheckedAt: new Date().toISOString() })
                    logActivity({
                      companyId: company.id,
                      type: "note",
                      title: "Email address bounced",
                      detail: `${contact.email} marked invalid (for example, after a 550 bounce).`,
                    })
                    toast.success("Address marked as bounced")
                  }}
                >
                  Mark bounced
                </Button>
              ) : null}
            </div>
          </div>
          {emailValidity === "invalid" && alternatives.length ? (
            <div className="mt-3 text-xs text-muted-foreground">
              Possible formats to verify: {alternatives.join(", ")}
            </div>
          ) : null}
        </div>
      ) : null}

      <Field>
        <FieldLabel htmlFor="subject">Subject</FieldLabel>
        <Input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="body">Message</FieldLabel>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={16}
          className="font-mono text-[0.8rem] leading-relaxed"
        />
      </Field>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={sendWithMicrosoft} disabled={sending}>
          <Send data-icon="inline-start" />
          {sending ? "Sending..." : "Send with Microsoft 365"}
        </Button>
        <Button variant="outline" onClick={copy}>
          <Copy data-icon="inline-start" />
          Copy
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            addFollowUp({
              companyId: company.id,
              contactId: contact?.id,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              reason: "Manual follow-up reminder",
            })
            toast.success("Follow-up scheduled in 7 days")
          }}
        >
          <CalendarPlus data-icon="inline-start" />
          Schedule follow-up
        </Button>
      </div>
    </div>
  )
}
