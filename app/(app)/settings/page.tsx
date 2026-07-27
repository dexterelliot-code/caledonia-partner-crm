"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { EMAIL_TEMPLATES, PIPELINE_STAGES } from "@/lib/types"
import { useCrm } from "@/lib/store"

export default function SettingsPage() {
  const { settings, updateSettings } = useCrm()
  const [microsoft, setMicrosoft] = useState<{ connected: boolean; email?: string | null; loading: boolean }>({ connected: false, loading: true })
  const [saving, setSaving] = useState(false)
  const [firm, setFirm] = useState({
    company: settings.company,
    location: settings.location,
    sender: settings.sender,
    title: settings.title,
    followUpDays: String(settings.followUpDays),
  })

  useEffect(() => {
    setFirm({
      company: settings.company,
      location: settings.location,
      sender: settings.sender,
      title: settings.title,
      followUpDays: String(settings.followUpDays),
    })
  }, [settings])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get("microsoft")
    if (status === "connected") toast.success("Microsoft 365 connected")
    if (status === "error") toast.error("Microsoft 365 connection failed", { description: params.get("message") || undefined })
    if (status) window.history.replaceState({}, "", window.location.pathname)
  }, [])

  useEffect(() => {
    fetch("/api/microsoft/status", { cache: "no-store" })
      .then(async (response) => ({ response, data: await response.json().catch(() => ({})) }))
      .then(({ response, data }) => setMicrosoft({ connected: response.ok && Boolean(data.connected), email: data.email, loading: false }))
      .catch(() => setMicrosoft({ connected: false, loading: false }))
  }, [])

  async function disconnectMicrosoft() {
    const response = await fetch("/api/auth/microsoft/disconnect", { method: "POST" })
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      toast.error("Could not disconnect Microsoft 365", { description: data.error })
      return
    }
    setMicrosoft({ connected: false, loading: false })
    toast.success("Microsoft 365 disconnected")
  }

  const set = (key: keyof typeof firm, value: string) =>
    setFirm((prev) => ({ ...prev, [key]: value }))

  async function handleSave() {
    setSaving(true)
    const days = Number.parseInt(firm.followUpDays, 10)
    const result = await updateSettings({
      company: firm.company,
      location: firm.location,
      sender: firm.sender,
      title: firm.title,
      followUpDays: Number.isFinite(days) && days > 0 ? days : 5,
    })
    setSaving(false)
    if (result?.error) {
      toast.error("Could not save settings", { description: result.error })
    } else {
      toast.success("Settings saved")
    }
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your firm profile, outreach defaults and workspace preferences."
      />
      <div className="grid max-w-4xl gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Firm profile</CardTitle>
            <CardDescription>
              Used across generated outreach emails and proposals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="company">Company name</FieldLabel>
                  <Input
                    id="company"
                    value={firm.company}
                    onChange={(e) => set("company", e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="location">Location</FieldLabel>
                  <Input
                    id="location"
                    value={firm.location}
                    onChange={(e) => set("location", e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="sender">Sender name</FieldLabel>
                  <Input
                    id="sender"
                    value={firm.sender}
                    onChange={(e) => set("sender", e.target.value)}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="title">Sender title</FieldLabel>
                  <Input
                    id="title"
                    value={firm.title}
                    onChange={(e) => set("title", e.target.value)}
                  />
                </Field>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Microsoft 365 email</CardTitle>
            <CardDescription>
              Send outreach from your Caledonia Technical Partners Outlook mailbox and save messages to Sent Items.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-medium">
                {microsoft.loading ? "Checking connection..." : microsoft.connected ? "Connected" : "Not connected"}
              </div>
              <div className="text-sm text-muted-foreground">
                {microsoft.connected ? microsoft.email || "Microsoft 365 mailbox connected" : "Connect once using your Microsoft business account."}
              </div>
            </div>
            {microsoft.connected ? (
              <Button variant="outline" onClick={disconnectMicrosoft}>Disconnect</Button>
            ) : (
              <a
                href="/api/auth/microsoft/connect"
                className={`inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 ${
                  microsoft.loading ? "pointer-events-none opacity-50" : ""
                }`}
                aria-disabled={microsoft.loading}
              >
                Connect Microsoft 365
              </a>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outreach defaults</CardTitle>
            <CardDescription>
              Control how automatic follow-ups are scheduled after sending.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field className="max-w-xs">
                <FieldLabel htmlFor="followup">Default follow-up interval (days)</FieldLabel>
                <Input
                  id="followup"
                  type="number"
                  min={1}
                  value={firm.followUpDays}
                  onChange={(e) => set("followUpDays", e.target.value)}
                />
                <FieldDescription>
                  A follow-up is scheduled this many days after an email is logged.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline stages</CardTitle>
              <CardDescription>The stages every prospect can move through.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {PIPELINE_STAGES.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email templates</CardTitle>
              <CardDescription>Available outreach sequences.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {EMAIL_TEMPLATES.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>

        <div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Spinner data-icon="inline-start" /> : null}
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </>
  )
}
