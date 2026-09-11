import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "../db";
import { assertLocalDatabase } from "./local-db";

async function main() {
  // Guard — refuse shared/staging/prod hosts before touching schema
  assertLocalDatabase();

  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.info("[db] migrations applied");
  } catch (error) {
    console.error("[db] migration failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
