-- 07_create_ai_usage.sql
-- Registro de consumo de IA por negocio/mes para control de costos y limites de plan.

create table if not exists public.ai_usage (
  id              uuid primary key default gen_random_uuid(),
  business_id     uuid not null references public.businesses(id) on delete cascade,

  provider        text not null,
  model           text not null,
  task            text not null,

  input_tokens    integer not null default 0,
  output_tokens   integer not null default 0,
  cost_usd        numeric(10,6) not null default 0,

  month           text not null,
  metadata        jsonb default '{}'::jsonb,

  created_at      timestamptz default now()
);

create index if not exists ai_usage_business_month_idx
  on public.ai_usage(business_id, month);

create index if not exists ai_usage_provider_idx
  on public.ai_usage(provider);

alter table public.ai_usage enable row level security;

create policy "Users can view own AI usage"
  on public.ai_usage for select
  using (
    exists (
      select 1 from public.businesses
      where businesses.id = ai_usage.business_id
      and businesses.user_id = auth.uid()
    )
  );

create policy "Service role can insert usage"
  on public.ai_usage for insert
  with check (true);
