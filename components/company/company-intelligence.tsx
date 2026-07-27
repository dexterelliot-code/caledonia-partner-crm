"use client"

import { useCallback, useEffect, useState } from "react"
import {
  AlertTriangle,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe2,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  UserSearch,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Company } from "@/lib/types"
import type { CompanyIntelligence } from "@/lib/intelligence/types"

interface ResearchRun {
  id: string
  status: string
  error?: string | null
  started_at: string
  completed_at?: string | null
}

function PresenceBadge({ value }: { value: string }) {
  const label = value === "present" ? "Present" : value === "not_found" ? "Not found" : "Unknown"
  return <Badge variant={value === "present" ? "default" : "outline"}>{label}</Badge>
}

function TagList({ items, empty = "No verified information yet." }: { items: string[]; empty?: string }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">{empty}</p>
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}
    </div>
  )
}

export function CompanyIntelligencePanel({ company }: { company: Company }) {
  const [intelligence, setIntelligence] = useState<CompanyIntelligence | null>(null)
  const [runs, setRuns] = useState<ResearchRun[]>([])
  const [loading, setLoading] = useState(true)
  const [researching, setResearching] = useState(false)

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/intelligence/company/${company.id}`, { cache: "no-store" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load intelligence")
      setIntelligence(payload.intelligence)
      setRuns(payload.runs ?? [])
    } catch (error) {
      toast.error("Could not load company intelligence", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setLoading(false)
    }
  }, [company.id])

  useEffect(() => { void load() }, [load])

  async function research() {
    setResearching(true)
    try {
      const response = await fetch(`/api/intelligence/company/${company.id}/research`, { method: "POST" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Research failed")
      toast.success("Company intelligence refreshed")
      await load()
    } catch (error) {
      toast.error("Research failed", {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setResearching(false)
    }
  }

  if (loading) {
    return <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Loading intelligence…</div>
  }

  if (!intelligence) {
    return (
      <Card className="border-dashed">
        <CardHeader className="items-center text-center">
          <div className="mb-2 rounded-full bg-primary/10 p-3"><BrainCircuit className="size-7 text-primary" /></div>
          <CardTitle>Build this company’s intelligence profile</CardTitle>
          <CardDescription className="max-w-xl">
            Research current public sources, identify likely decision-makers, assess UK and Scottish presence, and calculate a representation opportunity score.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-2">
          <Button onClick={research} disabled={researching || !company.website}>
            {researching ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Sparkles data-icon="inline-start" />}
            {researching ? "Researching company…" : "Analyse company"}
          </Button>
        </CardContent>
        {!company.website && <p className="px-6 pb-5 text-center text-xs text-muted-foreground">Add a company website before running research.</p>}
      </Card>
    )
  }

  const score = intelligence.opportunityScore
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BrainCircuit className="size-5" />AI intelligence summary</CardTitle>
            <CardDescription>
              Confidence {intelligence.confidence}% · Last researched {intelligence.lastResearchedAt ? new Date(intelligence.lastResearchedAt).toLocaleString("en-GB") : "unknown"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="leading-7">{intelligence.aiSummary || "No summary was verified."}</p>
            <Button variant="outline" onClick={research} disabled={researching}>
              {researching ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" />}
              Refresh research
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="size-4" />Company profile</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Headquarters:</span> {intelligence.headquarters || "Unverified"}</div>
              <div><span className="text-muted-foreground">Founded:</span> {intelligence.founded || "Unverified"}</div>
              <div><span className="text-muted-foreground">Employees:</span> {intelligence.employeeRange || "Unverified"}</div>
              <div className="flex items-center gap-2"><span className="text-muted-foreground">UK presence:</span><PresenceBadge value={intelligence.ukPresence} /></div>
              <div className="flex items-center gap-2"><span className="text-muted-foreground">Scotland:</span><PresenceBadge value={intelligence.scotlandPresence} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Target className="size-4" />Recommended approach</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contact first</p><p className="mt-1 font-medium">{intelligence.recommendedContactRole || "Commercial or export leadership"}</p></div>
              <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Distributor intelligence</p><p className="mt-1 text-sm leading-6">{intelligence.distributorNotes || "No verified distributor information."}</p></div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Products and markets</CardTitle></CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3"><h3 className="font-medium">Products</h3><TagList items={intelligence.products} /></div>
            <div className="space-y-3"><h3 className="font-medium">Industries</h3><TagList items={intelligence.industries} /></div>
            <div className="space-y-3"><h3 className="font-medium">Markets</h3><TagList items={intelligence.markets} /></div>
            <div className="space-y-3"><h3 className="font-medium">Certifications</h3><TagList items={intelligence.certifications} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><UserSearch className="size-4" />Decision-maker candidates</CardTitle><CardDescription>Only publicly supported candidates are shown. Verify details before outreach.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            {!intelligence.decisionMakers.length && <p className="text-sm text-muted-foreground">No named decision-maker was confidently verified. Use the recommended role to search manually on LinkedIn.</p>}
            {intelligence.decisionMakers.map((person, index) => (
              <div key={person.id ?? `${person.fullName}-${index}`} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{person.fullName || "Unnamed candidate"}</p>
                  <p className="text-sm text-muted-foreground">{person.jobTitle || "Role unverified"} · {person.confidence}% confidence</p>
                  {person.email && <p className="mt-1 text-sm">{person.email}</p>}
                </div>
                <div className="flex gap-2">
                  {person.linkedinUrl && <Button variant="outline" size="sm" render={<a href={person.linkedinUrl} target="_blank" rel="noreferrer">LinkedIn <ExternalLink data-icon="inline-end" /></a>} />}
                  {person.sourceUrl && <Button variant="ghost" size="sm" render={<a href={person.sourceUrl} target="_blank" rel="noreferrer">Source <ExternalLink data-icon="inline-end" /></a>} />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe2 className="size-4" />Sources</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {intelligence.sources.map((source) => (
              <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted/50">
                <span>{source.title || source.url}</span><ExternalLink className="size-4 text-muted-foreground" />
              </a>
            ))}
            {!intelligence.sources.length && <p className="text-sm text-muted-foreground">No sources stored.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Opportunity score</CardTitle><CardDescription>Suitability for Scottish representation</CardDescription></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2"><span className="text-5xl font-semibold tracking-tight">{score}</span><span className="pb-1 text-muted-foreground">/100</span></div>
            <Progress value={score} />
            <div className="space-y-2">
              {intelligence.scoreReasons.map((reason) => <div key={reason} className="flex gap-2 text-sm"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /><span>{reason}</span></div>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="size-4" />Risks and gaps</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {intelligence.risks.map((risk) => <div key={risk} className="flex gap-2 text-sm"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" /><span>{risk}</span></div>)}
            {!intelligence.risks.length && <p className="text-sm text-muted-foreground">No material risks were identified.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent developments</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {intelligence.recentDevelopments.map((item) => <p key={item} className="border-l-2 pl-3 text-sm leading-6">{item}</p>)}
            {!intelligence.recentDevelopments.length && <p className="text-sm text-muted-foreground">No recent development was verified.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Research history</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {runs.map((run) => (
              <div key={run.id} className="text-sm">
                <div className="flex items-center justify-between"><span className="capitalize">{run.status}</span><span className="text-xs text-muted-foreground">{new Date(run.started_at).toLocaleDateString("en-GB")}</span></div>
                {run.error && <p className="mt-1 text-xs text-destructive">{run.error}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
