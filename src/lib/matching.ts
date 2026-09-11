import { LENDER_SEEDS, type LenderSeed } from "@/lib/lenders";

export interface ApplicationInput {
  fullName: string;
  email: string;
  phone: string;
  zipCode: string;
  propertyIntent: string;
  homeType: string;
  landStatus: string;
  manufacturerKnown: boolean | null;
  manufacturerSlug?: string;
  creditRange: string;
  incomeRange: string;
  budget: string;
  timeline: string;
}

export interface LenderMatch {
  lender: LenderSeed;
  estimatedRate: number;
  estimatedPayment: number;
  matchScore: number;
  rationale: string;
}

const CREDIT_FLOOR: Record<string, number> = {
  excellent: 720,
  good: 680,
  fair: 620,
  needs_work: 580,
  not_sure: 640,
};

const BUDGET_MID: Record<string, number> = {
  under_150k: 120_000,
  "150k_250k": 200_000,
  "250k_400k": 325_000,
  "400k_600k": 500_000,
  "600k_plus": 750_000,
};

function creditValue(range: string): number {
  return CREDIT_FLOOR[range] ?? 640;
}

function budgetValue(range: string): number {
  return BUDGET_MID[range] ?? 250_000;
}

function baseRate(credit: number): number {
  if (credit >= 720) return 6.15;
  if (credit >= 680) return 6.45;
  if (credit >= 640) return 6.85;
  if (credit >= 620) return 7.15;
  return 7.55;
}

export function matchLenders(input: ApplicationInput): LenderMatch[] {
  const credit = creditValue(input.creditRange);
  const price = budgetValue(input.budget);
  const down = Math.round(price * 0.1);
  const loan = price - down;

  const scored = LENDER_SEEDS.map((lender) => {
    let score = 50;
    const reasons: string[] = [];

    if (credit >= lender.minCredit) {
      score += 20;
    } else {
      score -= 25;
      reasons.push("Credit may need a manual underwrite");
    }

    if (lender.specialties.includes(input.homeType)) {
      score += 18;
      reasons.push(`Experienced with ${input.homeType} construction`);
    }

    if (input.homeType === "adu" && lender.specialties.includes("adu")) {
      score += 10;
    }

    if (input.landStatus === "own_land" && lender.specialties.includes("construction")) {
      score += 8;
      reasons.push("Construction-to-perm draw schedule available");
    }

    if (lender.greenMortgage && (input.homeType === "modular" || input.homeType === "prefab")) {
      score += 12;
      reasons.push("Green mortgage discount likely");
    }

    if (input.propertyIntent === "refinance" && lender.specialties.includes("conventional")) {
      score += 6;
    }

    const rate = Math.max(5.4, baseRate(credit) - lender.rateDiscountBps / 100);
    const monthlyRate = rate / 100 / 12;
    const n = 360;
    const payment =
      loan <= 0
        ? 0
        : Math.round((loan * monthlyRate * (1 + monthlyRate) ** n) / ((1 + monthlyRate) ** n - 1));

    if (reasons.length === 0) {
      reasons.push("Active prefab lending desk and national footprint");
    }

    return {
      lender,
      estimatedRate: Math.round(rate * 1000) / 1000,
      estimatedPayment: payment,
      matchScore: Math.max(0, Math.min(99, score)),
      rationale: reasons.slice(0, 2).join(". ") + ".",
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateApplication(input: ApplicationInput): string[] {
  const errors: string[] = [];
  if (input.fullName.trim().length < 2) errors.push("Please enter your name.");
  if (!EMAIL_RE.test(input.email.trim())) errors.push("Please enter a valid email address.");
  if (input.phone.replace(/\D/g, "").length < 10) errors.push("Please enter a valid phone number.");
  if (!/^\d{5}$/.test(input.zipCode)) errors.push("Please enter a valid 5-digit ZIP code.");
  if (!input.propertyIntent) errors.push("Select what you want to do.");
  if (!input.homeType) errors.push("Select a home type.");
  if (!input.landStatus) errors.push("Select your land situation.");
  if (!input.creditRange) errors.push("Select a credit range.");
  if (!input.incomeRange) errors.push("Select an income range.");
  if (!input.budget) errors.push("Select a budget.");
  if (!input.timeline) errors.push("Select a timeline.");
  return errors;
}
