-- 12_create_ghl_sessions.sql
-- Persistencia server-side de sesiones OAuth de GHL por company/location.

create table if not exists public.ghl_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id text,
  location_id text,
  user_id text,
  user_type text,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scope text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ghl_sessions_company_unique_idx
  on public.ghl_sessions(company_id)
  where company_id is not null;

create unique index if not exists ghl_sessions_location_unique_idx
  on public.ghl_sessions(location_id)
  where location_id is not null;

create index if not exists ghl_sessions_updated_at_idx
  on public.ghl_sessions(updated_at desc);

alter table public.ghl_sessions enable row level security;

create policy "Service role can read ghl sessions"
  on public.ghl_sessions for select
  using (true);

create policy "Service role can insert ghl sessions"
  on public.ghl_sessions for insert
  with check (true);

create policy "Service role can update ghl sessions"
  on public.ghl_sessions for update
  using (true)
  with check (true);
