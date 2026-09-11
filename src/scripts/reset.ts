import "dotenv/config";
import { pool } from "../db";
import { assertLocalDatabase } from "./local-db";

/**
 * Destructive reset for local dev only — drops and recreates the public schema,
 * then expects `npm run db:migrate && npm run db:seed` to restore.
 */
async function main() {
  assertLocalDatabase();

  const client = await pool.connect();
  try {
    await client.query("DROP SCHEMA public CASCADE");
    await client.query("CREATE SCHEMA public");
    // Drizzle tracks applied migrations in `drizzle` schema — drop it too so
    // `migrate()` re-applies from scratch (otherwise it skips as "already applied")
    await client.query("DROP SCHEMA IF EXISTS drizzle CASCADE");
    // Re-enable extensions that the init script installs on first start
    await client.query("CREATE EXTENSION IF NOT EXISTS pgcrypto");
    await client.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");
    console.info("[db] schemas dropped and recreated (extensions restored)");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error("[db] reset failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
