import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const sql = (file: string) => readFile(file, "utf8");
const tables = [
  "businesses",
  "ai_usage",
  "plan_ai_allowances",
  "wizard_drafts",
  "diagnostic_records",
  "ghl_sessions",
  "contact_leads",
];
const ownerIds = [
  "aaaaaaaa-0000-4000-8000-000000000001",
  "bbbbbbbb-0000-4000-8000-000000000002",
];

test("standalone P0, exact rollback, full PR migrations and access controls across two tenants", async () => {
  const db = await PGlite.create();
  const originalRows = () =>
    Promise.all(
      tables.map((t) =>
        db
          .query(
            `select to_jsonb(t) as contents from public.${t} t order by to_jsonb(t)::text`,
          )
          .then((r) => r.rows),
      ),
    );
  const capture = await sql("docs/onboarding/capture-p0-rollback.sql");
  const snapshot = async () =>
    (await db.query<{ rollback_sql: string }>(capture)).rows[0].rollback_sql;
  const denied = async (statement: string) =>
    assert.rejects(
      db.query(statement),
      (e: unknown) =>
        !!e && typeof e === "object" && "code" in e && e.code === "42501",
      statement,
    );
  try {
    await db.exec(`create schema auth; create table auth.users(id uuid primary key);
      create role anon; create role authenticated; create role service_role bypassrls;
      grant usage on schema auth to anon, authenticated, service_role;
      create function auth.uid() returns uuid language sql stable as
        $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
      alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
      alter default privileges in schema public grant execute on functions to anon,authenticated,service_role;
      create function public.rls_auto_enable() returns event_trigger language plpgsql security definer as $$begin return; end$$;`);
    for (const name of (await readdir("docs/project/migrations"))
      .filter((f) => f.endsWith(".sql"))
      .sort())
      await db.exec(await sql("docs/project/migrations/" + name));
    for (const owner of ownerIds) {
      await db.query("insert into auth.users values ($1)", [owner]);
      await db.query(
        "insert into public.businesses (user_id,name) values ($1,'QA')",
        [owner],
      );
    }
    await db.exec(`insert into public.ai_usage (business_id,provider,model,task,month) select id,'fixture','fixture','fixture','2026-11' from public.businesses;
      insert into public.diagnostic_records(id,status,business_name,payload) select 'qa-'||n,'fixture','Synthetic QA','{}' from generate_series(1,20)n;`);
    await db.exec(`insert into wizard_drafts(business_id,draft) select id,'{"step":1}' from businesses;
      insert into contact_leads(name,email) values ('Fixture anterior','retained@example.test');
      insert into ghl_sessions(location_id,access_token,refresh_token,expires_at) values ('fixture','synthetic-only','synthetic-only',now());`);
    const baseline = await originalRows();
    const rollback = await snapshot();
    const migrations = (await readdir("supabase/migrations"))
      .filter((f) => f.endsWith(".sql"))
      .sort();
    assert.match(migrations[0], /secure_existing_api/);
    await db.exec("set role anon");
    assert.equal(
      (await db.query("select id from public.diagnostic_records")).rows.length,
      20,
    );
    await db.exec("reset role");
    await db.exec(
      "begin;" +
        (await sql("supabase/migrations/" + migrations[0])) +
        "commit;",
    );
    await db.exec("set role anon");
    await denied("select id from public.diagnostic_records");
    await db.exec("reset role");
    await db.exec(rollback);
    assert.equal(await snapshot(), rollback);
    for (const f of migrations)
      await db.exec(
        "begin;" + (await sql("supabase/migrations/" + f)) + "commit;",
      );
    assert.deepEqual(await originalRows(), baseline);
    const relations = (
      await db.query<{ tbl: string; col: string }>(
        `select c.relname as tbl,a.attname as col from pg_class c join pg_attribute a on a.attrelid=c.oid and a.attnum=1 where c.relnamespace='public'::regnamespace and c.relkind='r'`,
      )
    ).rows;
    assert.equal(relations.length, 16);
    for (const principal of [null, ...ownerIds]) {
      await db.exec(principal ? "set role authenticated" : "set role anon");
      if (principal)
        await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
          principal,
        ]);
      for (const { tbl, col } of relations) {
        if (!(principal && ["businesses", "ai_usage"].includes(tbl)))
          await denied("select * from public." + tbl);
        await denied("insert into public." + tbl + " default values");
        await denied(`update public.${tbl} set ${col}=default where false`);
        await denied("delete from public." + tbl);
        await denied("truncate public." + tbl + " cascade");
        const other = await db.query<{ allowed: boolean }>(
          "select has_table_privilege(current_user,$1,'REFERENCES,TRIGGER,MAINTAIN') as allowed",
          [tbl],
        );
        assert.equal(other.rows[0].allowed, false);
      }
      if (principal) {
        assert.deepEqual(
          (await db.query("select user_id from businesses")).rows,
          [{ user_id: principal }],
        );
        assert.deepEqual(
          (await db.query("select business_id from ai_usage")).rows,
          (await db.query("select id as business_id from businesses")).rows,
        );
      }
      for (const fn of [
        "public.rls_auto_enable()",
        "public.update_updated_at()",
        "public.save_onboarding(uuid,integer,jsonb,text,text)",
      ])
        assert.equal(
          (
            await db.query<{ ok: boolean }>(
              "select has_function_privilege(current_user,$1,'execute') ok",
              [fn],
            )
          ).rows[0].ok,
          false,
        );
      await db.exec("reset role");
    }
    await db.exec(
      "insert into onboarding_ai_budgets(business_id,cap_usd,consent_reference,expires_at) select id,1,'QA',now()+interval '1 hour' from businesses; set role service_role;",
    );
    await db.exec(
      "insert into contact_leads(name,email) values ('QA','qa@example.test');",
    );
    assert.equal(
      (
        await db.query(
          "select id from contact_leads where email='qa@example.test'",
        )
      ).rows.length,
      1,
    );
    await denied("update contact_leads set name='wrong'");
    await denied("delete from contact_leads");
    for (const name of ["ghl_sessions", "diagnostic_records", "wizard_drafts"])
      await denied("select * from " + name);
    await db.exec(
      "insert into onboarding_sessions(guest_hash) values ('synthetic-test');",
    );
    await db.exec(
      "select save_onboarding(id,1,'{\"diagnostic\":{\"id\":\"qa\"}}','test','qa') from onboarding_sessions;",
    );
    assert.equal(
      (
        await db.query<{ id: string }>(
          "select diagnostic->>'id' id from onboarding_sessions",
        )
      ).rows[0].id,
      "qa",
    );
    await db.exec(
      "select reserve_10x_ai(id,user_id,'fixture','fixture','fixture',0.1) from businesses limit 1;",
    );
  } finally {
    await db.close();
  }
});
