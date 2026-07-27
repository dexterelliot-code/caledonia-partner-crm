import type { AppSettings, Company, Contact, EmailTemplateKey } from "./types"

export const COMPANY_NAME = "Caledonia Technical Partners"
export const SENDER_NAME = "Dylan Keddie"
export const SENDER_TITLE = "Founder & Commercial Partner"
export const SENDER_LOCATION = "Edinburgh, Scotland"

export interface GeneratedEmail {
  to: string
  subject: string
  body: string
}

function firstName(contact?: Contact): string {
  if (!contact) return "there"
  return contact.name.split(" ")[0]
}

function firmName(settings?: AppSettings): string {
  return settings?.company?.trim() || COMPANY_NAME
}

function signature(settings?: AppSettings): string {
  const sender = settings?.sender?.trim() || SENDER_NAME
  const title = settings?.title?.trim() || SENDER_TITLE
  const company = settings?.company?.trim() || COMPANY_NAME
  const location = settings?.location?.trim() || SENDER_LOCATION
  return `Kind regards,\n\n${sender}\n${title}\n${company}\n${location}`
}

export function generateEmail(
  template: EmailTemplateKey,
  company: Company,
  contact?: Contact,
  settings?: AppSettings,
): GeneratedEmail {
  const name = firstName(contact)
  const to = contact?.email ?? ""
  const category = company.productCategory.toLowerCase()

  switch (template) {
    case "Initial representation approach":
      return {
        to,
        subject: `Representing ${company.name} in the Scottish market`,
        body: `Dear ${name},

I am reaching out from ${firmName(settings)}, an Edinburgh-based commercial partner that represents overseas technical manufacturers across Scotland and the wider UK.

I have been following ${company.name}'s work in ${category}, and I believe there is a strong opportunity in Scotland. ${company.marketOpportunity}

We help manufacturers like yours establish a local presence without the cost and risk of a direct subsidiary — handling business development, key-account relationships and market intelligence on your behalf.

Would you be open to a short introductory call to explore whether a representation or distribution arrangement could work for ${company.name}?

${signature(settings)}`,
      }

    case "First follow-up":
      return {
        to,
        subject: `Following up — ${company.name} in Scotland`,
        body: `Dear ${name},

I wanted to gently follow up on my previous note about representing ${company.name} in the Scottish market.

I appreciate you are busy, so to recap briefly: ${company.marketOpportunity}

If helpful, I would be glad to share how we have supported other ${category} manufacturers entering the UK. Even a 20-minute call would let us establish whether this is worth pursuing.

${signature(settings)}`,
      }

    case "Final follow-up":
      return {
        to,
        subject: `Closing the loop — ${company.name} and Scotland`,
        body: `Dear ${name},

I have reached out a couple of times regarding a potential representation arrangement for ${company.name} in Scotland, and I do not want to crowd your inbox.

If the timing is not right, I completely understand — I will close this out for now. Should you wish to revisit the Scottish opportunity in ${category} in future, my door is always open.

${signature(settings)}`,
      }

    case "Proposal follow-up":
      return {
        to,
        subject: `Our market-representation proposal for ${company.name}`,
        body: `Dear ${name},

Thank you for the opportunity to put together a market-representation proposal for ${company.name}. I wanted to check whether you and your colleagues have had a chance to review it.

I am happy to walk through any part of the commercial framework or the initial 90-day plan, and to adjust the approach to suit your priorities in ${category}.

Is there a good time this week or next for a brief call?

${signature(settings)}`,
      }

    default:
      return { to, subject: "", body: "" }
  }
}
