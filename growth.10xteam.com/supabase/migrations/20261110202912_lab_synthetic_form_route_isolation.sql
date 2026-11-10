-- Applied to Supabase 10xteam on 2026-11-10 (migration version 20261110202912).
-- The guard prohibits installing this while any routing/outbox rows already exist.
DO $preflight$
BEGIN
  IF EXISTS (SELECT 1 FROM public.onboarding_form_routes)
     OR EXISTS (SELECT 1 FROM public.onboarding_form_outbox)
     OR EXISTS (SELECT 1 FROM information_schema.columns
                WHERE table_schema='public' AND table_name='onboarding_form_routes'
                  AND column_name='authorized_emails') THEN
    RAISE EXCEPTION 'LAB isolation preflight failed: routing/outbox/schema drift; no DDL permitted';
  END IF;
END $preflight$;

-- Migration: Isolate synthetic test form routes from real commercial leads
-- Target: Supabase 10xteam (rasnxpsmzmdyradclxtb)
-- Reversible, does not affect existing leads or sessions.

-- 1. Add authorized_emails text array to public.onboarding_form_routes
alter table public.onboarding_form_routes
  add column if not exists authorized_emails text[] not null default '{}';

-- 2. Validation trigger: Consultoria LAB routes MUST have at least one authorized email if enabled,
-- and every authorized email MUST be strictly synthetic (ending in .test)
create or replace function public.validate_lab_form_route() returns trigger language plpgsql as $$
begin
  if new.location_id = 'Be3Voe6UoPjiAawaQUCK' and new.enabled then
    if new.authorized_emails is null or cardinality(new.authorized_emails) = 0 then
      raise exception 'check_lab_authorized_emails: Una ruta de Consultoria LAB habilitada requiere al menos un correo autorizado.';
    end if;
    if exists (
      select 1 from unnest(new.authorized_emails) as email
      where lower(trim(email)) not like '%.test' or length(trim(email)) < 6
    ) then
      raise exception 'check_lab_authorized_emails: Todos los correos autorizados para Consultoria LAB deben ser sinteticos (.test).';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_validate_lab_form_route on public.onboarding_form_routes;
create trigger trg_validate_lab_form_route
  before insert or update on public.onboarding_form_routes
  for each row execute function public.validate_lab_form_route();

-- 3. Update trigger function queue_onboarding_lead to enforce synthetic authorized_emails for Consultoria LAB
create or replace function public.queue_onboarding_lead() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  insert into public.onboarding_form_outbox(lead_id,source,session_id,location_id,identity_email,offer_key)
    select new.id,new.source,r.session_id,r.location_id,lower(trim(new.email)),coalesce(new.service_type,'')
    from public.onboarding_form_routes r join public.onboarding_sessions s on s.id=r.session_id
    where (new.source <> 'dev_contact' or new.service_type in ('mvp','celula'))
    and new.service_type is distinct from 'growth_early_access' 
    and r.source=new.source 
    and r.enabled 
    and s.provision->>'locationId'=r.location_id 
    and s.provision->>'status'='configured'
    -- Mandatory isolation: for Consultoria LAB, email MUST be synthetic (.test) AND explicitly listed in authorized_emails
    and (
      (r.location_id = 'Be3Voe6UoPjiAawaQUCK'
       and cardinality(r.authorized_emails) > 0
       and lower(trim(new.email)) = any(r.authorized_emails)
       and lower(trim(new.email)) like '%.test')
      or
      (r.location_id <> 'Be3Voe6UoPjiAawaQUCK' and (cardinality(r.authorized_emails) = 0 or lower(trim(new.email)) = any(r.authorized_emails)))
    )
    and exists(select 1 from jsonb_array_elements(s.plan->'modules') m where m->>'id'='forms' and m->>'mode' in ('connect','create')
      and m->'consent'->>'actorId'=s.owner_user_id::text and m->'consent'->>'scope'='prepare_forms_no_paid_services'
      and m->'consent'->>'planVersion'=s.plan->>'version')
    on conflict do nothing;
  return new;
end $$;

