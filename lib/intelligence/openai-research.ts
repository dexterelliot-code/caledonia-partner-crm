import type { CompanyIntelligence } from "@/lib/intelligence/types"

const schema = {
  type: "object",
  additionalProperties: false,
  required: [
    "aiSummary", "headquarters", "founded", "employeeRange", "industries",
    "products", "markets", "certifications", "recentDevelopments", "ukPresence",
    "scotlandPresence", "distributorNotes", "recommendedContactRole",
    "opportunityScore", "scoreReasons", "risks", "sources", "confidence",
    "decisionMakers",
  ],
  properties: {
    aiSummary: { type: "string" },
    headquarters: { type: "string" },
    founded: { type: "string" },
    employeeRange: { type: "string" },
    industries: { type: "array", items: { type: "string" } },
    products: { type: "array", items: { type: "string" } },
    markets: { type: "array", items: { type: "string" } },
    certifications: { type: "array", items: { type: "string" } },
    recentDevelopments: { type: "array", items: { type: "string" } },
    ukPresence: { type: "string", enum: ["present", "not_found", "unknown"] },
    scotlandPresence: { type: "string", enum: ["present", "not_found", "unknown"] },
    distributorNotes: { type: "string" },
    recommendedContactRole: { type: "string" },
    opportunityScore: { type: "integer", minimum: 0, maximum: 100 },
    scoreReasons: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    sources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "url"],
        properties: { title: { type: "string" }, url: { type: "string" } },
      },
    },
    confidence: { type: "integer", minimum: 0, maximum: 100 },
    decisionMakers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["fullName", "jobTitle", "email", "linkedinUrl", "sourceUrl", "confidence"],
        properties: {
          fullName: { type: "string" },
          jobTitle: { type: "string" },
          email: { type: "string" },
          linkedinUrl: { type: "string" },
          sourceUrl: { type: "string" },
          confidence: { type: "integer", minimum: 0, maximum: 100 },
        },
      },
    },
  },
} as const

function extractOutputText(payload: any): string {
  if (typeof payload.output_text === "string") return payload.output_text
  for (const item of payload.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") return content.text
    }
  }
  throw new Error("The research service returned no structured output.")
}

export async function researchCompany(input: {
  name: string
  website: string
  country: string
  productCategory: string
}): Promise<{ intelligence: CompanyIntelligence; model: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured in Vercel.")

  const model = process.env.OPENAI_RESEARCH_MODEL || "gpt-5-mini"
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      tools: [{ type: "web_search" }],
      input: `Research this manufacturer for a Scottish commercial representation opportunity.\n\nCompany: ${input.name}\nWebsite: ${input.website || "unknown"}\nCountry: ${input.country || "unknown"}\nCategory: ${input.productCategory || "unknown"}\n\nUse current public sources. Prioritise the official company website, official news, reputable trade press and public professional pages. Never invent a person, email address, LinkedIn URL, distributor or market presence. Leave fields blank when not verified. Decision makers should focus on export sales, international sales, commercial, business development, sales director or managing director roles. Score the opportunity for Caledonia Technical Partners to represent the company in Scotland.`,
      text: {
        format: {
          type: "json_schema",
          name: "company_intelligence",
          strict: true,
          schema,
        },
      },
    }),
  })

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Company research failed.")
  }

  const intelligence = JSON.parse(extractOutputText(payload)) as CompanyIntelligence
  return { intelligence, model }
}
