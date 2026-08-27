-- 01_create_businesses.sql
-- Tabla base de negocios (prospectos/clientes). Requerida como FK por wizard_drafts, ai_usage, etc.

create table if not exists public.businesses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  name          text not null,
  website_url   text,
  industry      text,
  icp_type      text check (icp_type in ('b2b', 'b2c', 'mixed', 'freelancer')),

  ghl_location_id   text unique,
  ghl_snapshot_id   text,

  wizard_completed      boolean default false,
  wizard_completed_at   timestamptz,
  wizard_step_current   integer default 1,

  plan          text check (plan in ('trial', 'solo', 'pyme', 'empresa')) default 'trial',
  trial_ends_at timestamptz default (now() + interval '14 days'),

  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

alter table public.businesses enable row level security;

create policy "Users can view own businesses"
  on public.businesses for select
  using (auth.uid() = user_id);

create policy "Users can insert own businesses"
  on public.businesses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own businesses"
  on public.businesses for update
  using (auth.uid() = user_id);

create policy "Service role can manage businesses"
  on public.businesses for all
  using (true)
  with check (true);

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger businesses_updated_at
  before update on public.businesses
  for each row execute function update_updated_at();
