import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { config } from "dotenv";

config({ path: ".env.local" });

const [{ db }, { sql }] = await Promise.all([import("./index"), import("drizzle-orm")]);
const migrationPath = "drizzle/0003_sectioned_submissions.sql";
const migrationSql = await readFile(migrationPath, "utf8");
const migrationHash = createHash("sha256").update(migrationSql).digest("hex");
const migrationTimestamp = 1795005000000;

try {
  const tableRows = await db.execute(sql`select table_name, column_name from information_schema.columns where table_schema = 'public' and table_name in ('form_fields', 'idea_versions')`);
  const columns = new Map<string, Set<string>>();
  for (const row of tableRows.rows) {
    const tableName = String(row.table_name);
    const found = columns.get(tableName) ?? new Set<string>();
    found.add(String(row.column_name));
    columns.set(tableName, found);
  }
  if (!columns.get("form_fields")?.has("position") || !columns.get("idea_versions")?.has("answers")) {
    throw new Error("The existing application tables do not match the expected schema baseline; no changes were applied.");
  }

  const [migrationTable] = (await db.execute(sql`select table_name from information_schema.tables where table_schema = 'drizzle' and table_name = '__drizzle_migrations'`)).rows;
  const history = migrationTable
    ? await db.execute(sql`select created_at from drizzle.__drizzle_migrations order by created_at desc limit 1`)
    : { rows: [] };
  const lastApplied = Number(history.rows[0]?.created_at ?? 0);
  const allNewColumnsPresent = columns.get("form_fields")?.has("section_key")
    && columns.get("form_fields")?.has("section_position")
    && columns.get("idea_versions")?.has("terms_accepted_at");
  if (lastApplied >= migrationTimestamp && !allNewColumnsPresent) {
    throw new Error("The migration history is newer than this migration but the expected columns are missing; no changes were applied.");
  }

  await db.transaction(async (tx) => {
    if (!columns.get("form_fields")?.has("section_key")) await tx.execute(sql`alter table public.form_fields add column section_key varchar(80) default 'general_information' not null`);
    if (!columns.get("form_fields")?.has("section_position")) await tx.execute(sql`alter table public.form_fields add column section_position integer default 0 not null`);
    if (!columns.get("idea_versions")?.has("terms_accepted_at")) await tx.execute(sql`alter table public.idea_versions add column terms_accepted_at timestamp with time zone`);
    await tx.execute(sql`create schema if not exists drizzle`);
    await tx.execute(sql`create table if not exists drizzle.__drizzle_migrations (id serial primary key, hash text not null, created_at bigint)`);
    if (lastApplied < migrationTimestamp) {
      await tx.execute(sql`insert into drizzle.__drizzle_migrations (hash, created_at) values (${migrationHash}, ${migrationTimestamp})`);
    }
  });
  console.info("Applied sectioned submission schema migration (3 additive columns); migration history was synchronized without replaying earlier baseline migrations.");
} catch (error) {
  console.error("Sectioned submission migration failed:", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
} finally {
  await db["$client"].end();
}
