import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
export async function setupDb(lastMigration?: string) {
  const database = await PGlite.create();
  await database.exec(
    "create schema auth;create table auth.users(id uuid primary key);create role anon;create role authenticated;create role service_role bypassrls;create function auth.uid() returns uuid language sql stable as 'select null::uuid';",
  );
  for (const file of (await readdir("docs/project/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort())
    await database.exec(
      await readFile("docs/project/migrations/" + file, "utf8"),
    );
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql") && (!lastMigration || f <= lastMigration))
    .sort())
    await database.exec(await readFile("supabase/migrations/" + file, "utf8"));
  return database;
}
