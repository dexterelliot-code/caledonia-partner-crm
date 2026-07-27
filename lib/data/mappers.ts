import { SENDER_NAME, SENDER_TITLE } from "@/lib/email-templates"

import type {
  Activity,
  ActivityType,
  AppSettings,
  Company,
  Contact,
  EmailRecord,
  FollowUp,
  FollowUpStatus,
  PipelineStage,
  Priority,
  Proposal,
} from "@/lib/types"

/**
 * Row <-> model mapping helpers.
 * The database uses snake_case columns; the app uses camelCase models.
 */

export function mapContact(row: any): Contact {
  return {
    id: row.id,
    name: row.name,
    jobTitle: row.job_title ?? "",
    email: row.email ?? "",
    linkedinUrl: row.linkedin_url ?? undefined,
    notes: row.notes ?? undefined,
    isPrimary: !!row.is_primary,
    emailValidity: row.email_validity ?? "unverified",
    emailLastCheckedAt: row.email_last_checked_at ?? undefined,
  }
}

export function mapCompany(row: any, contacts: Contact[] = []): Company {
  return {
    id: row.id,
    name: row.name,
    website: row.website ?? "",
    country: row.country ?? "",
    productCategory: row.product_category ?? "",
    priority: (row.priority ?? "Medium") as Priority,
    stage: (row.stage ?? "Research") as PipelineStage,
    marketOpportunity: row.market_opportunity ?? "",
    notes: row.notes ?? "",
    contacts,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapActivity(row: any): Activity {
  return {
    id: row.id,
    companyId: row.company_id,
    type: row.type as ActivityType,
    title: row.title,
    detail: row.detail ?? undefined,
    date: row.date,
  }
}

export function mapFollowUp(row: any): FollowUp {
  return {
    id: row.id,
    companyId: row.company_id,
    contactId: row.contact_id ?? undefined,
    dueDate: row.due_date,
    reason: row.reason ?? "",
    status: (row.status ?? "pending") as FollowUpStatus,
    createdAt: row.created_at,
  }
}

export function mapProposal(row: any): Proposal {
  return {
    id: row.id,
    companyId: row.company_id,
    companyName: row.company_name ?? "",
    territory: row.territory ?? "",
    commercialModel: row.commercial_model ?? "",
    commercialTerms: row.commercial_terms ?? "",
    targetSectors: row.target_sectors ?? "",
    validity: row.validity ?? "",
    createdAt: row.created_at,
  }
}

export function mapEmail(row: any): EmailRecord {
  return {
    id: row.id,
    companyId: row.company_id,
    contactId: row.contact_id ?? undefined,
    template: row.template ?? "",
    subject: row.subject ?? "",
    body: row.body ?? "",
    recipient: row.recipient ?? "",
    sentAt: row.sent_at,
    deliveryStatus: row.delivery_status ?? "sent",
    statusDetail: row.status_detail ?? undefined,
  }
}

export function mapSettings(row: any | null): AppSettings | null {
  if (!row) return null

  // Older seeded workspaces stored a placeholder sender identity. Convert that
  // legacy value at read time so generated emails are correct even before the
  // database migration has been applied.
  const legacySender = ["Andrew", "Sinclair"].join(" ")
  const sender = String(row.sender ?? "").trim()
  const title = String(row.title ?? "").trim()

  return {
    company: row.company ?? "",
    location: row.location ?? "",
    sender: sender === legacySender ? SENDER_NAME : sender,
    title: sender === legacySender && title === "Managing Partner" ? SENDER_TITLE : title,
    followUpDays: row.follow_up_days ?? 5,
  }
}
