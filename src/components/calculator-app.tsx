"use client";

import { Button, ButtonLink, cn } from "@/components/ui";
import {
  calculatePayment,
  DEFAULT_CALCULATOR,
  formatUsd,
  formatUsdPrecise,
  type PaymentBreakdown,
  type PaymentInput,
} from "@/lib/calculator";
import { AlertTriangle, ArrowRight, Leaf } from "lucide-react";
import { useMemo, useState } from "react";

function Field({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <span className="font-semibold tabular-nums">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-primary"
      />
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="flex items-center gap-2 font-display text-lg font-bold">
      <span className="h-4 w-1 rounded-full bg-accent" aria-hidden />
      {children}
    </h3>
  );
}

export function CalculatorApp() {
  const [input, setInput] = useState<PaymentInput>(DEFAULT_CALCULATOR);
  const result: PaymentBreakdown = useMemo(() => calculatePayment(input), [input]);

  const segments = [
    { label: "Principal & Interest", value: result.monthlyPi, color: "bg-primary" },
    { label: "Property Tax", value: result.monthlyTax, color: "bg-accent" },
    { label: "Insurance", value: result.monthlyInsurance, color: "bg-primary/50" },
    ...(result.monthlyPmi > 0 ? [{ label: "PMI", value: result.monthlyPmi, color: "bg-destructive/70" }] : []),
    ...(result.monthlyHoa > 0 ? [{ label: "HOA", value: result.monthlyHoa, color: "bg-muted-foreground/50" }] : []),
  ];
  const segmentTotal = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      {/* Inputs — grouped like the source: Home Details / Loan Terms / Taxes & Insurance */}
      <form
        className="space-y-8 rounded-2xl border border-border bg-card p-6 md:p-8"
        onSubmit={(event) => event.preventDefault()}
      >
        <section className="space-y-6">
          <SectionTitle>Home Details</SectionTitle>
          <Field
            id="calc-price"
            label="Home Price"
            value={input.homePrice}
            min={75_000}
            max={2_000_000}
            step={5_000}
            format={(value) => formatUsd(value)}
            hint="$75K – $2M — includes delivery and setup"
            onChange={(homePrice) =>
              setInput((current) => ({
                ...current,
                homePrice,
                downPayment: Math.min(current.downPayment, homePrice),
              }))
            }
          />
          <Field
            id="calc-down"
            label="Down Payment"
            value={input.downPayment}
            min={0}
            max={input.homePrice}
            step={1_000}
            format={(value) => `${formatUsd(value)} · ${Math.round((value / input.homePrice) * 100)}% of price`}
            hint="20% down eliminates PMI"
            onChange={(downPayment) => setInput((current) => ({ ...current, downPayment }))}
          />
        </section>

        <section className="space-y-6">
          <SectionTitle>Loan Terms</SectionTitle>
          <Field
            id="calc-rate"
            label="Interest Rate"
            value={input.annualRate}
            min={3}
            max={12}
            step={0.125}
            format={(value) => `${value.toFixed(3)}% APR`}
            onChange={(annualRate) => setInput((current) => ({ ...current, annualRate }))}
          />
          <div>
            <p className="text-sm font-medium">Loan Term</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[10, 15, 20, 25, 30].map((term) => (
                <Button
                  key={term}
                  variant={input.termYears === term ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setInput((current) => ({ ...current, termYears: term }))}
                >
                  {term} yr
                </Button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <SectionTitle>Taxes &amp; Insurance</SectionTitle>
          <Field
            id="calc-tax"
            label="Annual Property Tax"
            value={Math.round((input.homePrice * input.annualTaxRate) / 100)}
            min={0}
            max={25_000}
            step={100}
            format={(value) => formatUsd(value)}
            onChange={(annualTax) =>
              setInput((current) => ({
                ...current,
                annualTaxRate: Number((((annualTax / current.homePrice) * 100) || 0).toFixed(3)),
              }))
            }
          />
          <Field
            id="calc-insurance"
            label="Annual Homeowners Insurance"
            value={input.annualInsurance}
            min={400}
            max={8_000}
            step={50}
            format={(value) => formatUsd(value)}
            onChange={(annualInsurance) => setInput((current) => ({ ...current, annualInsurance }))}
          />
          <Field
            id="calc-hoa"
            label="HOA / month"
            value={input.hoaMonthly}
            min={0}
            max={800}
            step={10}
            format={(value) => `${formatUsd(value)}/mo`}
            onChange={(hoaMonthly) => setInput((current) => ({ ...current, hoaMonthly }))}
          />
        </section>
      </form>

      {/* Summary — sage card with stacked breakdown bar (source parity) */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-primary/15 bg-secondary/70 p-6 md:p-8">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Your Estimated Payment
          </span>
          <p className="mt-3 font-display text-5xl font-bold text-foreground">
            {formatUsd(Math.round(result.monthlyTotal))}
            <span className="text-lg font-semibold text-muted-foreground">/month</span>
          </p>

          <div
            className="mt-5 flex h-3 overflow-hidden rounded-full bg-border"
            role="img"
            aria-label="Monthly payment breakdown"
          >
            {segments.map((segment) => (
              <span
                key={segment.label}
                className={segment.color}
                style={{ width: `${(segment.value / segmentTotal) * 100}%` }}
              />
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            {segments.map((segment) => (
              <span key={segment.label} className="inline-flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", segment.color)} aria-hidden />
                {segment.label} <span className="font-semibold text-foreground">{formatUsdPrecise(segment.value)}</span>
              </span>
            ))}
          </div>

          <dl className="mt-6 rounded-xl border border-border bg-card p-5 text-sm">
            <p className="mb-3 font-display font-bold">Loan Summary</p>
            {[
              ["Loan Amount", formatUsd(result.loanAmount)],
              ["Down Payment", `${formatUsd(input.downPayment)} (${(result.downPaymentPct * 100).toFixed(0)}%)`],
              ["Interest Rate", `${input.annualRate.toFixed(3)}% APR`],
              ["Loan Term", `${input.termYears} years (${input.termYears * 12} payments)`],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-border/70 py-2 last:border-0 last:pb-0">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {result.monthlyPmi > 0 ? (
            <p className="mt-5 flex gap-2 rounded-xl border border-accent/40 bg-accent/10 p-4 text-sm text-accent-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>
                <strong>PMI Applied.</strong> Your {(result.downPaymentPct * 100).toFixed(0)}% down payment is below
                20%, so private mortgage insurance is added to your monthly payment. Increase your down payment to{" "}
                {formatUsd(Math.round(result.principal * 0.2))} to eliminate PMI.
              </span>
            </p>
          ) : (
            <p className="mt-5 flex gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                <strong>No PMI.</strong> You&apos;re at or above 20% down — no private mortgage insurance required.
              </span>
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-primary p-6 text-primary-foreground md:p-8">
          <p className="font-display font-bold">Modular Home Savings</p>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Modular homes typically cost 10–20% less than site-built homes. A comparable site-built home might cost{" "}
            {formatUsd(result.siteBuiltComparePrice)} — about {formatUsd(result.monthlySavingsVsSiteBuilt)} more per
            month ({formatUsdPrecise(result.siteBuiltMonthly)}/mo).
          </p>
          <ButtonLink href="/get-started" variant="onPrimary" className="mt-5 w-full" size="lg">
            Get Pre-Qualified Now
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
