# Caledonia Partner CRM — clean deployment

This package removes the accidental loose duplicate files from the repository root and restores the proper project structure.

## Included fixes

- Valid `next.config.mjs`
- Valid Supabase session middleware
- Correct multi-line Settings page
- Removed unsupported `Button asChild` usage
- Removed stray root-level duplicate pages, routes, types, and components
- Restored the correct forgot-password and update-password routes
- Preserved Microsoft 365 integration
- Preserved the Company Intelligence feature
- Added the intelligence migration as `supabase/migrations/0004_intelligence_foundation.sql`

## Deploy

1. Back up the current GitHub repository.
2. Delete the current repository contents, except `.git` if working locally.
3. Upload the **contents** of this folder to the repository root.
4. Commit to `main`.
5. Let Vercel create a new deployment. Do not redeploy an old failed deployment.
6. Keep these Vercel variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `AZURE_CLIENT_ID`
   - `AZURE_TENANT_ID`
   - `AZURE_CLIENT_SECRET`
   - `OPENAI_API_KEY`
   - `OPENAI_RESEARCH_MODEL=gpt-5-mini`
7. Run `supabase/migrations/0004_intelligence_foundation.sql` once if it has not already been applied.

## Important

A local production build could not be completed in the generation environment because access to the npm registry was unavailable. The project was cleaned structurally and the known Vercel errors were corrected, but the new Vercel deployment remains the final build validation.
