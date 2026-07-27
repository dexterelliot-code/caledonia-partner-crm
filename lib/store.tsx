"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { toast } from "sonner"
import {
  completeFollowUpAction,
  createActivityAction,
  createCompanyAction,
  createContactAction,
  createEmailAction,
  createFollowUpAction,
  createProposalAction,
  deleteCompanyAction,
  deleteContactAction,
  deleteFollowUpAction,
  deleteProposalAction,
  loadCrmData,
  saveSettingsAction,
  updateCompanyAction,
  updateContactAction,
} from "@/lib/data/actions"
import {
  COMPANY_NAME,
  SENDER_LOCATION,
  SENDER_NAME,
  SENDER_TITLE,
} from "@/lib/email-templates"
import type {
  Activity,
  AppSettings,
  Company,
  Contact,
  EmailRecord,
  FollowUp,
  PipelineStage,
  Proposal,
} from "./types"

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  // Fallback (should not be hit in modern browsers).
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function nowISO(): string {
  return new Date().toISOString()
}

const DEFAULT_SETTINGS: AppSettings = {
  company: COMPANY_NAME,
  location: SENDER_LOCATION,
  sender: SENDER_NAME,
  title: SENDER_TITLE,
  followUpDays: 5,
}

interface CrmContextValue {
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  companies: Company[]
  activities: Activity[]
  followUps: FollowUp[]
  proposals: Proposal[]
  emails: EmailRecord[]
  settings: AppSettings
  // company
  getCompany: (id: string) => Company | undefined
  addCompany: (data: Omit<Company, "id" | "createdAt" | "updatedAt" | "contacts">) => Company
  updateCompany: (id: string, data: Partial<Company>) => void
  deleteCompany: (id: string) => void
  setStage: (id: string, stage: PipelineStage) => void
  // contacts
  addContact: (companyId: string, data: Omit<Contact, "id">) => void
  updateContact: (companyId: string, contactId: string, data: Partial<Contact>) => void
  deleteContact: (companyId: string, contactId: string) => void
  // activity
  logActivity: (data: Omit<Activity, "id" | "date">) => void
  activitiesFor: (companyId: string) => Activity[]
  // follow ups
  followUpsFor: (companyId: string) => FollowUp[]
  addFollowUp: (data: Omit<FollowUp, "id" | "createdAt" | "status">) => void
  completeFollowUp: (id: string) => void
  deleteFollowUp: (id: string) => void
  // proposals
  proposalsFor: (companyId: string) => Proposal[]
  addProposal: (data: Omit<Proposal, "id" | "createdAt">) => Proposal
  deleteProposal: (id: string) => void
  // emails
  emailsFor: (companyId: string) => EmailRecord[]
  logEmail: (data: Omit<EmailRecord, "id" | "sentAt">) => void
  // settings
  updateSettings: (data: Partial<AppSettings>) => Promise<{ error?: string }>
}

const CrmContext = createContext<CrmContextValue | null>(null)

export function CrmProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [emails, setEmails] = useState<EmailRecord[]>([])
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Keep the latest companies snapshot for logic inside callbacks without
  // re-creating them on every state change.
  const companiesRef = useRef<Company[]>(companies)
  companiesRef.current = companies

  const reload = useCallback(async () => {
    try {
      const data = await loadCrmData()
      setCompanies(data.companies)
      setActivities(data.activities)
      setFollowUps(data.followUps)
      setProposals(data.proposals)
      setEmails(data.emails)
      setSettings(data.settings ?? DEFAULT_SETTINGS)
      setError(null)
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load data"
      // On the public auth screens there is no session; stay silent there.
      if (message !== "Not authenticated") {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  // Runs a persistence action; on failure toasts and reloads server truth.
  const persist = useCallback(
    async (
      fn: () => Promise<{ error?: string }>,
      failMessage: string,
    ): Promise<{ error?: string }> => {
      try {
        const res = await fn()
        if (res?.error) {
          toast.error(failMessage, { description: res.error })
          await reload()
        }
        return res ?? {}
      } catch (e) {
        const description = e instanceof Error ? e.message : undefined
        toast.error(failMessage, { description })
        await reload()
        return { error: description ?? failMessage }
      }
    },
    [reload],
  )

  const getCompany = useCallback(
    (id: string) => companies.find((c) => c.id === id),
    [companies],
  )

  const logActivity = useCallback(
    (data: Omit<Activity, "id" | "date">) => {
      const activity: Activity = { ...data, id: uid(), date: nowISO() }
      setActivities((prev) => [activity, ...prev])
      void persist(
        () => createActivityAction(activity),
        "Could not log activity",
      )
    },
    [persist],
  )

  const addCompany = useCallback(
    (data: Omit<Company, "id" | "createdAt" | "updatedAt" | "contacts">) => {
      const company: Company = {
        ...data,
        id: uid(),
        contacts: [],
        createdAt: nowISO(),
        updatedAt: nowISO(),
      }
      setCompanies((prev) => [company, ...prev])
      void persist(
        () => createCompanyAction(company),
        "Could not create company",
      )
      return company
    },
    [persist],
  )

  const updateCompany = useCallback(
    (id: string, data: Partial<Company>) => {
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: nowISO() } : c)),
      )
      void persist(
        () => updateCompanyAction(id, data),
        "Could not update company",
      )
    },
    [persist],
  )

  const deleteCompany = useCallback(
    (id: string) => {
      setCompanies((prev) => prev.filter((c) => c.id !== id))
      setActivities((prev) => prev.filter((a) => a.companyId !== id))
      setFollowUps((prev) => prev.filter((f) => f.companyId !== id))
      setProposals((prev) => prev.filter((p) => p.companyId !== id))
      setEmails((prev) => prev.filter((e) => e.companyId !== id))
      void persist(
        () => deleteCompanyAction(id),
        "Could not delete company",
      )
    },
    [persist],
  )

  const setStage = useCallback(
    (id: string, stage: PipelineStage) => {
      const company = companiesRef.current.find((c) => c.id === id)
      setCompanies((prev) =>
        prev.map((c) => (c.id === id ? { ...c, stage, updatedAt: nowISO() } : c)),
      )
      void persist(
        () => updateCompanyAction(id, { stage }),
        "Could not update stage",
      )
      if (company && company.stage !== stage) {
        logActivity({
          companyId: id,
          type: "stage_change",
          title: `Stage changed to ${stage}`,
          detail: `Moved from ${company.stage} to ${stage}`,
        })
      }
    },
    [logActivity, persist],
  )

  const addContact = useCallback(
    (companyId: string, data: Omit<Contact, "id">) => {
      const contact: Contact = { ...data, id: uid() }
      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id !== companyId) return c
          let contacts = [...c.contacts, contact]
          if (contact.isPrimary) {
            contacts = contacts.map((ct) =>
              ct.id === contact.id ? ct : { ...ct, isPrimary: false },
            )
          }
          return { ...c, contacts, updatedAt: nowISO() }
        }),
      )
      void persist(
        () => createContactAction(companyId, contact),
        "Could not add contact",
      )
    },
    [persist],
  )

  const updateContact = useCallback(
    (companyId: string, contactId: string, data: Partial<Contact>) => {
      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id !== companyId) return c
          let contacts = c.contacts.map((ct) =>
            ct.id === contactId ? { ...ct, ...data } : ct,
          )
          if (data.isPrimary) {
            contacts = contacts.map((ct) =>
              ct.id === contactId ? ct : { ...ct, isPrimary: false },
            )
          }
          return { ...c, contacts, updatedAt: nowISO() }
        }),
      )
      void persist(
        () => updateContactAction(companyId, contactId, data),
        "Could not update contact",
      )
    },
    [persist],
  )

  const deleteContact = useCallback(
    (companyId: string, contactId: string) => {
      setCompanies((prev) =>
        prev.map((c) =>
          c.id === companyId
            ? {
                ...c,
                contacts: c.contacts.filter((ct) => ct.id !== contactId),
                updatedAt: nowISO(),
              }
            : c,
        ),
      )
      void persist(
        () => deleteContactAction(companyId, contactId),
        "Could not delete contact",
      )
    },
    [persist],
  )

  const activitiesFor = useCallback(
    (companyId: string) =>
      activities
        .filter((a) => a.companyId === companyId)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [activities],
  )

  const followUpsFor = useCallback(
    (companyId: string) => followUps.filter((f) => f.companyId === companyId),
    [followUps],
  )

  const addFollowUp = useCallback(
    (data: Omit<FollowUp, "id" | "createdAt" | "status">) => {
      const followUp: FollowUp = {
        ...data,
        id: uid(),
        status: "pending",
        createdAt: nowISO(),
      }
      setFollowUps((prev) => [followUp, ...prev])
      void persist(
        () => createFollowUpAction(followUp),
        "Could not schedule follow-up",
      )
    },
    [persist],
  )

  const completeFollowUp = useCallback(
    (id: string) => {
      setFollowUps((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "completed" } : f)),
      )
      void persist(
        () => completeFollowUpAction(id),
        "Could not complete follow-up",
      )
    },
    [persist],
  )

  const deleteFollowUp = useCallback(
    (id: string) => {
      setFollowUps((prev) => prev.filter((f) => f.id !== id))
      void persist(
        () => deleteFollowUpAction(id),
        "Could not delete follow-up",
      )
    },
    [persist],
  )

  const proposalsFor = useCallback(
    (companyId: string) =>
      proposals
        .filter((p) => p.companyId === companyId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [proposals],
  )

  const addProposal = useCallback(
    (data: Omit<Proposal, "id" | "createdAt">) => {
      const proposal: Proposal = { ...data, id: uid(), createdAt: nowISO() }
      setProposals((prev) => [proposal, ...prev])
      void persist(
        () => createProposalAction(proposal),
        "Could not save proposal",
      )
      return proposal
    },
    [persist],
  )

  const deleteProposal = useCallback(
    (id: string) => {
      setProposals((prev) => prev.filter((p) => p.id !== id))
      void persist(
        () => deleteProposalAction(id),
        "Could not delete proposal",
      )
    },
    [persist],
  )

  const emailsFor = useCallback(
    (companyId: string) =>
      emails
        .filter((e) => e.companyId === companyId)
        .sort((a, b) => +new Date(b.sentAt) - +new Date(a.sentAt)),
    [emails],
  )

  const logEmail = useCallback(
    (data: Omit<EmailRecord, "id" | "sentAt">) => {
      const email: EmailRecord = { ...data, id: uid(), sentAt: nowISO(), deliveryStatus: data.deliveryStatus ?? "sent" }
      setEmails((prev) => [email, ...prev])
      void persist(() => createEmailAction(email), "Could not record email")
    },
    [persist],
  )

  const updateSettings = useCallback(
    (data: Partial<AppSettings>) => {
      const next = { ...settings, ...data }
      setSettings(next)
      return persist(() => saveSettingsAction(next), "Could not save settings")
    },
    [persist, settings],
  )

  const value = useMemo<CrmContextValue>(
    () => ({
      loading,
      error,
      reload,
      companies,
      activities,
      followUps,
      proposals,
      emails,
      settings,
      getCompany,
      addCompany,
      updateCompany,
      deleteCompany,
      setStage,
      addContact,
      updateContact,
      deleteContact,
      logActivity,
      activitiesFor,
      followUpsFor,
      addFollowUp,
      completeFollowUp,
      deleteFollowUp,
      proposalsFor,
      addProposal,
      deleteProposal,
      emailsFor,
      logEmail,
      updateSettings,
    }),
    [
      loading,
      error,
      reload,
      companies,
      activities,
      followUps,
      proposals,
      emails,
      settings,
      getCompany,
      addCompany,
      updateCompany,
      deleteCompany,
      setStage,
      addContact,
      updateContact,
      deleteContact,
      logActivity,
      activitiesFor,
      followUpsFor,
      addFollowUp,
      completeFollowUp,
      deleteFollowUp,
      proposalsFor,
      addProposal,
      deleteProposal,
      emailsFor,
      logEmail,
      updateSettings,
    ],
  )

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>
}

export function useCrm() {
  const ctx = useContext(CrmContext)
  if (!ctx) throw new Error("useCrm must be used within CrmProvider")
  return ctx
}
