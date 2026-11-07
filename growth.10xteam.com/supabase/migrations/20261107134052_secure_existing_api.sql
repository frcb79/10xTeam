-- Standalone P0. Capture the rollback SQL first. Apply in one transaction.
set local lock_timeout = '5s';

do $$
declare p record; target_role name;
begin
  if exists (
    select 1 from pg_class where oid in ('public.businesses'::regclass, 'public.ai_usage'::regclass,
      'public.plan_ai_allowances'::regclass, 'public.wizard_drafts'::regclass,
      'public.diagnostic_records'::regclass, 'public.ghl_sessions'::regclass,
      'public.contact_leads'::regclass) and not relrowsecurity
  ) then raise exception 'RLS must be enabled on the seven existing tables'; end if;

  for p in select schemaname, tablename, policyname, cmd from pg_policies where schemaname='public'
    and tablename in ('businesses','ai_usage','plan_ai_allowances','wizard_drafts','diagnostic_records','ghl_sessions','contact_leads')
  loop
    target_role := case when p.cmd='SELECT' and (
      (p.tablename='businesses' and p.policyname='Users can view own businesses') or
      (p.tablename='ai_usage' and p.policyname='Users can view own AI usage'))
      then 'authenticated' else 'service_role' end;
    execute format('alter policy %I on %I.%I to %I',p.policyname,p.schemaname,p.tablename,target_role);
  end loop;
end $$;

revoke all privileges on public.businesses, public.ai_usage, public.plan_ai_allowances,
  public.wizard_drafts, public.diagnostic_records, public.ghl_sessions, public.contact_leads
  from public, anon, authenticated, service_role;
grant select on public.businesses, public.ai_usage to authenticated;
grant select on public.plan_ai_allowances to service_role;
grant select, insert, update on public.businesses, public.ai_usage to service_role;
grant select, insert on public.contact_leads to service_role;
-- The new Wizard uses onboarding_sessions. Legacy ID-based handlers cannot access archives.

do $$
declare fn text;
begin
  foreach fn in array array['public.rls_auto_enable()', 'public.update_updated_at()'] loop
    if to_regprocedure(fn) is not null then
      execute format('revoke all on function %s from public, anon, authenticated, service_role', to_regprocedure(fn));
    end if;
  end loop;
end $$;
