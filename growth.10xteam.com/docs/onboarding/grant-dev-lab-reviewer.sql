-- PENDING SPECIFIC OWNER APPROVAL. Operational assignment, not a migration.
-- Supabase 10xteam only; does not modify RLS, grants, consents or provisioning.
-- Also requires ONBOARDING_OPERATOR_USER_IDS to include this verified Auth UUID
-- exclusively in the feature branch Preview. Do not set that variable in Production.
begin;
do $$
begin
  if not exists (
    select 1 from public.onboarding_sessions
    where id = '0b624aa6-7db1-46f2-b713-29481273c1ab'::uuid
      and owner_user_id = 'e89ff5d8-ace9-4e44-b3ff-69b9bb350ec9'::uuid
      and plan->>'version' = '9'
      and draft#>>'{answers,step2,businessName}' = '10xTeam Dev'
      and provision->>'status' = 'not_started'
      and provision->>'locationId' is null
  ) then
    raise exception 'Reviewer assignment requires the verified unbound Dev plan 9';
  end if;
  insert into public.onboarding_reviewers(session_id, user_id)
  values ('0b624aa6-7db1-46f2-b713-29481273c1ab',
          'e89ff5d8-ace9-4e44-b3ff-69b9bb350ec9')
  on conflict (session_id, user_id) do nothing;
end $$;
select session_id, user_id from public.onboarding_reviewers
where session_id = '0b624aa6-7db1-46f2-b713-29481273c1ab'
  and user_id = 'e89ff5d8-ace9-4e44-b3ff-69b9bb350ec9';
commit;

-- Reversal, only if revocation is requested: remove this exact assignment and
-- remove the UUID from the branch Preview allowlist, then redeploy Preview.
-- No credentials, sessions, business data or GHL assets need to be deleted.
-- begin;
-- delete from public.onboarding_reviewers
-- where session_id = '0b624aa6-7db1-46f2-b713-29481273c1ab'
--   and user_id = 'e89ff5d8-ace9-4e44-b3ff-69b9bb350ec9';
-- commit;
