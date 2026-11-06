import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import type { PGlite } from "@electric-sql/pglite";
import { setupDb } from "./schema-db";
import { session, ba, owner, other } from "./fixtures";
let db: PGlite;
before(async () => {
  db = await setupDb();
  await db.query("insert into auth.users values ($1),($2)", [owner, other]);
  await db.query(
    "insert into public.businesses(id,user_id,name) values ($1,$2,'QA')",
    [ba, owner],
  );
  const s = session();
  await db.query(
    "insert into onboarding_sessions(id,owner_user_id,draft,plan) values ($1,$2,$3,$4)",
    [ba, owner, JSON.stringify(s.draft), JSON.stringify(s.plan)],
  );
});
after(async () => {
  await db.close();
});
test("migration persists answers and atomically rejects stale concurrent writes with an audit event", async () => {
  const draft = session().draft;
  draft.context!.preserve = "Conservar texto original";
  const call = () =>
    db.query("select (save_onboarding($1,1,$2,'draft_saved',$3)).version", [
      ba,
      JSON.stringify({ draft }),
      owner,
    ]);
  const writes = await Promise.allSettled([call(), call()]);
  assert.equal(writes.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(
    (
      await db.query<{ value: string }>(
        "select draft#>>'{context,preserve}' as value from onboarding_sessions where id=$1",
        [ba],
      )
    ).rows[0].value,
    "Conservar texto original",
  );
  assert.equal(
    (
      await db.query("select * from onboarding_events where session_id=$1", [
        ba,
      ])
    ).rows.length,
    1,
  );
});
test("Data API roles cannot read tokens or bypass the session/approval RPC", async () => {
  for (const role of ["anon", "authenticated"]) {
    await db.exec("set role " + role);
    try {
      for (const table of [
        "onboarding_sessions",
        "onboarding_credentials",
        "onboarding_oauth_states",
        "ghl_sessions",
        "wizard_drafts",
        "diagnostic_records",
        "contact_leads",
        "onboarding_form_outbox",
      ])
        await assert.rejects(
          db.query("select * from " + table),
          /permission denied/,
        );
      await assert.rejects(
        db.query("select save_onboarding($1,2,'{}','fake','fake')", [ba]),
        /permission denied/,
      );
    } finally {
      await db.exec("reset role");
    }
  }
});
test("one location cannot be assigned to two BAs; initial records have no trial clock", async () => {
  await db.query("update onboarding_sessions set provision=$1 where id=$2", [
    JSON.stringify({ status: "configured", locationId: "test-loc" }),
    ba,
  ]);
  await assert.rejects(
    db.query(
      "insert into onboarding_sessions(owner_user_id,provision) values ($1,$2)",
      [other, JSON.stringify({ status: "configured", locationId: "test-loc" })],
    ),
    /duplicate key/,
  );
  assert.equal(
    (
      await db.query<{ trial_ends_at: string | null }>(
        "select trial_ends_at from businesses where id=$1",
        [ba],
      )
    ).rows[0].trial_ends_at,
    null,
  );
  assert.equal(
    (
      await db.query<{ commercial_trial_started_at: string | null }>(
        "select commercial_trial_started_at from onboarding_sessions where id=$1",
        [ba],
      )
    ).rows[0].commercial_trial_started_at,
    null,
  );
});
test("trial ledger starts once even if the functional-ready event is retried", async () => {
  const start = "2026-11-05T12:00:00Z";
  let version = Number(
    (
      await db.query<{ version: number }>(
        "select version from onboarding_sessions where id=$1",
        [ba],
      )
    ).rows[0].version,
  );
  for (const time of [start, "2026-11-07T00:00:00Z"]) {
    await db.query(
      "select (save_onboarding($1,$2,$3,'functional_ready_trial_authorized',$4)).id",
      [ba, version++, JSON.stringify({ functional_ready_at: time }), owner],
    );
  }
  const row = (
    await db.query<{ commercial_trial_started_at: string; days: string }>(
      "select commercial_trial_started_at, extract(epoch from commercial_trial_ends_at-commercial_trial_started_at)/86400 as days from onboarding_sessions where id=$1",
      [ba],
    )
  ).rows[0];
  assert.equal(
    new Date(String(row.commercial_trial_started_at)).toISOString(),
    new Date(start).toISOString(),
  );
  assert.equal(Number(row.days), 14);
});
test("AI reservations reject no consent, other owner and competing requests over cap", async () => {
  const reserve = (user: string) =>
    db.query(
      "select reserve_10x_ai($1,$2,'fixture','fixture-model','fixture-task',0.6)",
      [ba, user],
    );
  await assert.rejects(reserve(owner), /budget_not_authorized/);
  await db.query(
    "insert into onboarding_ai_budgets values ($1,1,'fixture consent',now()+interval '1 hour')",
    [ba],
  );
  await assert.rejects(reserve(other), /budget_not_authorized/);
  const requests = await Promise.allSettled([reserve(owner), reserve(owner)]);
  assert.equal(requests.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(
    Number(
      (
        await db.query<{ cost: string }>(
          "select sum(cost_usd) as cost from ai_usage",
        )
      ).rows[0].cost,
    ),
    0.6,
  );
});
test("form queue is empty before opt-in, scoped per source and deduplicates repeated email", async () => {
  const insert = (source: string) =>
    db.query(
      "insert into contact_leads(name,email,source,service_type) values ('Prueba','synthetic@example.test',$1,'mvp')",
      [source],
    );
  const count = async () =>
    Number(
      (
        await db.query<{ n: string }>(
          "select count(*) as n from onboarding_form_outbox",
        )
      ).rows[0].n,
    );
  await insert("dev_contact");
  assert.equal(await count(), 0);
  const s = session();
  s.plan!.modules.find((m) => m.id === "forms")!.consent = {
    actorId: owner,
    at: s.created_at,
    scope: "prepare_forms_no_paid_services",
    planVersion: 1,
  };
  await db.query("update onboarding_sessions set plan=$1 where id=$2", [
    JSON.stringify(s.plan),
    ba,
  ]);
  await db.query(
    "insert into onboarding_form_routes values ('dev_contact',$1,'test-loc','field','fixture authorized',true)",
    [ba],
  );
  await insert("growth_contact");
  await insert("dev_contact");
  await insert("dev_contact");
  assert.equal(await count(), 1);
});
test("one-time OAuth state and identified webhook replay are consumed once", async () => {
  await db.query(
    "insert into onboarding_oauth_states(nonce_hash,session_id,actor_id,expires_at) values ('fixture',$1,$2,now()+interval '1 minute')",
    [ba, owner],
  );
  const claim = async (user: string) =>
    db.query(
      "update onboarding_oauth_states set consumed_at=now() where nonce_hash='fixture' and actor_id=$1 and consumed_at is null and expires_at>now() returning session_id",
      [user],
    );
  assert.equal((await claim(other)).rows.length, 0);
  assert.equal((await claim(owner)).rows.length, 1);
  assert.equal((await claim(owner)).rows.length, 0);
  await db.query(
    "insert into onboarding_webhooks values ('fixture',$1,'ContactCreate',now())",
    [ba],
  );
  await assert.rejects(
    db.query(
      "insert into onboarding_webhooks values ('fixture',$1,'ContactCreate',now())",
      [ba],
    ),
    /duplicate key/,
  );
});
