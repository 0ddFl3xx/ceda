import { readFile } from "node:fs/promises";
import { config } from "dotenv";
config({ path: ".env.local" });

const [{ db }, { sql }] = await Promise.all([import("./index"), import("drizzle-orm")]);
const journal = JSON.parse(await readFile("drizzle/meta/_journal.json", "utf8")) as {
  entries: { idx: number }[];
};
let snapshotText: string | undefined;
for (const entry of [...journal.entries].reverse()) {
  try {
    snapshotText = await readFile(`drizzle/meta/${String(entry.idx).padStart(4, "0")}_snapshot.json`, "utf8");
    break;
  } catch { /* Hand-authored compatibility migrations may not have a snapshot. */ }
}
if (!snapshotText) throw new Error("No migration snapshot could be found.");
const snapshot = JSON.parse(snapshotText) as {
  tables: Record<string, { columns: Record<string, unknown> }>;
};

try {
  const migrationTables = await db.execute(sql`select table_schema from information_schema.tables where table_name = '__drizzle_migrations'`);
  for (const migrationTable of migrationTables.rows) {
    const schemaName = String(migrationTable.table_schema).replaceAll('"', '""');
    const history = await db.execute(sql.raw(`select id, created_at from "${schemaName}"."__drizzle_migrations" order by created_at`));
    console.info("Applied migration history:", history.rows.map((row) => ({ id: row.id, createdAt: row.created_at })));
  }
  const result = await db.execute(sql`select table_name, column_name from information_schema.columns where table_schema = 'public' order by table_name, ordinal_position`);
  const actual = new Map<string, Set<string>>();
  for (const row of result.rows) {
    const tableName = String(row.table_name);
    const columns = actual.get(tableName) ?? new Set<string>();
    columns.add(String(row.column_name));
    actual.set(tableName, columns);
  }

  const mismatches: string[] = [];
  for (const [qualifiedName, table] of Object.entries(snapshot.tables)) {
    const tableName = qualifiedName.split(".").at(-1) ?? qualifiedName;
    const actualColumns = actual.get(tableName);
    if (!actualColumns) {
      mismatches.push(`${tableName}: missing table`);
      continue;
    }
    const expectedColumns = new Set(Object.keys(table.columns));
    const missing = [...expectedColumns].filter((column) => !actualColumns.has(column));
    const extra = [...actualColumns].filter((column) => !expectedColumns.has(column) && !(tableName === "user" && ["phone_number", "phone_number_verified"].includes(column)));
    if (missing.length || extra.length) mismatches.push(`${tableName}: missing [${missing.join(", ")}], extra [${extra.join(", ")}]`);
  }
  const expectedTableNames = Object.keys(snapshot.tables).map((name) => name.split(".").at(-1) ?? name);
  const extraTables = [...actual.keys()].filter((name) => !expectedTableNames.includes(name) && name !== "__drizzle_migrations");
  console.info(`Baseline snapshot tables: ${expectedTableNames.length}; configured DB tables matching: ${expectedTableNames.length - mismatches.filter((item) => item.includes("missing table")).length}`);
  console.info("Schema baseline discrepancies:", mismatches.length ? mismatches : "none");
  console.info("Extra tables:", extraTables.length ? extraTables : "none");
} catch (error) {
  const cause = error as { name?: string; code?: string };
  console.error("Baseline inspection failed:", cause.name ?? "Error", cause.code ?? "");
  process.exitCode = 1;
} finally {
  await db.$client.end();
}
