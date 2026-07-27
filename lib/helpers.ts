import { formatDistanceToNow, isPast, isToday, format } from "date-fns"
import type { Company } from "./types"

export function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "d MMM yyyy")
}

export function dueLabel(iso: string): { label: string; overdue: boolean; today: boolean } {
  const date = new Date(iso)
  const today = isToday(date)
  const overdue = isPast(date) && !today
  let label: string
  if (today) label = "Due today"
  else if (overdue) label = `Overdue — ${formatDistanceToNow(date, { addSuffix: true })}`
  else label = `Due ${formatDistanceToNow(date, { addSuffix: true })}`
  return { label, overdue, today }
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function primaryContact(company: Company) {
  return company.contacts.find((c) => c.isPrimary) ?? company.contacts[0]
}

export const OPEN_STAGES = [
  "Research",
  "Draft ready",
  "Email sent",
  "Follow-up due",
  "Replied",
  "Meeting booked",
  "Proposal sent",
  "Negotiation",
] as const

export function isOpen(company: Company): boolean {
  return company.stage !== "Won" && company.stage !== "Lost"
}
