export interface IntelligenceSource {
  title: string
  url: string
}

export interface DecisionMakerCandidate {
  id?: string
  fullName: string
  jobTitle: string
  email: string
  linkedinUrl: string
  sourceUrl: string
  confidence: number
  status?: string
  notes?: string
}

export interface CompanyIntelligence {
  aiSummary: string
  headquarters: string
  founded: string
  employeeRange: string
  industries: string[]
  products: string[]
  markets: string[]
  certifications: string[]
  recentDevelopments: string[]
  ukPresence: string
  scotlandPresence: string
  distributorNotes: string
  recommendedContactRole: string
  opportunityScore: number
  scoreReasons: string[]
  risks: string[]
  sources: IntelligenceSource[]
  confidence: number
  lastResearchedAt?: string
  decisionMakers: DecisionMakerCandidate[]
}
