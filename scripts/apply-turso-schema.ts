import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";

function readEnvFile() {
  try {
    const envText = readFileSync(".env", "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      process.env[key] ??= rawValue.replace(/^"|"$/g, "");
    }
  } catch {
    // Environment variables may already be provided by the deployment runtime.
  }
}

function migrationStatements(sql: string) {
  return sql
    .split(";")
    .map((statement) =>
      statement
        .split(/\r?\n/)
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter(Boolean);
}

async function main() {
  readEnvFile();

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set.");
  }

  const client = createClient({ url, authToken });
  const sql = readFileSync("prisma/migrations/20260613124000_init/migration.sql", "utf8");

  for (const statement of migrationStatements(sql)) {
    try {
      await client.execute(statement);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes("already exists")) throw error;
    }
  }

  client.close();
  console.log("Applied Turso schema.");
}

void main();
