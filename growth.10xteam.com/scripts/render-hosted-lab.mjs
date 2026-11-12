// Generate a fresh private test schema using definitions only.
import { readFileSync, readdirSync } from "node:fs";
const schema = "tenx_wizard_lab";
const baseline = [
  "businesses",
  "ai_usage",
  "plan_ai_allowances",
  "wizard_drafts",
  "diagnostic_records",
  "ghl_sessions",
  "contact_leads",
];
const statements = [
  `create schema ${schema};`,
  `revoke all on schema ${schema} from public, anon, authenticated;`,
  `grant usage on schema ${schema} to service_role;`,
];
for (const table of baseline) {
  statements.push(
    `create table ${schema}.${table} (like public.${table} including defaults including constraints including indexes);`,
    `alter table ${schema}.${table} enable row level security;`,
    `revoke all on ${schema}.${table} from public, anon, authenticated;`,
  );
}
for (const file of readdirSync("supabase/migrations")
  .filter((name) => name.endsWith(".sql"))
  .sort()) {
  const sql = readFileSync("supabase/migrations/" + file, "utf8");
  statements.push(
    sql
      .replaceAll("public.", schema + ".")
      .replaceAll("schemaname='public'", `schemaname='${schema}'`),
  );
}
process.stdout.write(statements.join("\n"));
