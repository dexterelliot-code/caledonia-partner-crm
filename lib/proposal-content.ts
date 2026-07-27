import { COMPANY_NAME, SENDER_LOCATION, SENDER_NAME, SENDER_TITLE } from "./email-templates"
import type { Company, Proposal } from "./types"

export interface ProposalSection {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export interface ProposalDocument {
  title: string
  companyName: string
  preparedFor: string
  preparedBy: string
  date: string
  meta: { label: string; value: string }[]
  sections: ProposalSection[]
}

export function buildProposalDocument(
  proposal: Proposal,
  company: Company,
): ProposalDocument {
  const primary = company.contacts.find((c) => c.isPrimary) ?? company.contacts[0]
  const preparedFor = primary
    ? `${primary.name}, ${primary.jobTitle}`
    : company.name

  return {
    title: "Market Representation Proposal",
    companyName: company.name,
    preparedFor,
    preparedBy: `${SENDER_NAME}, ${SENDER_TITLE}`,
    date: new Date(proposal.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    meta: [
      { label: "Territory", value: proposal.territory },
      { label: "Commercial Model", value: proposal.commercialModel },
      { label: "Target Sectors", value: proposal.targetSectors },
      { label: "Proposal Validity", value: proposal.validity },
    ],
    sections: [
      {
        heading: "Executive Summary",
        paragraphs: [
          `${COMPANY_NAME} proposes to act as the appointed market representative for ${company.name} across ${proposal.territory}. Based in ${SENDER_LOCATION}, we combine deep local networks with a structured, technically literate approach to business development in the ${company.productCategory.toLowerCase()} sector.`,
          `This proposal sets out how we would build and manage a pipeline of qualified opportunities for ${company.name}, the services we provide, our initial 90-day plan, and the commercial framework under which we would operate.`,
        ],
      },
      {
        heading: "The Scottish Market Opportunity",
        paragraphs: [
          company.marketOpportunity,
          `Scotland offers a concentrated, well-networked market with strong public and private investment in ${company.productCategory.toLowerCase()}. As a locally embedded partner, ${COMPANY_NAME} can position ${company.name} directly in front of the specifiers, procurement leads and integrators who drive purchasing decisions.`,
        ],
      },
      {
        heading: "Proposed Services",
        paragraphs: [
          `As your representative in ${proposal.territory}, we would deliver an end-to-end commercial function covering:`,
        ],
        bullets: [
          "Market mapping and identification of priority accounts across " + proposal.targetSectors,
          "Direct outreach, relationship building and key-account management",
          "Technical and commercial support through the sales cycle",
          "Local representation at trade events, tenders and site visits",
          "Regular market intelligence and competitor reporting",
          "A single, accountable point of contact in the Scottish time zone",
        ],
      },
      {
        heading: "Initial 90-Day Plan",
        paragraphs: [
          "We move quickly to demonstrate value. Our first quarter focuses on establishing the foundations and generating early momentum:",
        ],
        bullets: [
          "Weeks 1–2: Onboarding, product and pricing deep-dive, joint target-account list",
          "Weeks 3–6: Market mapping complete, first-tier outreach launched, CRM pipeline established",
          "Weeks 7–10: Qualified meetings secured, technical evaluations initiated with priority accounts",
          "Weeks 11–13: First opportunities in commercial negotiation, 90-day review and forward plan",
        ],
      },
      {
        heading: "Commercial Framework",
        paragraphs: [
          `We propose the following commercial arrangement: ${proposal.commercialModel}.`,
          proposal.commercialTerms,
          "All terms are open to discussion and can be tailored to reflect order volumes, exclusivity and the level of technical support required.",
        ],
      },
      {
        heading: "Next Steps",
        paragraphs: [
          `If this proposal aligns with your ambitions for ${proposal.territory}, we suggest a follow-up call to refine the commercial terms and agree a start date.`,
          `This proposal is valid for ${proposal.validity} from the date of issue. We would be delighted to begin representing ${company.name} in Scotland.`,
        ],
      },
    ],
  }
}
