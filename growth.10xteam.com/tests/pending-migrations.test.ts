import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { setupDb } from "./schema-db";

test("053 alone preserves legacy data and unconfigured form intake, and rolls back without 054", async () => {
  const db = await setupDb("20261107134052_secure_existing_api.sql");
  try {
    await db.exec("insert into diagnostic_records(id,status,business_name,payload) values ('qa-legacy','draft','Synthetic business','{}')");
    const before = (await db.query("select * from diagnostic_records where id='qa-legacy'")).rows;
    await db.exec(await readFile("supabase/migrations/20261109173128_intelligent_onboarding.sql", "utf8"));
    assert.deepEqual((await db.query("select * from diagnostic_records where id='qa-legacy'")).rows, before);
    await db.exec("set role service_role; insert into contact_leads(name,email,source,service_type) values ('QA','053@example.test','dev_contact','mvp'); reset role");
    assert.deepEqual((await db.query("select count(*)::int as queued from onboarding_form_outbox")).rows, [{ queued: 0 }]);
    const rollback = await readFile("docs/onboarding/revert-onboarding-053.sql", "utf8");
    await db.exec("insert into onboarding_sessions(guest_hash) values ('qa-053')");
    await assert.rejects(db.exec(rollback), /onboarding_sessions contiene datos/);
    await db.exec("rollback");
    assert.deepEqual((await db.query("select count(*)::int as retained from onboarding_sessions")).rows, [{ retained: 1 }]);
    await db.exec("delete from onboarding_sessions where guest_hash='qa-053'");
    await db.exec(rollback);
    assert.deepEqual((await db.query("select * from diagnostic_records where id='qa-legacy'")).rows, before);
    assert.deepEqual((await db.query(`select to_regclass('public.onboarding_sessions') is null as removed,
      to_regclass('public.contact_waitlist_email_idx') is null as deferred,
      has_table_privilege('anon','public.contact_leads','select') as anonymous,
      has_table_privilege('service_role','public.contact_leads','delete') as server_delete,
      (select count(*)::int from contact_leads where email='053@example.test') as leads,
      (select column_default like '%14 days%' from information_schema.columns where table_schema='public' and table_name='businesses' and column_name='trial_ends_at') as restored`)).rows,
      [{ removed: true, deferred: true, anonymous: false, server_delete: false, leads: 1, restored: true }]);
    await db.exec(await readFile("supabase/migrations/20261109173128_intelligent_onboarding.sql", "utf8"));
    await db.exec("set role service_role; insert into contact_leads(name,email) values ('QA','reapply-053@example.test'); reset role");
  } finally {
    await db.close();
  }
});

test("rollback preserves P0 and legacy leads, refuses active onboarding, and permits reapplication", async () => {
  const db = await setupDb();
  const rollback = await readFile("docs/onboarding/revert-pending-onboarding.sql", "utf8");
  try {
    await db.exec("insert into contact_leads(name,email) values ('QA','rollback@example.test')");
    await db.exec("insert into onboarding_sessions(guest_hash) values ('synthetic')");
    await assert.rejects(db.exec(rollback), /onboarding_sessions contiene datos/);
    await db.exec("rollback");
    assert.deepEqual((await db.query("select guest_hash from onboarding_sessions")).rows, [{ guest_hash: "synthetic" }]);
    assert.deepEqual((await db.query("select to_regclass('public.contact_waitlist_email_idx') is not null as present")).rows, [{ present: true }]);

    await db.exec("delete from onboarding_sessions where guest_hash='synthetic'");
    await db.exec(rollback);
    assert.deepEqual((await db.query(`select to_regclass('public.onboarding_sessions') is null as removed,
      to_regclass('public.contact_waitlist_email_idx') is null as index_removed,
      has_table_privilege('anon','public.contact_leads','select') as anonymous,
      (select count(*)::int from contact_leads where email='rollback@example.test') as retained,
      (select column_default like '%14 days%' from information_schema.columns where table_schema='public' and table_name='businesses' and column_name='trial_ends_at') as restored`)).rows,
      [{ removed: true, index_removed: true, anonymous: false, retained: 1, restored: true }]);
    for (const file of ["20261109173128_intelligent_onboarding.sql", "20261107134054_limit_legacy_mutations.sql"]) {
      await db.exec(await readFile("supabase/migrations/" + file, "utf8"));
    }
    assert.deepEqual((await db.query("select count(*)::int as sessions from onboarding_sessions")).rows, [{ sessions: 0 }]);
  } finally {
    await db.close();
  }
});
