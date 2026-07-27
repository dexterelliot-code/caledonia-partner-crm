import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

  const [intelligenceRes, decisionMakersRes, runsRes] = await Promise.all([
    supabase.from("company_intelligence").select("*").eq("company_id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("decision_makers").select("*").eq("company_id", id).eq("user_id", user.id).order("confidence", { ascending: false }),
    supabase.from("research_runs").select("id,status,error,started_at,completed_at").eq("company_id", id).eq("user_id", user.id).order("started_at", { ascending: false }).limit(8),
  ])

  const error = intelligenceRes.error || decisionMakersRes.error || runsRes.error
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const row = intelligenceRes.data
  return NextResponse.json({
    intelligence: row ? {
      aiSummary: row.ai_summary,
      headquarters: row.headquarters,
      founded: row.founded,
      employeeRange: row.employee_range,
      industries: row.industries ?? [],
      products: row.products ?? [],
      markets: row.markets ?? [],
      certifications: row.certifications ?? [],
      recentDevelopments: row.recent_developments ?? [],
      ukPresence: row.uk_presence,
      scotlandPresence: row.scotland_presence,
      distributorNotes: row.distributor_notes,
      recommendedContactRole: row.recommended_contact_role,
      opportunityScore: row.opportunity_score,
      scoreReasons: row.score_reasons ?? [],
      risks: row.risks ?? [],
      sources: row.sources ?? [],
      confidence: row.confidence,
      lastResearchedAt: row.last_researched_at,
      decisionMakers: (decisionMakersRes.data ?? []).map((person: any) => ({
        id: person.id,
        fullName: person.full_name,
        jobTitle: person.job_title,
        email: person.email,
        linkedinUrl: person.linkedin_url,
        sourceUrl: person.source_url,
        confidence: person.confidence,
        status: person.status,
        notes: person.notes,
      })),
    } : null,
    runs: runsRes.data ?? [],
  })
}
