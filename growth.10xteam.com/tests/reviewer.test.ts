import assert from "node:assert/strict";
import { test } from "node:test";
import { scopeReviewer } from "../src/lib/onboarding/reviewer";
import { ownsSession } from "../src/lib/onboarding/model";
import { actor, ba, owner, other, session } from "./fixtures";
import { readFile } from "node:fs/promises";
import { setupDb } from "./schema-db";

test("even an allowlisted owner can verify only the explicitly assigned business", async () => {
  const operator = { ...actor, userId: owner, operator: true };
  assert.ok(ownsSession(operator, { ...session(), owner_user_id: owner }));
  assert.equal((await scopeReviewer(operator, ba, async () => null)).operator, false);
  assert.equal((await scopeReviewer(operator, ba, async () => ({session_id: other, user_id: owner}))).operator, false);
  assert.equal((await scopeReviewer(operator, ba, async () => ({session_id: ba, user_id: other}))).operator, false);
  const assigned = await scopeReviewer(operator, ba, async (id, user) => ({session_id: id, user_id: user}));
  assert.equal(assigned.operator, true);
  assert.equal((await scopeReviewer(operator, other, async () => ({session_id: ba, user_id: owner}))).operator, false);
  for (const principal of [{...operator, operator: false}, {...operator, userId: null}]) {
    assert.equal((await scopeReviewer(principal, ba, async () => {throw new Error("must not look up");})).operator, false);
  }
  await assert.rejects(scopeReviewer(operator, ba, async () => {throw new Error("database unavailable");}), /database unavailable/);
});

test("proposed reviewer SQL assigns only the verified Dev plan and refuses stale or bound plans", async () => {
  const db = await setupDb("20261109173128_intelligent_onboarding.sql");
  const id = "0b624aa6-7db1-46f2-b713-29481273c1ab";
  const user = "e89ff5d8-ace9-4e44-b3ff-69b9bb350ec9";
  const sql = await readFile("docs/onboarding/grant-dev-lab-reviewer.sql", "utf8");
  try {
    await db.query("insert into auth.users values ($1), ($2)", [user, other]);
    await db.query("insert into onboarding_sessions(id,owner_user_id,draft,plan) values ($1,$2,$3,$4)",
      [id, user, JSON.stringify({answers:{step2:{businessName:"10xTeam Dev"}}}), JSON.stringify({version:9})]);
    await db.exec(sql);
    await db.exec(sql);
    assert.deepEqual((await db.query("select session_id, user_id from onboarding_reviewers")).rows,
      [{session_id:id, user_id:user}]);
    for (const patch of [
      {plan:{version:8}},
      {owner_user_id:other},
      {provision:{status:"waiting_provider",locationId:"another-location"}},
    ]) {
      await db.exec("begin");
      for (const [key, value] of Object.entries(patch)) {
        await db.query(`update onboarding_sessions set ${key}=$1 where id=$2`,
          [typeof value === "string" ? value : JSON.stringify(value), id]);
      }
      // Strip the outer transaction only for this isolated rollback test.
      await assert.rejects(db.exec(sql.replace(/^begin;$/m, "").replace(/^commit;$/m, "")),
        /verified unbound Dev plan 9/);
      await db.exec("rollback");
    }
    assert.equal((await db.query("select * from onboarding_reviewers")).rows.length, 1);
  } finally {
    await db.close();
  }
});
