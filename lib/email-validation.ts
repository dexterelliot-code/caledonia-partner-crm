import type { Contact, EmailValidity } from "./types"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function emailSyntaxIsValid(email: string): boolean {
  return EMAIL_RE.test(email.trim())
}

export function effectiveEmailValidity(contact?: Contact): EmailValidity {
  if (!contact?.email || !emailSyntaxIsValid(contact.email)) return "invalid"
  return contact.emailValidity ?? "unverified"
}

export function suggestEmailAlternatives(contact: Contact): string[] {
  const [, domain = ""] = contact.email.toLowerCase().split("@")
  if (!domain) return []
  const parts = contact.name
    .toLowerCase()
    .replace(/[^a-z\s-]/g, "")
    .split(/[\s-]+/)
    .filter(Boolean)
  if (!parts.length) return []
  const first = parts[0]
  const last = parts.at(-1) ?? first
  const candidates = [
    `${first}.${last}@${domain}`,
    `${first[0]}.${last}@${domain}`,
    `${first}${last}@${domain}`,
    `${last}.${first}@${domain}`,
    `${last}@${domain}`,
  ]
  return [...new Set(candidates)].filter((value) => value !== contact.email.toLowerCase())
}
