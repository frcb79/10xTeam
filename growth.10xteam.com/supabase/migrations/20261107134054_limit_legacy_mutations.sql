-- RLS does not restrict TRUNCATE. Keep client reads governed by existing policies.
revoke truncate, references, trigger on public.businesses, public.ai_usage, public.plan_ai_allowances from public, anon, authenticated;

-- A conflicting historical row stops the migration without altering the signup.
create unique index contact_waitlist_email_idx on public.contact_leads (lower(btrim(email)))
  where source='growth_contact' and service_type='growth_early_access';
