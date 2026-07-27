import { COMPANY_NAME, SENDER_LOCATION } from "./email-templates"
import type { ProposalDocument } from "./proposal-content"

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function proposalToHtml(doc: ProposalDocument): string {
  const meta = doc.meta
    .map(
      (m) =>
        `<div class="meta-item"><span class="meta-label">${esc(
          m.label,
        )}</span><span class="meta-value">${esc(m.value)}</span></div>`,
    )
    .join("")

  const sections = doc.sections
    .map((s) => {
      const paras = s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")
      const bullets = s.bullets
        ? `<ul>${s.bullets.map((b) => `<li>${esc(b)}</li>`).join("")}</ul>`
        : ""
      return `<section><h2>${esc(s.heading)}</h2>${paras}${bullets}</section>`
    })
    .join("")

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(doc.title)} — ${esc(doc.companyName)}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1a2033; line-height: 1.6; margin: 0;
    background: #f4f6fa; padding: 40px 20px;
  }
  .page {
    max-width: 780px; margin: 0 auto; background: #fff;
    padding: 56px 64px; border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .brand { color: #2f5ecc; font-weight: 700; letter-spacing: 0.02em; font-size: 14px; text-transform: uppercase; }
  h1 { font-size: 30px; margin: 6px 0 4px; color: #1a2540; }
  .subtitle { color: #5b6478; margin: 0 0 28px; font-size: 15px; }
  .meta {
    display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px;
    background: #f4f6fa; border: 1px solid #e2e7f0; border-radius: 8px;
    padding: 20px 24px; margin-bottom: 36px;
  }
  .meta-item { display: flex; flex-direction: column; gap: 2px; }
  .meta-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; color: #7a8398; }
  .meta-value { font-size: 14px; font-weight: 600; color: #1a2540; }
  section { margin-bottom: 26px; }
  h2 { font-size: 17px; color: #1a2540; border-bottom: 2px solid #eef1f6; padding-bottom: 6px; margin: 0 0 12px; }
  p { margin: 0 0 12px; font-size: 14.5px; }
  ul { margin: 0 0 12px; padding-left: 20px; }
  li { margin-bottom: 6px; font-size: 14.5px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e7f0; color: #7a8398; font-size: 12.5px; }
  @media print {
    body { background: #fff; padding: 0; }
    .page { box-shadow: none; border-radius: 0; max-width: none; padding: 24px 32px; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="brand">${esc(COMPANY_NAME)}</div>
    <h1>${esc(doc.title)}</h1>
    <p class="subtitle">Prepared for ${esc(doc.preparedFor)} · ${esc(
      doc.companyName,
    )} · ${esc(doc.date)}</p>
    <div class="meta">${meta}</div>
    ${sections}
    <div class="footer">
      Prepared by ${esc(doc.preparedBy)}, ${esc(COMPANY_NAME)}, ${esc(
        SENDER_LOCATION,
      )}.<br />
      This document is confidential and intended solely for ${esc(doc.companyName)}.
    </div>
  </div>
  <script>window.onload = function () { setTimeout(function () { window.print(); }, 400); };</script>
</body>
</html>`
}
