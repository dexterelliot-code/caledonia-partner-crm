export const PIPELINE_STAGES = [
  "Research",
  "Draft ready",
  "Email sent",
  "Follow-up due",
  "Replied",
  "Meeting booked",
  "Proposal sent",
  "Negotiation",
  "Won",
  "Lost",
] as const

export type PipelineStage = (typeof PIPELINE_STAGES)[number]

export const PRIORITIES = ["High", "Medium", "Low"] as const
export type Priority = (typeof PRIORITIES)[number]

export const PRODUCT_CATEGORIES = [
  "Industrial Automation",
  "Precision Instruments",
  "Renewable Energy",
  "Medical Devices",
  "Robotics",
  "Sensors & IoT",
  "Marine & Offshore",
  "Test & Measurement",
  "Power Electronics",
  "Materials & Coatings",
] as const

export const COUNTRIES = [
  "Germany",
  "Japan",
  "United States",
  "South Korea",
  "Italy",
  "Sweden",
  "Switzerland",
  "Netherlands",
  "Taiwan",
  "France",
  "Denmark",
  "Finland",
] as const

export const EMAIL_TEMPLATES = [
  "Initial representation approach",
  "First follow-up",
  "Final follow-up",
  "Proposal follow-up",
] as const

export type EmailTemplateKey = (typeof EMAIL_TEMPLATES)[number]

export type EmailValidity = "unverified" | "valid" | "invalid"
export type EmailDeliveryStatus = "sent" | "delivered" | "bounced" | "opened" | "replied"

export interface Contact {
  id: string
  name: string
  jobTitle: string
  email: string
  linkedinUrl?: string
  notes?: string
  isPrimary: boolean
  emailValidity?: EmailValidity
  emailLastCheckedAt?: string
}

export type ActivityType =
  | "email_sent"
  | "reply_received"
  | "meeting_booked"
  | "proposal_sent"
  | "note"
  | "stage_change"
  | "follow_up_scheduled"
  | "follow_up_completed"

export interface Activity {
  id: string
  companyId: string
  type: ActivityType
  title: string
  detail?: string
  date: string // ISO
}

export type FollowUpStatus = "pending" | "completed"

export interface FollowUp {
  id: string
  companyId: string
  contactId?: string
  dueDate: string // ISO
  reason: string
  status: FollowUpStatus
  createdAt: string
}

export interface Company {
  id: string
  name: string
  website: string
  country: string
  productCategory: string
  priority: Priority
  stage: PipelineStage
  marketOpportunity: string
  notes: string
  contacts: Contact[]
  createdAt: string
  updatedAt: string
}

export interface Proposal {
  id: string
  companyId: string
  companyName: string
  territory: string
  commercialModel: string
  commercialTerms: string
  targetSectors: string
  validity: string
  createdAt: string
}

export interface EmailRecord {
  id: string
  companyId: string
  contactId?: string
  template: string
  subject: string
  body: string
  recipient: string
  sentAt: string // ISO
  deliveryStatus: EmailDeliveryStatus
  statusDetail?: string
}

export interface AppSettings {
  company: string
  location: string
  sender: string
  title: string
  followUpDays: number
}
