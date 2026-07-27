-- Caledonia Technical Partners CRM schema
-- All tables scoped per authenticated user via user_id + RLS.
-- Applied via the Supabase MCP. Kept here for version control / redeploys.

create extension if not exists "pgcrypto";

-- COMPANIES
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  website text not null default '',
  country text not null default '',
  product_category text not null default '',
  priority text not null default 'Medium',
  stage text not null default 'Research',
  market_opportunity text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- CONTACTS
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  job_title text not null default '',
  email text not null default '',
  linkedin_url text,
  notes text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- ACTIVITIES
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  type text not null,
  title text not null,
  detail text,
  date timestamptz not null default now()
);

-- EMAILS
create table if not exists public.emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  template text not null default '',
  subject text not null default '',
  body text not null default '',
  recipient text not null default '',
  sent_at timestamptz not null default now()
);

-- FOLLOW_UPS
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  due_date timestamptz not null,
  reason text not null default '',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- PROPOSALS
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  company_name text not null default '',
  territory text not null default '',
  commercial_model text not null default '',
  commercial_terms text not null default '',
  target_sectors text not null default '',
  validity text not null default '',
  created_at timestamptz not null default now()
);

-- SETTINGS (one row per user)
create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company text not null default '',
  location text not null default '',
  sender text not null default '',
  title text not null default '',
  follow_up_days integer not null default 5,
  seeded boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Indexes for per-user + relational lookups
create index if not exists idx_companies_user on public.companies(user_id);
create index if not exists idx_contacts_company on public.contacts(company_id);
create index if not exists idx_contacts_user on public.contacts(user_id);
create index if not exists idx_activities_company on public.activities(company_id);
create index if not exists idx_activities_user on public.activities(user_id);
create index if not exists idx_emails_company on public.emails(company_id);
create index if not exists idx_emails_user on public.emails(user_id);
create index if not exists idx_follow_ups_company on public.follow_ups(company_id);
create index if not exists idx_follow_ups_user on public.follow_ups(user_id);
create index if not exists idx_proposals_company on public.proposals(company_id);
create index if not exists idx_proposals_user on public.proposals(user_id);

-- Enable RLS
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.activities enable row level security;
alter table public.emails enable row level security;
alter table public.follow_ups enable row level security;
alter table public.proposals enable row level security;
alter table public.settings enable row level security;

-- RLS policies: users can only touch their own rows
do $$
declare
  t text;
begin
  foreach t in array array['companies','contacts','activities','emails','follow_ups','proposals']
  loop
    execute format('drop policy if exists %I_select_own on public.%I;', t, t);
    execute format('drop policy if exists %I_insert_own on public.%I;', t, t);
    execute format('drop policy if exists %I_update_own on public.%I;', t, t);
    execute format('drop policy if exists %I_delete_own on public.%I;', t, t);
    execute format('create policy %I_select_own on public.%I for select using (auth.uid() = user_id);', t, t);
    execute format('create policy %I_insert_own on public.%I for insert with check (auth.uid() = user_id);', t, t);
    execute format('create policy %I_update_own on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id);', t, t);
    execute format('create policy %I_delete_own on public.%I for delete using (auth.uid() = user_id);', t, t);
  end loop;
end $$;

-- Settings policies (PK is user_id)
drop policy if exists settings_select_own on public.settings;
drop policy if exists settings_insert_own on public.settings;
drop policy if exists settings_update_own on public.settings;
drop policy if exists settings_delete_own on public.settings;
create policy settings_select_own on public.settings for select using (auth.uid() = user_id);
create policy settings_insert_own on public.settings for insert with check (auth.uid() = user_id);
create policy settings_update_own on public.settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy settings_delete_own on public.settings for delete using (auth.uid() = user_id);
