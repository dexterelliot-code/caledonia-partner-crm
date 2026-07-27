import type { Activity, Company, FollowUp, Proposal } from "./types"

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export const mockCompanies: Company[] = [
  {
    id: "c1",
    name: "Bergmann Präzisionstechnik GmbH",
    website: "https://bergmann-praezision.de",
    country: "Germany",
    productCategory: "Precision Instruments",
    priority: "High",
    stage: "Replied",
    marketOpportunity:
      "Scotland's growing life-sciences and semiconductor clusters (Edinburgh, Glasgow, Livingston) require high-precision metrology instruments currently imported ad-hoc. A local representative could consolidate demand across universities and contract manufacturers.",
    notes:
      "Family-owned, strong reputation in optical metrology. Keen to expand into UK post-Brexit and looking for a partner who understands local procurement.",
    createdAt: daysFromNow(-42),
    updatedAt: daysFromNow(-3),
    contacts: [
      {
        id: "ct1",
        name: "Klaus Bergmann",
        jobTitle: "Managing Director",
        email: "k.bergmann@bergmann-praezision.de",
        linkedinUrl: "https://linkedin.com/in/klausbergmann",
        notes: "Decision maker. Prefers direct, technical conversations.",
        isPrimary: true,
      },
      {
        id: "ct2",
        name: "Anja Vogel",
        jobTitle: "Head of International Sales",
        email: "a.vogel@bergmann-praezision.de",
        isPrimary: false,
        notes: "Good day-to-day contact for logistics.",
      },
    ],
  },
  {
    id: "c2",
    name: "Nordic Marine Systems AS",
    website: "https://nordicmarinesystems.no",
    country: "Sweden",
    productCategory: "Marine & Offshore",
    priority: "High",
    stage: "Email sent",
    marketOpportunity:
      "Scottish offshore wind and aquaculture sectors are scaling rapidly. Nordic's subsea monitoring systems align with ScotWind lease activity around the North Sea and Moray Firth.",
    notes: "Referred by a contact at a Aberdeen energy conference.",
    createdAt: daysFromNow(-28),
    updatedAt: daysFromNow(-6),
    contacts: [
      {
        id: "ct3",
        name: "Erik Lindqvist",
        jobTitle: "VP Business Development",
        email: "erik.lindqvist@nordicmarinesystems.no",
        linkedinUrl: "https://linkedin.com/in/eriklindqvist",
        isPrimary: true,
      },
    ],
  },
  {
    id: "c3",
    name: "Kyoto Robotics Corporation",
    website: "https://kyoto-robotics.co.jp",
    country: "Japan",
    productCategory: "Robotics",
    priority: "Medium",
    stage: "Research",
    marketOpportunity:
      "Scotland's food & drink manufacturing and whisky bottling lines are automating. Kyoto's collaborative palletising robots suit SME distilleries seeking flexible automation.",
    notes: "Early stage. Need to identify the right export contact.",
    createdAt: daysFromNow(-14),
    updatedAt: daysFromNow(-14),
    contacts: [
      {
        id: "ct4",
        name: "Hiroshi Tanaka",
        jobTitle: "Export Manager",
        email: "h.tanaka@kyoto-robotics.co.jp",
        isPrimary: true,
        notes: "Formal communication preferred.",
      },
    ],
  },
  {
    id: "c4",
    name: "Helvetia Sensors AG",
    website: "https://helvetia-sensors.ch",
    country: "Switzerland",
    productCategory: "Sensors & IoT",
    priority: "High",
    stage: "Proposal sent",
    marketOpportunity:
      "Smart-city and utilities projects across the Central Belt need robust environmental sensors. Helvetia's water-quality sensors fit Scottish Water's monitoring upgrades.",
    notes: "Proposal sent, awaiting board review. Strong technical fit.",
    createdAt: daysFromNow(-60),
    updatedAt: daysFromNow(-2),
    contacts: [
      {
        id: "ct5",
        name: "Sophie Meier",
        jobTitle: "Chief Commercial Officer",
        email: "s.meier@helvetia-sensors.ch",
        linkedinUrl: "https://linkedin.com/in/sophiemeier",
        isPrimary: true,
      },
    ],
  },
  {
    id: "c5",
    name: "Milano Power Electronics S.p.A.",
    website: "https://milanopower.it",
    country: "Italy",
    productCategory: "Power Electronics",
    priority: "Medium",
    stage: "Follow-up due",
    marketOpportunity:
      "EV charging rollout and grid-edge storage in Scotland demand reliable power conversion hardware. Milano's modular inverters support renewable microgrids in the Highlands & Islands.",
    notes: "Sent intro email, no reply yet. Follow-up due.",
    createdAt: daysFromNow(-20),
    updatedAt: daysFromNow(-8),
    contacts: [
      {
        id: "ct6",
        name: "Giulia Rossi",
        jobTitle: "International Partnerships Lead",
        email: "g.rossi@milanopower.it",
        isPrimary: true,
      },
    ],
  },
  {
    id: "c6",
    name: "Seoul MedTech Instruments",
    website: "https://seoulmedtech.kr",
    country: "South Korea",
    productCategory: "Medical Devices",
    priority: "Low",
    stage: "Draft ready",
    marketOpportunity:
      "NHS Scotland procurement and the Edinburgh BioQuarter create demand for diagnostic devices. Seoul MedTech's point-of-care analysers suit primary-care settings.",
    notes: "Draft email ready to send.",
    createdAt: daysFromNow(-9),
    updatedAt: daysFromNow(-1),
    contacts: [
      {
        id: "ct7",
        name: "Min-jun Park",
        jobTitle: "Global Sales Director",
        email: "mj.park@seoulmedtech.kr",
        linkedinUrl: "https://linkedin.com/in/minjunpark",
        isPrimary: true,
      },
    ],
  },
  {
    id: "c7",
    name: "Rotterdam Automation BV",
    website: "https://rotterdam-automation.nl",
    country: "Netherlands",
    productCategory: "Industrial Automation",
    priority: "Medium",
    stage: "Meeting booked",
    marketOpportunity:
      "Scottish manufacturing productivity programmes (NMIS) drive demand for factory automation. Rotterdam's line-control systems suit tier-2 automotive and aerospace suppliers.",
    notes: "Intro call booked for next week. Warm lead.",
    createdAt: daysFromNow(-33),
    updatedAt: daysFromNow(-4),
    contacts: [
      {
        id: "ct8",
        name: "Daan Visser",
        jobTitle: "Commercial Director",
        email: "d.visser@rotterdam-automation.nl",
        isPrimary: true,
      },
    ],
  },
  {
    id: "c8",
    name: "Copenhagen Wind Dynamics",
    website: "https://cph-winddynamics.dk",
    country: "Denmark",
    productCategory: "Renewable Energy",
    priority: "High",
    stage: "Won",
    marketOpportunity:
      "ScotWind and floating offshore wind pipeline is one of the largest in Europe. Copenhagen's blade-inspection systems address O&M needs across Scottish wind farms.",
    notes: "Signed as distributor for Scotland. Onboarding underway.",
    createdAt: daysFromNow(-90),
    updatedAt: daysFromNow(-7),
    contacts: [
      {
        id: "ct9",
        name: "Freja Nielsen",
        jobTitle: "Head of Partnerships",
        email: "f.nielsen@cph-winddynamics.dk",
        linkedinUrl: "https://linkedin.com/in/frejanielsen",
        isPrimary: true,
      },
    ],
  },
  {
    id: "c9",
    name: "Taipei Test & Measurement Co.",
    website: "https://taipei-tm.com.tw",
    country: "Taiwan",
    productCategory: "Test & Measurement",
    priority: "Low",
    stage: "Lost",
    marketOpportunity:
      "Electronics test labs and universities across Scotland need affordable RF test equipment. Price-competitive alternative to incumbent suppliers.",
    notes: "Chose another UK representative. Keep warm for future.",
    createdAt: daysFromNow(-75),
    updatedAt: daysFromNow(-30),
    contacts: [
      {
        id: "ct10",
        name: "Wei Chen",
        jobTitle: "Overseas Sales Manager",
        email: "wei.chen@taipei-tm.com.tw",
        isPrimary: true,
      },
    ],
  },
  {
    id: "c10",
    name: "Lyon Advanced Materials",
    website: "https://lyon-materials.fr",
    country: "France",
    productCategory: "Materials & Coatings",
    priority: "Medium",
    stage: "Negotiation",
    marketOpportunity:
      "Aerospace and marine coatings demand in Scotland (Prestwick, Rosyth) supports advanced protective coatings. Strong fit with defence supply chains.",
    notes: "Negotiating commission structure. Close to agreement.",
    createdAt: daysFromNow(-50),
    updatedAt: daysFromNow(-5),
    contacts: [
      {
        id: "ct11",
        name: "Camille Laurent",
        jobTitle: "Export Director",
        email: "c.laurent@lyon-materials.fr",
        linkedinUrl: "https://linkedin.com/in/camillelaurent",
        isPrimary: true,
      },
    ],
  },
]

export const mockActivities: Activity[] = [
  {
    id: "a1",
    companyId: "c1",
    type: "reply_received",
    title: "Reply received from Klaus Bergmann",
    detail: "Interested in a call to discuss the Scottish market.",
    date: daysFromNow(-3),
  },
  {
    id: "a2",
    companyId: "c1",
    type: "email_sent",
    title: "Initial representation approach sent",
    date: daysFromNow(-10),
  },
  {
    id: "a3",
    companyId: "c2",
    type: "email_sent",
    title: "Initial representation approach sent",
    date: daysFromNow(-6),
  },
  {
    id: "a4",
    companyId: "c4",
    type: "proposal_sent",
    title: "Market representation proposal sent",
    detail: "Territory: Scotland. Model: Commission-based agency.",
    date: daysFromNow(-2),
  },
  {
    id: "a5",
    companyId: "c7",
    type: "meeting_booked",
    title: "Intro call booked",
    detail: "Video call scheduled with Daan Visser.",
    date: daysFromNow(-4),
  },
  {
    id: "a6",
    companyId: "c8",
    type: "stage_change",
    title: "Partnership won",
    detail: "Signed as Scotland distributor.",
    date: daysFromNow(-7),
  },
  {
    id: "a7",
    companyId: "c10",
    type: "note",
    title: "Commission negotiation ongoing",
    detail: "Proposed 12% on first-year orders.",
    date: daysFromNow(-5),
  },
]

export const mockFollowUps: FollowUp[] = [
  {
    id: "f1",
    companyId: "c5",
    contactId: "ct6",
    dueDate: daysFromNow(-2),
    reason: "No reply to initial approach",
    status: "pending",
    createdAt: daysFromNow(-8),
  },
  {
    id: "f2",
    companyId: "c2",
    contactId: "ct3",
    dueDate: daysFromNow(-1),
    reason: "Follow up on initial approach",
    status: "pending",
    createdAt: daysFromNow(-6),
  },
  {
    id: "f3",
    companyId: "c4",
    contactId: "ct5",
    dueDate: daysFromNow(3),
    reason: "Follow up on proposal",
    status: "pending",
    createdAt: daysFromNow(-2),
  },
  {
    id: "f4",
    companyId: "c6",
    contactId: "ct7",
    dueDate: daysFromNow(1),
    reason: "Check draft was sent",
    status: "pending",
    createdAt: daysFromNow(-1),
  },
]

export const mockProposals: Proposal[] = [
  {
    id: "p1",
    companyId: "c4",
    companyName: "Helvetia Sensors AG",
    territory: "Scotland (United Kingdom)",
    commercialModel: "Commission-based sales agency",
    commercialTerms: "10% commission on net sales, 24-month initial term, exclusive territory.",
    targetSectors: "Utilities, Smart Cities, Water Management",
    validity: "30 days",
    createdAt: daysFromNow(-2),
  },
]
