-- 11_create_diagnostic_records.sql
-- Persistencia de diagnosticos para trazabilidad global (wizard -> agenda -> activacion).

create table if not exists public.diagnostic_records (
  id text primary key,
  status text not null,
  business_name text not null,
  contact jsonb not null default '{}'::jsonb,
  payload jsonb not null,
  company_id text,
  location_id text,
  source text not null default 'wizard',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists diagnostic_records_status_idx
  on public.diagnostic_records(status);

create index if not exists diagnostic_records_updated_at_idx
  on public.diagnostic_records(updated_at desc);

create index if not exists diagnostic_records_company_idx
  on public.diagnostic_records(company_id);

create index if not exists diagnostic_records_location_idx
  on public.diagnostic_records(location_id);

alter table public.diagnostic_records enable row level security;

-- Service role: acceso total para procesos backend.
create policy "Service role can read diagnostic records"
  on public.diagnostic_records for select
  using (true);

create policy "Service role can insert diagnostic records"
  on public.diagnostic_records for insert
  with check (true);

create policy "Service role can update diagnostic records"
  on public.diagnostic_records for update
  using (true)
  with check (true);
