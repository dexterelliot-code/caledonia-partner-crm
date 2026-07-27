"use client"

import { useState } from "react"
import { Mail, Plus, PencilLine, Trash2, Star, Link2, AlertTriangle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ContactDialog } from "@/components/company/contact-dialog"
import { useCrm } from "@/lib/store"
import { initials } from "@/lib/helpers"
import type { Company, Contact } from "@/lib/types"

export function CompanyContacts({ company }: { company: Company }) {
  const { deleteContact } = useCrm()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<Contact | null>(null)
  const [removing, setRemoving] = useState<Contact | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {company.contacts.length} contact{company.contacts.length === 1 ? "" : "s"}
        </h3>
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus data-icon="inline-start" />
          Add contact
        </Button>
      </div>

      {company.contacts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Mail />
            </EmptyMedia>
            <EmptyTitle>No contacts yet</EmptyTitle>
            <EmptyDescription>
              Add decision-makers at {company.name} to start your outreach.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {company.contacts.map((c) => (
            <li
              key={c.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-card p-4"
            >
              <div className="flex min-w-0 gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>{initials(c.name)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{c.name}</span>
                    {c.isPrimary ? (
                      <Badge variant="secondary" className="gap-1 border-transparent bg-primary/15 text-primary">
                        <Star className="size-3" />
                        Primary
                      </Badge>
                    ) : null}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">{c.jobTitle}</span>
                  <a
                    href={`mailto:${c.email}`}
                    className="truncate text-xs text-primary hover:underline"
                  >
                    {c.email}
                  </a>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    {c.emailValidity === "invalid" ? (
                      <><AlertTriangle className="size-3 text-destructive" /> Invalid / bounced</>
                    ) : c.emailValidity === "valid" ? (
                      <><CheckCircle2 className="size-3 text-emerald-500" /> Verified</>
                    ) : (
                      "Email unverified"
                    )}
                  </div>
                  {c.linkedinUrl ? (
                    <a
                      href={c.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Link2 className="size-3" />
                      LinkedIn
                    </a>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Edit contact"
                  onClick={() => setEditing(c)}
                >
                  <PencilLine />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Delete contact"
                  onClick={() => setRemoving(c)}
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ContactDialog companyId={company.id} open={adding} onOpenChange={setAdding} />
      {editing ? (
        <ContactDialog
          companyId={company.id}
          contact={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
        />
      ) : null}

      <AlertDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {removing?.name} from {company.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (removing) {
                  deleteContact(company.id, removing.id)
                  toast.success("Contact deleted")
                }
                setRemoving(null)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
