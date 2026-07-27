-- Microsoft 365 OAuth connections, one per CRM user.
-- Tokens are readable only by the owning authenticated user through RLS.
create table if not exists public.microsoft_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  microsoft_email text,
  microsoft_display_name text,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.microsoft_connections enable row level security;

drop policy if exists microsoft_connections_select_own on public.microsoft_connections;
drop policy if exists microsoft_connections_insert_own on public.microsoft_connections;
drop policy if exists microsoft_connections_update_own on public.microsoft_connections;
drop policy if exists microsoft_connections_delete_own on public.microsoft_connections;

create policy microsoft_connections_select_own on public.microsoft_connections
  for select using (auth.uid() = user_id);
create policy microsoft_connections_insert_own on public.microsoft_connections
  for insert with check (auth.uid() = user_id);
create policy microsoft_connections_update_own on public.microsoft_connections
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy microsoft_connections_delete_own on public.microsoft_connections
  for delete using (auth.uid() = user_id);
