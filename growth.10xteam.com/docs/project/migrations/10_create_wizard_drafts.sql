-- 10_create_wizard_drafts.sql
-- Persistencia de borradores del wizard para retomarlo entre sesiones/dispositivos.

create table if not exists public.wizard_drafts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  draft jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (business_id)
);

create index if not exists wizard_drafts_updated_at_idx
  on public.wizard_drafts(updated_at desc);

alter table public.wizard_drafts enable row level security;

-- Usuarios autenticados: ver solo su propio draft.
create policy "Users can view own wizard draft"
  on public.wizard_drafts for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = wizard_drafts.business_id
      and businesses.user_id = auth.uid()
    )
  );

-- Service role: insertar/actualizar drafts para procesos backend.
create policy "Service role can upsert wizard drafts"
  on public.wizard_drafts for insert
  with check (true);

create policy "Service role can update wizard drafts"
  on public.wizard_drafts for update
  using (true)
  with check (true);
