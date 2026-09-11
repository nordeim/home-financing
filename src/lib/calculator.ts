export interface PaymentInput {
  homePrice: number;
  downPayment: number;
  annualRate: number;
  termYears: number;
  annualTaxRate: number;
  annualInsurance: number;
  hoaMonthly: number;
}

export interface PaymentBreakdown {
  principal: number;
  monthlyPi: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyPmi: number;
  monthlyHoa: number;
  monthlyTotal: number;
  loanAmount: number;
  downPaymentPct: number;
  siteBuiltComparePrice: number;
  siteBuiltMonthly: number;
  monthlySavingsVsSiteBuilt: number;
}

const PMI_ANNUAL_RATE = 0.0065;

function amortize(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const n = termYears * 12;
  if (monthlyRate === 0) return principal / n;
  const factor = (1 + monthlyRate) ** n;
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function calculatePayment(input: PaymentInput): PaymentBreakdown {
  const homePrice = Math.max(0, input.homePrice);
  const downPayment = Math.min(Math.max(0, input.downPayment), homePrice);
  const loanAmount = homePrice - downPayment;
  const downPaymentPct = homePrice === 0 ? 0 : downPayment / homePrice;
  const monthlyPi = amortize(loanAmount, input.annualRate, input.termYears);
  const monthlyTax = (homePrice * (input.annualTaxRate / 100)) / 12;
  const monthlyInsurance = input.annualInsurance / 12;
  const monthlyPmi = downPaymentPct < 0.2 ? (loanAmount * PMI_ANNUAL_RATE) / 12 : 0;
  const monthlyHoa = Math.max(0, input.hoaMonthly);
  const monthlyTotal = monthlyPi + monthlyTax + monthlyInsurance + monthlyPmi + monthlyHoa;
  const siteBuiltComparePrice = Math.round(homePrice * 1.15);
  const siteBuiltLoan = siteBuiltComparePrice - downPayment;
  const siteBuiltMonthly =
    amortize(siteBuiltLoan, input.annualRate, input.termYears) +
    (siteBuiltComparePrice * (input.annualTaxRate / 100)) / 12 +
    monthlyInsurance +
    (downPayment / siteBuiltComparePrice < 0.2 ? (siteBuiltLoan * PMI_ANNUAL_RATE) / 12 : 0) +
    monthlyHoa;

  return {
    principal: homePrice,
    monthlyPi: roundCents(monthlyPi),
    monthlyTax: roundCents(monthlyTax),
    monthlyInsurance: roundCents(monthlyInsurance),
    monthlyPmi: roundCents(monthlyPmi),
    monthlyHoa: roundCents(monthlyHoa),
    monthlyTotal: roundCents(monthlyTotal),
    loanAmount: roundCents(loanAmount),
    downPaymentPct,
    siteBuiltComparePrice,
    siteBuiltMonthly: roundCents(siteBuiltMonthly),
    monthlySavingsVsSiteBuilt: roundCents(siteBuiltMonthly - monthlyTotal),
  };
}

export function roundCents(value: number): number {
  return Math.round(value);
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUsdPrecise(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export const DEFAULT_CALCULATOR: PaymentInput = {
  homePrice: 250_000,
  downPayment: 25_000,
  annualRate: 6.5,
  termYears: 30,
  annualTaxRate: 1.1,
  annualInsurance: 1_800,
  hoaMonthly: 0,
};
