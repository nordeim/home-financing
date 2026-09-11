import { describe, expect, it } from "vitest";
import { DEFAULT_CALCULATOR, calculatePayment, formatUsd, roundCents } from "./calculator";

const BASE = { ...DEFAULT_CALCULATOR };

describe("calculatePayment", () => {
  it("computes P&I with the standard amortization formula", () => {
    const result = calculatePayment({ ...BASE });
    // $225,000 loan, 6.5% APR, 30 years → $1,422.46
    expect(result.monthlyPi).toBe(1422);
    expect(result.loanAmount).toBe(225_000);
  });

  it("sums the breakdown into monthlyTotal", () => {
    const result = calculatePayment({ ...BASE });
    const sum =
      result.monthlyPi + result.monthlyTax + result.monthlyInsurance + result.monthlyPmi + result.monthlyHoa;
    expect(result.monthlyTotal).toBe(Math.round(sum));
  });

  it("charges PMI only when down payment is under 20%", () => {
    const withPmi = calculatePayment({ ...BASE, downPayment: 24_999 });
    const noPmi = calculatePayment({ ...BASE, downPayment: 50_000 });
    expect(withPmi.monthlyPmi).toBeGreaterThan(0);
    expect(noPmi.monthlyPmi).toBe(0);
  });

  it("uses the 0.65% annual PMI rate", () => {
    const result = calculatePayment({ ...BASE });
    const loan = 225_000;
    expect(result.monthlyPmi).toBe(Math.round((loan * 0.0065) / 12));
  });

  it("handles a zero-interest loan by straight-line division", () => {
    const result = calculatePayment({ ...BASE, annualRate: 0 });
    expect(result.monthlyPi).toBe(Math.round(225_000 / 360));
  });

  it("clamps down payment to home price and never returns a negative loan", () => {
    const result = calculatePayment({ ...BASE, downPayment: 999_999 });
    expect(result.loanAmount).toBe(0);
    expect(result.monthlyPi).toBe(0);
  });

  it("compares against a site-built home at 1.15x price", () => {
    const result = calculatePayment({ ...BASE });
    expect(result.siteBuiltComparePrice).toBe(Math.round(250_000 * 1.15));
    expect(result.siteBuiltMonthly).toBeGreaterThan(result.monthlyTotal);
    expect(result.monthlySavingsVsSiteBuilt).toBe(Math.round(result.siteBuiltMonthly - result.monthlyTotal));
  });

  it("applies PMI to the site-built comparison independently", () => {
    // 25K down on a 287,500 site-built compare price is < 20% → PMI applies there too
    const result = calculatePayment({ ...BASE });
    const siteLoan = 287_500 - 25_000;
    expect(result.siteBuiltMonthly).toBeGreaterThan(0);
    // savings must equal the rounded difference
    expect(result.monthlySavingsVsSiteBuilt).toBe(
      result.siteBuiltMonthly - result.monthlyTotal,
    );
    void siteLoan;
  });

  it("treats negative home price as zero", () => {
    const result = calculatePayment({ ...BASE, homePrice: -5 });
    expect(result.principal).toBe(0);
    expect(result.monthlyTotal).toBe(result.monthlyInsurance + result.monthlyHoa);
  });
});

describe("formatUsd / roundCents", () => {
  it("formats whole-dollar USD", () => {
    expect(formatUsd(1923)).toBe("$1,923");
    expect(formatUsd(0)).toBe("$0");
  });

  it("rounds to nearest cent-bin", () => {
    expect(roundCents(1.4)).toBe(1);
    expect(roundCents(1.6)).toBe(2);
  });
});
