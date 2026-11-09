import assert from "node:assert/strict";
import { test } from "node:test";
import { scopeReviewer } from "../src/lib/onboarding/reviewer";
import { ownsSession } from "../src/lib/onboarding/model";
import { actor, ba, owner, other, session } from "./fixtures";

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
