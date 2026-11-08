import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { setupDb } from "./schema-db";

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
    for (const file of ["20261107134053_intelligent_onboarding.sql", "20261107134054_limit_legacy_mutations.sql"]) {
      await db.exec(await readFile("supabase/migrations/" + file, "utf8"));
    }
    assert.deepEqual((await db.query("select count(*)::int as sessions from onboarding_sessions")).rows, [{ sessions: 0 }]);
  } finally {
    await db.close();
  }
});
