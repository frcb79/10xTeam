-- 08_create_plan_ai_allowances.sql
-- Limites de consumo de IA incluidos por plan, usados para bloquear/permitir overage.

create table if not exists public.plan_ai_allowances (
  plan                      text primary key,
  monthly_allowance_usd     numeric(8,2) not null,
  overage_rate_multiplier   numeric(4,2) not null default 1.5,
  hard_limit                boolean not null default false,
  hard_limit_usd            numeric(8,2),
  updated_at                timestamptz default now()
);

insert into public.plan_ai_allowances
  (plan, monthly_allowance_usd, overage_rate_multiplier, hard_limit, hard_limit_usd)
values
  ('trial',   1.00,  2.0,  true,  1.50),
  ('solo',    3.00,  1.5,  false, 15.00),
  ('pyme',    8.00,  1.5,  false, 40.00),
  ('empresa', 25.00, 1.3,  false, 150.00)
on conflict (plan) do nothing;

alter table public.plan_ai_allowances enable row level security;

create policy "Public can read plan allowances"
  on public.plan_ai_allowances for select
  using (true);
