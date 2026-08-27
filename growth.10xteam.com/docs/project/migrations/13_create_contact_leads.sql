-- 13_create_contact_leads.sql
-- Captura de leads del formulario de contacto de dev.10xteam.com (linea de negocio dev).

create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  service_type text,
  message text,
  source text not null default 'dev_contact',
  status text not null default 'new',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contact_leads_status_idx
  on public.contact_leads(status);

create index if not exists contact_leads_created_at_idx
  on public.contact_leads(created_at desc);

alter table public.contact_leads enable row level security;

create policy "Service role can read contact leads"
  on public.contact_leads for select
  using (true);

create policy "Service role can insert contact leads"
  on public.contact_leads for insert
  with check (true);

create policy "Service role can update contact leads"
  on public.contact_leads for update
  using (true)
  with check (true);
