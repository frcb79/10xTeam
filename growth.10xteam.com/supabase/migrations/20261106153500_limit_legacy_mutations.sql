-- RLS does not restrict TRUNCATE. Keep client reads governed by existing policies.
revoke truncate, references, trigger on public.businesses, public.ai_usage, public.plan_ai_allowances from public, anon, authenticated;
