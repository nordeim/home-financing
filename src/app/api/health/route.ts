import { db } from "@/db";
import { ensureSeeded } from "@/lib/ensure-seeded";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    await ensureSeeded();
    return Response.json({ ok: true, status: "ok", db: true });
  } catch {
    return Response.json({ ok: false, status: "error", db: false }, { status: 500 });
  }
}
