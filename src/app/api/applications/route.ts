import { db } from "@/db";
import { applicationMatches, applications, lenders } from "@/db/schema";
import { ensureSeeded } from "@/lib/ensure-seeded";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { matchLenders, validateApplication, type ApplicationInput } from "@/lib/matching";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parseBody(value: unknown): ApplicationInput {
  const record = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    fullName: asString(record.fullName).trim().slice(0, 120),
    email: asString(record.email).trim().toLowerCase().slice(0, 254),
    phone: asString(record.phone).trim().slice(0, 32),
    zipCode: asString(record.zipCode).replace(/\D/g, "").slice(0, 5),
    propertyIntent: asString(record.propertyIntent).slice(0, 32),
    homeType: asString(record.homeType).slice(0, 32),
    landStatus: asString(record.landStatus).slice(0, 32),
    manufacturerKnown: typeof record.manufacturerKnown === "boolean" ? record.manufacturerKnown : null,
    manufacturerSlug: asString(record.manufacturerSlug).slice(0, 80) || undefined,
    creditRange: asString(record.creditRange).slice(0, 32),
    incomeRange: asString(record.incomeRange).slice(0, 32),
    budget: asString(record.budget).slice(0, 32),
    timeline: asString(record.timeline).slice(0, 32),
  };
}

export async function POST(request: Request) {
  if (!rateLimit(`app:${clientKey(request)}`, 8, 10 * 60 * 1000)) {
    return Response.json({ error: "Too many applications from this network. Try again shortly." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const input = parseBody(json);
  const errors = validateApplication(input);
  if (errors.length > 0) {
    return Response.json({ error: errors[0] }, { status: 400 });
  }

  await ensureSeeded();
  const matches = matchLenders(input);

  const [row] = await db
    .insert(applications)
    .values({
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      zipCode: input.zipCode,
      propertyIntent: input.propertyIntent,
      homeType: input.homeType,
      landStatus: input.landStatus,
      manufacturerKnown: input.manufacturerKnown,
      manufacturerSlug: input.manufacturerSlug,
      creditRange: input.creditRange,
      incomeRange: input.incomeRange,
      budget: input.budget,
      timeline: input.timeline,
      status: "matched",
    })
    .returning({ id: applications.id });

  if (!row) {
    return Response.json({ error: "Could not save application." }, { status: 500 });
  }

  for (const match of matches) {
    const [lender] = await db.select({ id: lenders.id }).from(lenders).where(eq(lenders.slug, match.lender.slug)).limit(1);
    if (!lender) continue;
    await db.insert(applicationMatches).values({
      applicationId: row.id,
      lenderId: lender.id,
      estimatedRate: match.estimatedRate.toFixed(3),
      estimatedPayment: match.estimatedPayment,
      matchScore: match.matchScore,
      rationale: match.rationale,
    });
  }

  return Response.json({ id: row.id, matches });
}
