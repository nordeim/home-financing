import { calculatePayment, type PaymentInput } from "@/lib/calculator";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function num(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export async function POST(request: Request) {
  if (!rateLimit(`calc:${clientKey(request)}`, 60, 60 * 1000)) {
    return Response.json({ error: "Too many calculations." }, { status: 429 });
  }

  let json: unknown = {};
  try {
    json = await request.json();
  } catch {
    json = {};
  }
  const record = json && typeof json === "object" ? (json as Record<string, unknown>) : {};
  const input: PaymentInput = {
    homePrice: num(record.homePrice, 250000, 10_000, 5_000_000),
    downPayment: num(record.downPayment, 25000, 0, 5_000_000),
    annualRate: num(record.annualRate, 6.5, 0, 25),
    termYears: num(record.termYears, 30, 5, 40),
    annualTaxRate: num(record.annualTaxRate, 1.1, 0, 5),
    annualInsurance: num(record.annualInsurance, 1800, 0, 50_000),
    hoaMonthly: num(record.hoaMonthly, 0, 0, 5_000),
  };

  return Response.json(calculatePayment(input));
}
