"use server"

import { createClient } from "@/lib/supabase/server"
import { buildSeedRows } from "@/lib/data/seed"
import {
  mapActivity,
  mapCompany,
  mapContact,
  mapEmail,
  mapFollowUp,
  mapProposal,
  mapSettings,
} from "@/lib/data/mappers"
import type {
  Activity,
  AppSettings,
  Company,
  Contact,
  EmailRecord,
  FollowUp,
  Proposal,
} from "@/lib/types"

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  return { supabase, userId: user.id }
}

export interface CrmSnapshot {
  companies: Company[]
  activities: Activity[]
  followUps: FollowUp[]
  proposals: Proposal[]
  emails: EmailRecord[]
  settings: AppSettings | null
}

/**
 * Seeds demonstration data exactly once per user, guarded by settings.seeded.
 */
async function seedIfNeeded(supabase: any, userId: string) {
  const { data: existing } = await supabase
    .from("settings")
    .select("seeded")
    .eq("user_id", userId)
    .maybeSingle()

  if (existing?.seeded) return

  const rows = buildSeedRows(userId)

  // Insert in dependency order.
  await supabase.from("companies").insert(rows.companyRows)
  if (rows.contactRows.length)
    await supabase.from("contacts").insert(rows.contactRows)
  if (rows.activityRows.length)
    await supabase.from("activities").insert(rows.activityRows)
  if (rows.followUpRows.length)
    await supabase.from("follow_ups").insert(rows.followUpRows)
  if (rows.proposalRows.length)
    await supabase.from("proposals").insert(rows.proposalRows)

  // Mark as seeded (also stores the default sender profile).
  await supabase.from("settings").upsert(rows.settingsRow)
}

export async function loadCrmData(): Promise<CrmSnapshot> {
  const { supabase, userId } = await requireUser()

  await seedIfNeeded(supabase, userId)

  const [companiesRes, contactsRes, activitiesRes, followUpsRes, proposalsRes, emailsRes, settingsRes] =
    await Promise.all([
      supabase.from("companies").select("*").order("created_at", { ascending: false }),
      supabase.from("contacts").select("*").order("created_at", { ascending: true }),
      supabase.from("activities").select("*").order("date", { ascending: false }),
      supabase.from("follow_ups").select("*").order("due_date", { ascending: true }),
      supabase.from("proposals").select("*").order("created_at", { ascending: false }),
      supabase.from("emails").select("*").order("sent_at", { ascending: false }),
      supabase.from("settings").select("*").eq("user_id", userId).maybeSingle(),
    ])

  const firstError =
    companiesRes.error ||
    contactsRes.error ||
    activitiesRes.error ||
    followUpsRes.error ||
    proposalsRes.error ||
    emailsRes.error
  if (firstError) throw new Error(firstError.message)

  const contactsByCompany = new Map<string, Contact[]>()
  for (const row of contactsRes.data ?? []) {
    const list = contactsByCompany.get(row.company_id) ?? []
    list.push(mapContact(row))
    contactsByCompany.set(row.company_id, list)
  }

  const companies = (companiesRes.data ?? []).map((row: any) =>
    mapCompany(row, contactsByCompany.get(row.id) ?? []),
  )

  return {
    companies,
    activities: (activitiesRes.data ?? []).map(mapActivity),
    followUps: (followUpsRes.data ?? []).map(mapFollowUp),
    proposals: (proposalsRes.data ?? []).map(mapProposal),
    emails: (emailsRes.data ?? []).map(mapEmail),
    settings: mapSettings(settingsRes.data),
  }
}

type Result = { error?: string }

/* ---------------- Companies ---------------- */

export async function createCompanyAction(company: Company): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const { error } = await supabase.from("companies").insert({
      id: company.id,
      user_id: userId,
      name: company.name,
      website: company.website,
      country: company.country,
      product_category: company.productCategory,
      priority: company.priority,
      stage: company.stage,
      market_opportunity: company.marketOpportunity,
      notes: company.notes,
      created_at: company.createdAt,
      updated_at: company.updatedAt,
    })
    if (error) throw error
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to create company" }
  }
}

export async function updateCompanyAction(
  id: string,
  data: Partial<Company>,
): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (data.name !== undefined) patch.name = data.name
    if (data.website !== undefined) patch.website = data.website
    if (data.country !== undefined) patch.country = data.country
    if (data.productCategory !== undefined) patch.product_category = data.productCategory
    if (data.priority !== undefined) patch.priority = data.priority
    if (data.stage !== undefined) patch.stage = data.stage
    if (data.marketOpportunity !== undefined) patch.market_opportunity = data.marketOpportunity
    if (data.notes !== undefined) patch.notes = data.notes

    const { error } = await supabase
      .from("companies")
      .update(patch)
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw error
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update company" }
  }
}

export async function deleteCompanyAction(id: string): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw error
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete company" }
  }
}

/* ---------------- Contacts ---------------- */

export async function createContactAction(
  companyId: string,
  contact: Contact,
): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    if (contact.isPrimary) {
      await supabase
        .from("contacts")
        .update({ is_primary: false })
        .eq("company_id", companyId)
        .eq("user_id", userId)
    }
    const { error } = await supabase.from("contacts").insert({
      id: contact.id,
      user_id: userId,
      company_id: companyId,
      name: contact.name,
      job_title: contact.jobTitle,
      email: contact.email,
      linkedin_url: contact.linkedinUrl ?? null,
      notes: contact.notes ?? null,
      is_primary: contact.isPrimary,
      email_validity: contact.emailValidity ?? "unverified",
      email_last_checked_at: contact.emailLastCheckedAt ?? null,
    })
    if (error) throw error
    await touchCompany(supabase, userId, companyId)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to add contact" }
  }
}

export async function updateContactAction(
  companyId: string,
  contactId: string,
  data: Partial<Contact>,
): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    if (data.isPrimary) {
      await supabase
        .from("contacts")
        .update({ is_primary: false })
        .eq("company_id", companyId)
        .eq("user_id", userId)
    }
    const patch: Record<string, unknown> = {}
    if (data.name !== undefined) patch.name = data.name
    if (data.jobTitle !== undefined) patch.job_title = data.jobTitle
    if (data.email !== undefined) patch.email = data.email
    if (data.linkedinUrl !== undefined) patch.linkedin_url = data.linkedinUrl ?? null
    if (data.notes !== undefined) patch.notes = data.notes ?? null
    if (data.isPrimary !== undefined) patch.is_primary = data.isPrimary
    if (data.emailValidity !== undefined) patch.email_validity = data.emailValidity
    if (data.emailLastCheckedAt !== undefined) patch.email_last_checked_at = data.emailLastCheckedAt ?? null

    const { error } = await supabase
      .from("contacts")
      .update(patch)
      .eq("id", contactId)
      .eq("user_id", userId)
    if (error) throw error
    await touchCompany(supabase, userId, companyId)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to update contact" }
  }
}

export async function deleteContactAction(
  companyId: string,
  contactId: string,
): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", contactId)
      .eq("user_id", userId)
    if (error) throw error
    await touchCompany(supabase, userId, companyId)
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete contact" }
  }
}

async function touchCompany(supabase: any, userId: string, companyId: string) {
  await supabase
    .from("companies")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", companyId)
    .eq("user_id", userId)
}

/* ---------------- Activities ---------------- */

export async function createActivityAction(activity: Activity): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const { error } = await supabase.from("activities").insert({
      id: activity.id,
      user_id: userId,
      company_id: activity.companyId,
      type: activity.type,
      title: activity.title,
      detail: activity.detail ?? null,
      date: activity.date,
    })
    if (error) throw error
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to log activity" }
  }
}

/* ---------------- Follow-ups ---------------- */

export async function createFollowUpAction(followUp: FollowUp): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const { error } = await supabase.from("follow_ups").insert({
      id: followUp.id,
      user_id: userId,
      company_id: followUp.companyId,
      contact_id: followUp.contactId ?? null,
      due_date: followUp.dueDate,
      reason: followUp.reason,
      status: followUp.status,
      created_at: followUp.createdAt,
    })
    if (error) throw error
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to schedule follow-up" }
  }
}

export async function completeFollowUpAction(id: string): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const { error } = await supabase
      .from("follow_ups")
      .update({ status: "completed" })
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw error
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to complete follow-up" }
  }
}

export async function deleteFollowUpAction(id: string): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const { error } = await supabase
      .from("follow_ups")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw error
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete follow-up" }
  }
}

/* ---------------- Proposals ---------------- */

export async function createProposalAction(proposal: Proposal): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const { error } = await supabase.from("proposals").insert({
      id: proposal.id,
      user_id: userId,
      company_id: proposal.companyId,
      company_name: proposal.companyName,
      territory: proposal.territory,
      commercial_model: proposal.commercialModel,
      commercial_terms: proposal.commercialTerms,
      target_sectors: proposal.targetSectors,
      validity: proposal.validity,
      created_at: proposal.createdAt,
    })
    if (error) throw error
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save proposal" }
  }
}

export async function deleteProposalAction(id: string): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const { error } = await supabase
      .from("proposals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
    if (error) throw error
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to delete proposal" }
  }
}

/* ---------------- Emails ---------------- */

export async function createEmailAction(email: EmailRecord): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const { error } = await supabase.from("emails").insert({
      id: email.id,
      user_id: userId,
      company_id: email.companyId,
      contact_id: email.contactId ?? null,
      template: email.template,
      subject: email.subject,
      body: email.body,
      recipient: email.recipient,
      sent_at: email.sentAt,
      delivery_status: email.deliveryStatus,
      status_detail: email.statusDetail ?? null,
    })
    if (error) throw error
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to record email" }
  }
}

/* ---------------- Settings ---------------- */

export async function saveSettingsAction(settings: AppSettings): Promise<Result> {
  try {
    const { supabase, userId } = await requireUser()
    const { error } = await supabase.from("settings").upsert({
      user_id: userId,
      company: settings.company,
      location: settings.location,
      sender: settings.sender,
      title: settings.title,
      follow_up_days: settings.followUpDays,
      updated_at: new Date().toISOString(),
    })
    if (error) throw error
    return {}
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Failed to save settings" }
  }
}
