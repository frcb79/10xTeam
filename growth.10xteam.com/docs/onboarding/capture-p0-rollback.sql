-- Read-only. Save the result privately immediately before applying the standalone P0.
with tables as (
  select c.oid, c.relowner, c.relacl, format('%I.%I',n.nspname,c.relname) obj
  from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='public' and c.relname in ('businesses','ai_usage','plan_ai_allowances','wizard_drafts','diagnostic_records','ghl_sessions','contact_leads')
), objects as (
  select 'table' kind,obj,coalesce(relacl,acldefault('r',relowner)) acl from tables
  union all
  select 'function',format('%I.%I()',n.nspname,p.proname),coalesce(p.proacl,acldefault('f',p.proowner))
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.pronargs=0 and p.proname in ('rls_auto_enable','update_updated_at')
), lines as (
  select 1 ord, format('revoke all on %s %s from public, anon, authenticated, service_role;',kind,obj) line from objects
  union all
  select 2, format('grant %s on %s %s to %s%s;',a.privilege_type,kind,obj,
    case when a.grantee=0 then 'public' else quote_ident(pg_get_userbyid(a.grantee)) end,
    case when a.is_grantable then ' with grant option' else '' end)
  from objects cross join lateral aclexplode(acl) a
  where a.grantee=0 or pg_get_userbyid(a.grantee) in ('anon','authenticated','service_role')
  union all
  select 3,format('alter policy %I on %s to %s;',p.polname,t.obj,(
    select string_agg(case when id=0 then 'public' else quote_ident(pg_get_userbyid(id)) end,', ' order by id)
    from unnest(p.polroles) id))
  from pg_policy p join tables t on t.oid=p.polrelid
)
select 'begin;' || chr(10) || string_agg(line,chr(10) order by ord,line) || chr(10) || 'commit;' as rollback_sql from lines;
