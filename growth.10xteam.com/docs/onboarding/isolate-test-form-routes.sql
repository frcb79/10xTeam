-- Migration: Isolate synthetic test form routes from real commercial leads
-- Target: Supabase 10xteam (rasnxpsmzmdyradclxtb)
-- Reversible, does not affect existing leads or sessions.

begin;

-- 1. Add authorized_emails text array to public.onboarding_form_routes
alter table public.onboarding_form_routes
  add column if not exists authorized_emails text[] not null default '{}';

-- 2. Constraint: Consultoria LAB routes MUST have at least one authorized email if enabled
alter table public.onboarding_form_routes
  drop constraint if exists check_lab_authorized_emails;

alter table public.onboarding_form_routes
  add constraint check_lab_authorized_emails
  check (
    location_id <> 'Be3Voe6UoPjiAawaQUCK'
    or not enabled
    or cardinality(authorized_emails) > 0
  );

-- 3. Update trigger function queue_onboarding_lead to enforce authorized_emails for Consultoria LAB
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
    -- Mandatory isolation: for Consultoria LAB, email MUST be explicitly listed in authorized_emails
    and (
      (r.location_id = 'Be3Voe6UoPjiAawaQUCK' and lower(trim(new.email)) = any(r.authorized_emails))
      or
      (r.location_id <> 'Be3Voe6UoPjiAawaQUCK' and (cardinality(r.authorized_emails) = 0 or lower(trim(new.email)) = any(r.authorized_emails)))
    )
    and exists(select 1 from jsonb_array_elements(s.plan->'modules') m where m->>'id'='forms' and m->>'mode' in ('connect','create')
      and m->'consent'->>'actorId'=s.owner_user_id::text and m->'consent'->>'scope'='prepare_forms_no_paid_services'
      and m->'consent'->>'planVersion'=s.plan->>'version')
    on conflict do nothing;
  return new;
end $$;

commit;
