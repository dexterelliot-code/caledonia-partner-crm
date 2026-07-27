import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { researchCompany } from "@/lib/intelligence/openai-research"

export const maxDuration = 60

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id,name,website,country,product_category")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()
  if (companyError || !company) return NextResponse.json({ error: "Company not found" }, { status: 404 })

  const { data: run, error: runError } = await supabase.from("research_runs").insert({
    user_id: user.id,
    company_id: id,
    status: "running",
  }).select("id").single()
  if (runError) return NextResponse.json({ error: runError.message }, { status: 500 })

  try {
    const { intelligence, model } = await researchCompany({
      name: company.name,
      website: company.website,
      country: company.country,
      productCategory: company.product_category,
    })
    const now = new Date().toISOString()

    const { error: saveError } = await supabase.from("company_intelligence").upsert({
      user_id: user.id,
      company_id: id,
      ai_summary: intelligence.aiSummary,
      headquarters: intelligence.headquarters,
      founded: intelligence.founded,
      employee_range: intelligence.employeeRange,
      industries: intelligence.industries,
      products: intelligence.products,
      markets: intelligence.markets,
      certifications: intelligence.certifications,
      recent_developments: intelligence.recentDevelopments,
      uk_presence: intelligence.ukPresence,
      scotland_presence: intelligence.scotlandPresence,
      distributor_notes: intelligence.distributorNotes,
      recommended_contact_role: intelligence.recommendedContactRole,
      opportunity_score: intelligence.opportunityScore,
      score_reasons: intelligence.scoreReasons,
      risks: intelligence.risks,
      sources: intelligence.sources,
      confidence: intelligence.confidence,
      last_researched_at: now,
      updated_at: now,
    }, { onConflict: "user_id,company_id" })
    if (saveError) throw saveError

    await supabase.from("decision_makers").delete().eq("company_id", id).eq("user_id", user.id).eq("status", "candidate")
    const candidates = intelligence.decisionMakers.filter((p) => p.fullName || p.jobTitle)
    if (candidates.length) {
      const { error } = await supabase.from("decision_makers").insert(candidates.map((person) => ({
        user_id: user.id,
        company_id: id,
        full_name: person.fullName,
        job_title: person.jobTitle,
        email: person.email,
        linkedin_url: person.linkedinUrl,
        source_url: person.sourceUrl,
        confidence: person.confidence,
        status: "candidate",
      })))
      if (error) throw error
    }

    await Promise.all([
      supabase.from("research_runs").update({ status: "completed", model, result_snapshot: intelligence, completed_at: now }).eq("id", run.id),
      supabase.from("activities").insert({ user_id: user.id, company_id: id, type: "note", title: "Company intelligence refreshed", detail: `Opportunity score: ${intelligence.opportunityScore}/100`, date: now }),
    ])

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Research failed"
    await supabase.from("research_runs").update({ status: "failed", error: message, completed_at: new Date().toISOString() }).eq("id", run.id)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
