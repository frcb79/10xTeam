-- Operador: sólo después de aplicar 053 y 054, con escritores detenidos y
-- respaldo verificado. Conserva los permisos P0 de 052. No modifica el ledger.
begin;
set local lock_timeout = '5s';
lock table public.contact_leads, public.businesses,
  public.onboarding_sessions, public.onboarding_events, public.onboarding_credentials,
  public.onboarding_oauth_states, public.onboarding_webhooks, public.onboarding_reviewers,
  public.onboarding_ai_budgets, public.onboarding_form_routes, public.onboarding_form_outbox
  in access exclusive mode;

do $$
declare
  relation text;
  populated boolean;
begin
  foreach relation in array array[
    'onboarding_sessions','onboarding_events','onboarding_credentials','onboarding_oauth_states',
    'onboarding_webhooks','onboarding_reviewers','onboarding_ai_budgets',
    'onboarding_form_routes','onboarding_form_outbox'
  ] loop
    execute format('select exists(select 1 from public.%I)', relation) into populated;
    if populated then
      raise exception 'Reversión cancelada: % contiene datos.', relation;
    end if;
  end loop;
end;
$$;

drop index public.contact_waitlist_email_idx;
drop trigger queue_configured_form on public.contact_leads;
drop function public.queue_onboarding_lead();
drop function public.save_onboarding(uuid,integer,jsonb,text,text);
drop function public.reserve_10x_ai(uuid,uuid,text,text,text,numeric);
drop table public.onboarding_form_outbox, public.onboarding_form_routes, public.onboarding_ai_budgets,
  public.onboarding_reviewers, public.onboarding_webhooks, public.onboarding_oauth_states,
  public.onboarding_credentials, public.onboarding_events, public.onboarding_sessions;
alter table public.businesses alter column trial_ends_at set default (now() + interval '14 days');
commit;
