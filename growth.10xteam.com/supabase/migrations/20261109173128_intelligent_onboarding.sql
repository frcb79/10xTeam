-- Additive migration. Apply only after reviewing the existing 01/07/08/10-13 schema.
-- All writes go through server authorization + optimistic version checks.
create table public.onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id),
  guest_hash text unique,
  version integer not null default 1 check (version > 0),
  draft jsonb not null default '{}'::jsonb,
  plan jsonb,
  diagnostic jsonb,
  provision jsonb not null default '{"status":"not_started"}'::jsonb,
  evidence jsonb not null default '[]'::jsonb,
  functional_ready_at timestamptz,
  commercial_trial_started_at timestamptz,
  commercial_trial_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (owner_user_id is not null or guest_hash is not null)
);
create index onboarding_owner_idx on public.onboarding_sessions(owner_user_id, updated_at desc);
create unique index onboarding_location_idx on public.onboarding_sessions ((provision->>'locationId')) where provision->>'locationId' is not null;
alter table public.onboarding_sessions enable row level security;
revoke all on public.onboarding_sessions from public, anon, authenticated;
revoke all on public.onboarding_sessions from service_role;
grant select, insert, update on public.onboarding_sessions to service_role;

create table public.onboarding_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.onboarding_sessions(id),
  event_key text not null,
  event_type text not null,
  actor_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(session_id, event_key)
);
alter table public.onboarding_events enable row level security;
revoke all on public.onboarding_events from public, anon, authenticated;
revoke all on public.onboarding_events from service_role;
grant select, insert on public.onboarding_events to service_role;

-- CAS and audit append are one transaction, including provisioning lock acquisition.
create function public.save_onboarding(p_id uuid, p_version integer, p_patch jsonb, p_event text, p_actor text)
returns public.onboarding_sessions language plpgsql security invoker set search_path = '' as $$
declare result public.onboarding_sessions;
begin
  if p_patch - array['draft','plan','diagnostic','provision','evidence','functional_ready_at','owner_user_id','guest_hash'] <> '{}'::jsonb then
    raise exception 'unsupported_patch';
  end if;
  update public.onboarding_sessions set
    draft = case when p_patch ? 'draft' then p_patch->'draft' else draft end,
    plan = case when p_patch ? 'plan' then nullif(p_patch->'plan', 'null'::jsonb) else plan end,
    diagnostic = case when p_patch ? 'diagnostic' then nullif(p_patch->'diagnostic', 'null'::jsonb) else diagnostic end,
    provision = case when p_patch ? 'provision' then p_patch->'provision' else provision end,
    evidence = case when p_patch ? 'evidence' then p_patch->'evidence' else evidence end,
    functional_ready_at = case when p_patch ? 'functional_ready_at' then (p_patch->>'functional_ready_at')::timestamptz else functional_ready_at end,
    owner_user_id = case when p_patch ? 'owner_user_id' then (p_patch->>'owner_user_id')::uuid else owner_user_id end,
    guest_hash = case when p_patch ? 'guest_hash' then p_patch->>'guest_hash' else guest_hash end,
    commercial_trial_started_at = case when p_event='functional_ready_trial_authorized' then coalesce(commercial_trial_started_at,(p_patch->>'functional_ready_at')::timestamptz) else commercial_trial_started_at end,
    commercial_trial_ends_at = case when p_event='functional_ready_trial_authorized' then coalesce(commercial_trial_ends_at,(p_patch->>'functional_ready_at')::timestamptz + interval '14 days') else commercial_trial_ends_at end,
    version = version + 1, updated_at = now()
  where id = p_id and version = p_version returning * into result;
  if not found then raise exception 'version_conflict'; end if;
  insert into public.onboarding_events(session_id, event_key, event_type, actor_id, details)
    values (p_id, 'v' || result.version, p_event, p_actor, jsonb_strip_nulls(jsonb_build_object('version',result.version,'planVersion',result.plan->'version','provisionStatus',result.provision->'status','runId',result.provision->'runId','locationId',result.provision->'locationId','snapshotVersion',result.provision->'snapshotVersion','modules',case when p_event in ('module_selected','authorization_recorded') then result.plan->'modules' end,'evidence',case when p_event in ('location_reconciled','evidence_recorded') then result.evidence->-1 end)));
  return result;
end $$;
revoke all on function public.save_onboarding(uuid,integer,jsonb,text,text) from public, anon, authenticated;
grant execute on function public.save_onboarding(uuid,integer,jsonb,text,text) to service_role;

create table public.onboarding_credentials (
  session_id uuid primary key references public.onboarding_sessions(id),
  ciphertext text not null,
  refresh_lock_at timestamptz,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.onboarding_credentials enable row level security;
revoke all on public.onboarding_credentials from public, anon, authenticated;
revoke all on public.onboarding_credentials from service_role;
grant select, insert, update on public.onboarding_credentials to service_role;

create table public.onboarding_oauth_states (
  nonce_hash text primary key,
  session_id uuid not null references public.onboarding_sessions(id),
  actor_id uuid not null references auth.users(id),
  expires_at timestamptz not null,
  consumed_at timestamptz
);
alter table public.onboarding_oauth_states enable row level security;
revoke all on public.onboarding_oauth_states from public, anon, authenticated;
revoke all on public.onboarding_oauth_states from service_role;
grant select, insert, update on public.onboarding_oauth_states to service_role;

create table public.onboarding_webhooks (
  digest text primary key,
  session_id uuid not null references public.onboarding_sessions(id),
  event_type text not null,
  received_at timestamptz not null default now()
);
alter table public.onboarding_webhooks enable row level security;
revoke all on public.onboarding_webhooks from public, anon, authenticated;
revoke all on public.onboarding_webhooks from service_role;
grant select, insert on public.onboarding_webhooks to service_role;

-- P0 manages existing ACLs and policies. Preserve historical trial timestamps.
alter table public.businesses alter column trial_ends_at drop default;

-- The operator allowlist alone is insufficient. Each reviewer needs an explicit assignment.
create table public.onboarding_reviewers (
  session_id uuid references public.onboarding_sessions(id) not null,
  user_id uuid references auth.users(id) not null, primary key(session_id,user_id)
);
alter table public.onboarding_reviewers enable row level security;
revoke all on public.onboarding_reviewers from public, anon, authenticated;
revoke all on public.onboarding_reviewers from service_role;
grant select on public.onboarding_reviewers to service_role;

create table public.onboarding_ai_budgets (
  business_id uuid primary key references public.businesses(id),
  cap_usd numeric(12,6) not null check(cap_usd>0),
  consent_reference text not null check(length(consent_reference)>0),
  expires_at timestamptz not null
);
alter table public.onboarding_ai_budgets enable row level security;
revoke all on public.onboarding_ai_budgets from public, anon, authenticated;
revoke all on public.onboarding_ai_budgets from service_role;
grant select, update (expires_at) on public.onboarding_ai_budgets to service_role;
create function public.reserve_10x_ai(p_business uuid,p_user uuid,p_provider text,p_model text,p_task text,p_max_cost numeric)
returns uuid language plpgsql security invoker set search_path='' as $$
declare cap numeric; used numeric; reservation uuid; mon text := to_char(now() at time zone 'UTC','YYYY-MM');
begin
  if p_max_cost is null or p_max_cost <= 0 or p_max_cost::text in ('NaN','Infinity') then raise exception 'invalid_reservation'; end if;
  select least(b.cap_usd,case when a.hard_limit then a.monthly_allowance_usd else coalesce(a.hard_limit_usd,a.monthly_allowance_usd) end)
    into cap from public.onboarding_ai_budgets b join public.businesses c on c.id=b.business_id
    join public.plan_ai_allowances a on a.plan=c.plan
    where b.business_id=p_business and c.user_id=p_user and b.expires_at>now() for update of b;
  if cap is null then raise exception 'budget_not_authorized'; end if;
  select coalesce(sum(cost_usd),0) into used from public.ai_usage where business_id=p_business and month=mon;
  if used+ceil(p_max_cost*1000000)/1000000>cap then raise exception 'limit_reached'; end if;
  insert into public.ai_usage(business_id,provider,model,task,cost_usd,month,metadata)
    values(p_business,p_provider,p_model,p_task,ceil(p_max_cost*1000000)/1000000,mon,'{"reservation_status":"reserved"}'::jsonb) returning id into reservation;
  return reservation;
end $$;
revoke all on function public.reserve_10x_ai(uuid,uuid,text,text,text,numeric) from public,anon,authenticated;
grant execute on function public.reserve_10x_ai(uuid,uuid,text,text,text,numeric) to service_role;

-- Existing public form -> durable, explicitly assigned destination. No route is seeded.
create table public.onboarding_form_routes (
  source text primary key check(source in ('dev_contact','growth_contact')),
  session_id uuid not null references public.onboarding_sessions(id),
  location_id text not null unique,
  service_field_id text not null,
  approval_reference text not null check(length(approval_reference) >= 8),
  enabled boolean not null default false
);
create table public.onboarding_form_outbox (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.contact_leads(id),
  source text not null, session_id uuid not null references public.onboarding_sessions(id),
  location_id text not null, identity_email text not null, offer_key text not null,
  status text not null default 'pending' check(status in ('pending','sending','done','review')),
  provider_contact_id text, updated_at timestamptz not null default now(),
  unique(session_id,location_id,identity_email,offer_key)
);
alter table public.onboarding_form_routes enable row level security;
alter table public.onboarding_form_outbox enable row level security;
revoke all on public.onboarding_form_routes,public.onboarding_form_outbox from public,anon,authenticated;
revoke all on public.onboarding_form_routes,public.onboarding_form_outbox from service_role;
grant select on public.onboarding_form_routes to service_role;
grant select, insert, update on public.onboarding_form_outbox to service_role;
create index onboarding_form_queue_idx on public.onboarding_form_outbox(session_id,updated_at) where status='pending';
create function public.queue_onboarding_lead() returns trigger language plpgsql security invoker set search_path='' as $$
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
revoke all on function public.queue_onboarding_lead() from public,anon,authenticated;
grant execute on function public.queue_onboarding_lead() to service_role;
create trigger queue_configured_form after insert on public.contact_leads for each row execute function public.queue_onboarding_lead();
