"use client";

import { Button, ButtonLink } from "@/components/ui";
import {
  calculatePayment,
  DEFAULT_CALCULATOR,
  formatUsd,
  formatUsdPrecise,
  type PaymentBreakdown,
  type PaymentInput,
} from "@/lib/calculator";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

function Field({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm font-medium">
        {label}
        <span className="tabular-nums text-muted-foreground">
          {prefix}
          {prefix ? formatUsd(value).replace("$", "") : value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-primary"
      />
    </label>
  );
}

export function CalculatorApp() {
  const [input, setInput] = useState<PaymentInput>(DEFAULT_CALCULATOR);
  const result: PaymentBreakdown = useMemo(() => calculatePayment(input), [input]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <form className="space-y-6 rounded-2xl border border-border bg-card p-6 md:p-8" onSubmit={(event) => event.preventDefault()}>
        <Field
          label="Home price"
          value={input.homePrice}
          min={50000}
          max={1500000}
          step={5000}
          prefix="$"
          onChange={(homePrice) =>
            setInput((current) => ({
              ...current,
              homePrice,
              downPayment: Math.min(current.downPayment, homePrice),
            }))
          }
        />
        <Field
          label="Down payment"
          value={input.downPayment}
          min={0}
          max={input.homePrice}
          step={1000}
          prefix="$"
          onChange={(downPayment) => setInput((current) => ({ ...current, downPayment }))}
        />
        <Field
          label="Interest rate"
          value={input.annualRate}
          min={3}
          max={12}
          step={0.125}
          suffix="%"
          onChange={(annualRate) => setInput((current) => ({ ...current, annualRate }))}
        />
        <div>
          <p className="mb-2 text-sm font-medium">Loan term</p>
          <div className="flex gap-2">
            {[15, 20, 30].map((term) => (
              <Button
                key={term}
                variant={input.termYears === term ? "primary" : "outline"}
                onClick={() => setInput((current) => ({ ...current, termYears: term }))}
              >
                {term} years
              </Button>
            ))}
          </div>
        </div>
        <Field
          label="Property tax rate"
          value={input.annualTaxRate}
          min={0.2}
          max={3}
          step={0.05}
          suffix="%"
          onChange={(annualTaxRate) => setInput((current) => ({ ...current, annualTaxRate }))}
        />
        <Field
          label="Homeowners insurance / year"
          value={input.annualInsurance}
          min={400}
          max={8000}
          step={50}
          prefix="$"
          onChange={(annualInsurance) => setInput((current) => ({ ...current, annualInsurance }))}
        />
        <Field
          label="HOA / month"
          value={input.hoaMonthly}
          min={0}
          max={800}
          step={10}
          prefix="$"
          onChange={(hoaMonthly) => setInput((current) => ({ ...current, hoaMonthly }))}
        />
      </form>

      <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
        <p className="text-sm uppercase tracking-wider text-primary-foreground/70">Estimated payment</p>
        <p className="mt-2 font-display text-5xl font-bold">{formatUsd(result.monthlyTotal)}/month</p>
        <p className="mt-2 text-sm text-primary-foreground/70">
          Loan amount {formatUsd(result.loanAmount)} · {(result.downPaymentPct * 100).toFixed(0)}% down
        </p>
        <dl className="mt-8 space-y-3 text-sm">
          {[
            ["Principal & interest", result.monthlyPi],
            ["Property taxes", result.monthlyTax],
            ["Insurance", result.monthlyInsurance],
            ["PMI", result.monthlyPmi],
            ["HOA", result.monthlyHoa],
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between border-b border-white/10 pb-2">
              <dt className="text-primary-foreground/70">{label}</dt>
              <dd className="font-medium">{formatUsdPrecise(Number(value))}</dd>
            </div>
          ))}
        </dl>
        {result.monthlyPmi > 0 ? (
          <p className="mt-6 text-sm text-primary-foreground/80">
            With less than 20% down, you&apos;ll pay private mortgage insurance. Increase your down payment to{" "}
            {formatUsd(Math.round(result.principal * 0.2))} to eliminate PMI.
          </p>
        ) : (
          <p className="mt-6 text-sm text-primary-foreground/80">No PMI — you&apos;re at or above 20% down.</p>
        )}
        <div className="mt-8 rounded-xl bg-white/10 p-4">
          <p className="text-sm font-semibold">Modular Home Savings</p>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Modular homes typically cost 10–20% less than site-built homes. A comparable site-built home might cost{" "}
            {formatUsd(result.siteBuiltComparePrice)} or more — about {formatUsd(result.monthlySavingsVsSiteBuilt)} extra
            per month.
          </p>
        </div>
        <ButtonLink href="/get-started" variant="secondary" className="mt-8 w-full" size="lg">
          Get Pre-Qualified Now
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </div>
    </div>
  );
}
