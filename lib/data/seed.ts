import {
  mockActivities,
  mockCompanies,
  mockFollowUps,
  mockProposals,
} from "@/lib/mock-data"
import {
  COMPANY_NAME,
  SENDER_LOCATION,
  SENDER_NAME,
  SENDER_TITLE,
} from "@/lib/email-templates"

/**
 * Builds the demonstration seed as insert-ready rows for a specific user.
 * The mock data uses short string ids (c1, ct1, ...); we remap them to fresh
 * UUIDs so relationships stay intact in the database.
 */
export function buildSeedRows(userId: string) {
  const companyIdMap = new Map<string, string>()
  const contactIdMap = new Map<string, string>()

  const companyRows: any[] = []
  const contactRows: any[] = []

  for (const c of mockCompanies) {
    const newCompanyId = crypto.randomUUID()
    companyIdMap.set(c.id, newCompanyId)
    companyRows.push({
      id: newCompanyId,
      user_id: userId,
      name: c.name,
      website: c.website,
      country: c.country,
      product_category: c.productCategory,
      priority: c.priority,
      stage: c.stage,
      market_opportunity: c.marketOpportunity,
      notes: c.notes,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    })

    for (const ct of c.contacts) {
      const newContactId = crypto.randomUUID()
      contactIdMap.set(ct.id, newContactId)
      contactRows.push({
        id: newContactId,
        user_id: userId,
        company_id: newCompanyId,
        name: ct.name,
        job_title: ct.jobTitle,
        email: ct.email,
        linkedin_url: ct.linkedinUrl ?? null,
        notes: ct.notes ?? null,
        is_primary: ct.isPrimary,
      })
    }
  }

  const activityRows = mockActivities.map((a) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    company_id: companyIdMap.get(a.companyId)!,
    type: a.type,
    title: a.title,
    detail: a.detail ?? null,
    date: a.date,
  }))

  const followUpRows = mockFollowUps.map((f) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    company_id: companyIdMap.get(f.companyId)!,
    contact_id: f.contactId ? (contactIdMap.get(f.contactId) ?? null) : null,
    due_date: f.dueDate,
    reason: f.reason,
    status: f.status,
    created_at: f.createdAt,
  }))

  const proposalRows = mockProposals.map((p) => ({
    id: crypto.randomUUID(),
    user_id: userId,
    company_id: companyIdMap.get(p.companyId)!,
    company_name: p.companyName,
    territory: p.territory,
    commercial_model: p.commercialModel,
    commercial_terms: p.commercialTerms,
    target_sectors: p.targetSectors,
    validity: p.validity,
    created_at: p.createdAt,
  }))

  const settingsRow = {
    user_id: userId,
    company: COMPANY_NAME,
    location: SENDER_LOCATION,
    sender: SENDER_NAME,
    title: SENDER_TITLE,
    follow_up_days: 5,
    seeded: true,
  }

  return {
    companyRows,
    contactRows,
    activityRows,
    followUpRows,
    proposalRows,
    settingsRow,
  }
}
