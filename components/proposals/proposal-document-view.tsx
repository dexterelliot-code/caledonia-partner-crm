import { COMPANY_NAME, SENDER_LOCATION } from "@/lib/email-templates"
import type { ProposalDocument } from "@/lib/proposal-content"

export function ProposalDocumentView({ doc }: { doc: ProposalDocument }) {
  return (
    <div className="rounded-lg border border-border bg-card p-8 shadow-sm sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        {COMPANY_NAME}
      </p>
      <h2 className="mt-1 font-heading text-2xl font-semibold text-foreground">
        {doc.title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Prepared for {doc.preparedFor} · {doc.companyName} · {doc.date}
      </p>

      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-lg border border-border bg-muted/50 p-5 sm:grid-cols-2">
        {doc.meta.map((m) => (
          <div key={m.label} className="flex flex-col gap-0.5">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {m.label}
            </dt>
            <dd className="text-sm font-semibold text-foreground">{m.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col gap-7">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h3 className="mb-3 border-b border-border pb-2 font-heading text-base font-semibold text-foreground">
              {section.heading}
            </h3>
            <div className="flex flex-col gap-3">
              {section.paragraphs.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-foreground/90">
                  {p}
                </p>
              ))}
            </div>
            {section.bullets ? (
              <ul className="mt-3 flex flex-col gap-2 pl-5">
                {section.bullets.map((b, i) => (
                  <li
                    key={i}
                    className="list-disc text-sm leading-relaxed text-foreground/90 marker:text-primary"
                  >
                    {b}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>

      <p className="mt-8 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
        Prepared by {doc.preparedBy}, {COMPANY_NAME}, {SENDER_LOCATION}. This
        document is confidential and intended solely for {doc.companyName}.
      </p>
    </div>
  )
}
