// Read-only server check plus denied anonymous operations. Preview only.
import assert from "node:assert/strict";

assert.equal(process.env.VERCEL_ENV, "preview");
const origin = "https://rasnxpsmzmdyradclxtb.supabase.co";
assert.equal(process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, ""), origin);
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert.ok(anon && service, "Database credentials missing");

async function request(path, key, method = "GET", body) {
  return fetch(origin + "/rest/v1/" + path, {
    method,
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "error",
    signal: AbortSignal.timeout(12_000),
  });
}

const server = await request("onboarding_sessions?select=id&limit=1", service);
assert.equal(server.status, 200, "Server cannot access onboarding schema");
console.log("SUPABASE_QA_SERVER_READ", server.status);
const names = ["sessions", "events", "credentials", "oauth_states", "webhooks", "reviewers", "ai_budgets", "form_routes", "form_outbox"];
for (const name of names) {
  const response = await request("onboarding_" + name + "?select=*&limit=1", anon);
  assert.ok([401, 403].includes(response.status), "Anonymous table read not denied: " + name);
  assert.equal((await response.json()).code, "42501", "Unexpected denial for " + name);
}
// A nonexistent synthetic ID is an extra guard even if an ACL regresses.
const absent = "00000000-0000-0000-0000-000000000053";
for (const table of ["onboarding_sessions", "contact_leads"]) {
  const response = await request(table + "?id=eq." + absent, anon, "DELETE");
  assert.ok([401, 403].includes(response.status), "Anonymous delete not denied: " + table);
  assert.equal((await response.json()).code, "42501");
}
const update = await request("onboarding_sessions?id=eq." + absent, anon, "PATCH", { draft: {} });
assert.ok([401, 403].includes(update.status), "Anonymous update not denied");
assert.equal((await update.json()).code, "42501");
console.log("SUPABASE_QA_ANON_DENIED", "9 reads, 2 deletes, 1 update");
