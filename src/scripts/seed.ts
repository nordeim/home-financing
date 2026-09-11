import "dotenv/config";
import { pool } from "../db";
import { ensureSeeded } from "../lib/ensure-seeded";
import { assertLocalDatabase } from "./local-db";

async function main() {
  // Guard — seed is dev-only
  assertLocalDatabase();

  try {
    await ensureSeeded();
    // ensureSeeded is idempotent — second run is a noop (count(lenders) > 0 early return)
    console.info("[db] seed complete (idempotent — re-running is safe)");
  } catch (error) {
    console.error("[db] seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

main();
