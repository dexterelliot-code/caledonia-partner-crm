# caledonia-partner-crm

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_PyklHwGcYPK2enA3lQ651IZqEBld)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

## Email deliverability upgrade

After deploying this version, run `supabase/migrations/0002_email_delivery_tracking.sql` in the Supabase SQL Editor. It adds contact email health and email delivery-status fields.

The outreach composer now:
- uses the sender name/title/company/location saved in Settings;
- defaults to Dylan Keddie rather than Andrew Sinclair;
- blocks sending to addresses marked invalid;
- lets you mark an address verified or bounced;
- records bounce notes and suggests likely alternative address formats.

Automatic provider-side bounce detection still requires a mail-provider webhook. The included UI provides immediate manual bounce handling for returned-mail notices such as `550 Unrouteable address`.

## Microsoft 365 integration

1. Run `supabase/migrations/0003_microsoft_connections.sql` in Supabase SQL Editor.
2. Configure these Vercel environment variables:
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID`
   - `AZURE_CLIENT_SECRET`
3. The Azure app registration must use this Web redirect URI:
   - `https://caledonia-partner-crm.vercel.app/api/auth/microsoft/callback`
4. Delegated Microsoft Graph permissions required:
   - `User.Read`
   - `Mail.Send`
   - `Mail.ReadWrite`
   - `offline_access`
5. Redeploy, sign in to the CRM, open Settings, and select **Connect Microsoft 365**.

Optional: set `MICROSOFT_REDIRECT_URI` if the production CRM URL differs from the redirect URI above.

## Caledonia Intelligence v2

Apply `supabase/migrations/0004_intelligence_foundation.sql`, then add these server-side environment variables in Vercel:

```bash
OPENAI_API_KEY=your_api_key
OPENAI_RESEARCH_MODEL=gpt-5-mini
```

The Intelligence tab uses the OpenAI Responses API with web search to research current public company information. Research results remain reviewable evidence, not guaranteed facts: verify named contacts and email addresses before outreach. The integration does not scrape LinkedIn; it stores public LinkedIn URLs only when supported by a public source.
