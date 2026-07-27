"use client"

import { useState } from "react"
import {
  Mail,
  MessageSquareReply,
  CalendarCheck,
  FileText,
  StickyNote,
  ArrowRightLeft,
  CalendarPlus,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldLabel } from "@/components/ui/field"
import { useCrm } from "@/lib/store"
import { relativeTime } from "@/lib/helpers"
import type { ActivityType, Company } from "@/lib/types"

const ICONS: Record<ActivityType, typeof Mail> = {
  email_sent: Mail,
  reply_received: MessageSquareReply,
  meeting_booked: CalendarCheck,
  proposal_sent: FileText,
  note: StickyNote,
  stage_change: ArrowRightLeft,
  follow_up_scheduled: CalendarPlus,
  follow_up_completed: CalendarCheck,
}

export function CompanyActivity({ company }: { company: Company }) {
  const { activitiesFor, logActivity } = useCrm()
  const [note, setNote] = useState("")
  const activities = activitiesFor(company.id)

  function addNote() {
    if (!note.trim()) return
    logActivity({
      companyId: company.id,
      type: "note",
      title: "Note added",
      detail: note.trim(),
    })
    setNote("")
    toast.success("Note logged")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No activity logged yet.
          </p>
        ) : (
          <ol className="relative flex flex-col gap-6 border-l border-border pl-6">
            {activities.map((a) => {
              const Icon = ICONS[a.type] ?? StickyNote
              return (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[2.1rem] flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                    <Icon className="size-3" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{a.title}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {relativeTime(a.date)}
                      </span>
                    </div>
                    {a.detail ? (
                      <p className="text-sm text-muted-foreground">{a.detail}</p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <div className="lg:col-span-1">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
          <Field>
            <FieldLabel htmlFor="note">Log a note</FieldLabel>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Call summary, insight, next step…"
              rows={4}
            />
          </Field>
          <Button onClick={addNote} disabled={!note.trim()}>
            <Send data-icon="inline-start" />
            Add note
          </Button>
        </div>
      </div>
    </div>
  )
}
