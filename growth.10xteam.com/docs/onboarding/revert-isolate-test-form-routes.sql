-- Reversal of isolate-test-form-routes
-- Target: Supabase 10xteam (rasnxpsmzmdyradclxtb)
-- Preflight: disables the LAB route and verifies no pending/sending outbox jobs exist.

begin;

-- 1. Disable the LAB route immediately before altering any isolation rules
update public.onboarding_form_routes
set enabled = false
where location_id = 'Be3Voe6UoPjiAawaQUCK';

-- 2. Verify that no pending or in-flight outbox jobs remain for the LAB
do $$
declare
  pending_count integer;
begin
  select count(*) into pending_count
  from public.onboarding_form_outbox
  where location_id = 'Be3Voe6UoPjiAawaQUCK'
    and status in ('pending', 'sending');

  if pending_count > 0 then
    raise exception 'No se puede revertir el aislamiento: existen % trabajos pendientes o en ejecucion para la LAB', pending_count;
  end if;
end $$;

-- 3. Drop trigger, validation function, and column
drop trigger if exists trg_validate_lab_form_route on public.onboarding_form_routes;
drop function if exists public.validate_lab_form_route();
alter table public.onboarding_form_routes drop column if exists authorized_emails;

-- 4. Restore original trigger function
create or replace function public.queue_onboarding_lead() returns trigger language plpgsql security invoker set search_path='' as $$
begin
  insert into public.onboarding_form_outbox(lead_id,source,session_id,location_id,identity_email,offer_key)
    select new.id,new.source,r.session_id,r.location_id,lower(trim(new.email)),coalesce(new.service_type,'')
    from public.onboarding_form_routes r join public.onboarding_sessions s on s.id=r.session_id
    where (new.source <> 'dev_contact' or new.service_type in ('mvp','celula'))
    and new.service_type is distinct from 'growth_early_access' and r.source=new.source and r.enabled and s.provision->>'locationId'=r.location_id and s.provision->>'status'='configured'
    and exists(select 1 from jsonb_array_elements(s.plan->'modules') m where m->>'id'='forms' and m->>'mode' in ('connect','create')
      and m->'consent'->>'actorId'=s.owner_user_id::text and m->'consent'->>'scope'='prepare_forms_no_paid_services'
      and m->'consent'->>'planVersion'=s.plan->>'version')
    on conflict do nothing;
  return new;
end $$;

commit;
