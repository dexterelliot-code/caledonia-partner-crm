-- Caledonia Intelligence v2: company research, decision makers and scoring.

create table if not exists public.company_intelligence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  ai_summary text not null default '',
  headquarters text not null default '',
  founded text not null default '',
  employee_range text not null default '',
  industries jsonb not null default '[]'::jsonb,
  products jsonb not null default '[]'::jsonb,
  markets jsonb not null default '[]'::jsonb,
  certifications jsonb not null default '[]'::jsonb,
  recent_developments jsonb not null default '[]'::jsonb,
  uk_presence text not null default 'unknown',
  scotland_presence text not null default 'unknown',
  distributor_notes text not null default '',
  recommended_contact_role text not null default '',
  opportunity_score integer not null default 0 check (opportunity_score between 0 and 100),
  score_reasons jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  sources jsonb not null default '[]'::jsonb,
  confidence integer not null default 0 check (confidence between 0 and 100),
  last_researched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, company_id)
);

create table if not exists public.decision_makers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  full_name text not null default '',
  job_title text not null default '',
  email text not null default '',
  linkedin_url text not null default '',
  source_url text not null default '',
  confidence integer not null default 0 check (confidence between 0 and 100),
  status text not null default 'candidate',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  status text not null default 'running',
  provider text not null default 'openai',
  model text not null default '',
  error text,
  result_snapshot jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_company_intelligence_company on public.company_intelligence(company_id);
create index if not exists idx_company_intelligence_user on public.company_intelligence(user_id);
create index if not exists idx_decision_makers_company on public.decision_makers(company_id);
create index if not exists idx_decision_makers_user on public.decision_makers(user_id);
create index if not exists idx_research_runs_company on public.research_runs(company_id);
create index if not exists idx_research_runs_user on public.research_runs(user_id);

alter table public.company_intelligence enable row level security;
alter table public.decision_makers enable row level security;
alter table public.research_runs enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['company_intelligence','decision_makers','research_runs']
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
