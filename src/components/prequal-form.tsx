"use client";

import { Button, cn } from "@/components/ui";
import type { ApplicationInput, LenderMatch } from "@/lib/matching";
import { ArrowLeft, ArrowRight, Check, Home, Landmark, RefreshCw, Shield } from "lucide-react";
import { useMemo, useState } from "react";

const INTENTS = [
  { value: "buy", label: "Buy a prefab home", description: "Purchase a new factory-built home", icon: Home },
  { value: "build", label: "Build on my land", description: "Place a new home on land I own or am buying", icon: Landmark },
  { value: "refinance", label: "Refinance existing home", description: "Get a better rate on my current modular home", icon: RefreshCw },
];

const HOMES = [
  { value: "modular", label: "Modular home", description: "Built in sections, assembled on-site with permanent foundation" },
  { value: "prefab", label: "Prefab / Panelized", description: "Factory-built panels or components assembled on-site" },
  { value: "adu", label: "Factory-built ADU", description: "Accessory dwelling unit, guest house, or backyard home" },
  { value: "not_sure", label: "Not sure yet", description: "I'm still exploring my options" },
];

const LAND = [
  { value: "own_land", label: "I own land", description: "I have property where the home will go" },
  { value: "buying_land", label: "Buying land", description: "I'm purchasing land with the home" },
  { value: "builder_land", label: "Builder's land / Development", description: "The home is in a community or on builder-owned land" },
  { value: "not_sure", label: "Not sure yet", description: "Still figuring out the land situation" },
];

const CREDIT = [
  { value: "excellent", label: "Excellent", description: "720+" },
  { value: "good", label: "Good", description: "680–719" },
  { value: "fair", label: "Fair", description: "620–679" },
  { value: "needs_work", label: "Needs work", description: "Below 620" },
  { value: "not_sure", label: "Not sure", description: "I'll check later" },
];

const INCOME = [
  { value: "under_50k", label: "Under $50,000" },
  { value: "50k_75k", label: "$50,000 – $75,000" },
  { value: "75k_100k", label: "$75,000 – $100,000" },
  { value: "100k_150k", label: "$100,000 – $150,000" },
  { value: "150k_plus", label: "$150,000+" },
];

const BUDGET = [
  { value: "under_150k", label: "Under $150,000" },
  { value: "150k_250k", label: "$150,000 – $250,000" },
  { value: "250k_400k", label: "$250,000 – $400,000" },
  { value: "400k_600k", label: "$400,000 – $600,000" },
  { value: "600k_plus", label: "$600,000+" },
];

const TIMELINE = [
  { value: "asap", label: "ASAP", description: "Ready to move forward now" },
  { value: "1_3_months", label: "1–3 months", description: "Soon, but not immediately" },
  { value: "3_6_months", label: "3–6 months", description: "Planning ahead" },
  { value: "exploring", label: "Just exploring", description: "Researching options" },
];

const INITIAL: ApplicationInput = {
  fullName: "",
  email: "",
  phone: "",
  zipCode: "",
  propertyIntent: "",
  homeType: "",
  landStatus: "",
  manufacturerKnown: null,
  creditRange: "",
  incomeRange: "",
  budget: "",
  timeline: "",
};

function Choice({
  selected,
  label,
  description,
  onClick,
}: {
  selected: boolean;
  label: string;
  description?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border-2 p-4 text-left transition",
        selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
      )}
    >
      <p className="font-semibold">{label}</p>
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
    </button>
  );
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function PrequalForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ApplicationInput>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ id: string; matches: LenderMatch[] } | null>(null);
  const [submitError, setSubmitError] = useState("");

  const update = (patch: Partial<ApplicationInput>) => {
    setData((current) => ({ ...current, ...patch }));
  };

  const progress = useMemo(() => ((step + 1) / 4) * 100, [step]);

  if (result) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-lg md:p-10">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="text-center font-display text-3xl font-bold">You&apos;re matched, {data.fullName.split(" ")[0]}.</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          We found specialist lenders for your {data.homeType.replace("_", " ")} project in {data.zipCode}. A advisor
          will follow up at {data.email}. Reference {result.id.slice(0, 8).toUpperCase()}.
        </p>
        <ul className="mt-8 space-y-4">
          {result.matches.map((match) => (
            <li key={match.lender.slug} className="rounded-xl border border-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold">{match.lender.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{match.lender.description}</p>
                </div>
                <p className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                  {match.matchScore}% match
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
                <p>
                  <span className="text-muted-foreground">Est. rate</span>
                  <br />
                  <strong>{match.estimatedRate.toFixed(3)}%</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Est. P&I</span>
                  <br />
                  <strong>
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                      match.estimatedPayment,
                    )}
                    /mo
                  </strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Approval</span>
                  <br />
                  <strong>~{match.lender.avgApprovalDays} days</strong>
                </p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{match.rationale}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Estimates are not commitments. A hard credit pull happens only if you proceed with a lender.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-2xl md:p-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {step + 1} of 4
          </span>
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-primary" />
            No credit impact
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-accent transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {step === 0 ? (
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold md:text-3xl">What brings you to ModFii?</h1>
            <p className="mt-2 text-muted-foreground">Takes about 2 minutes. Estimates are fine.</p>
          </div>
          <div className="space-y-3">
            {INTENTS.map((item) => (
              <Choice
                key={item.value}
                selected={data.propertyIntent === item.value}
                label={item.label}
                description={item.description}
                onClick={() => update({ propertyIntent: item.value })}
              />
            ))}
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">ZIP code</span>
            <input
              inputMode="numeric"
              autoComplete="postal-code"
              value={data.zipCode}
              onChange={(event) => update({ zipCode: event.target.value.replace(/\D/g, "").slice(0, 5) })}
              className="h-12 w-full rounded-lg border border-input bg-background px-4"
              placeholder="37203"
              maxLength={5}
            />
            {errors.zipCode ? <p className="mt-1 text-sm text-destructive">{errors.zipCode}</p> : null}
          </label>
          <Button
            className="w-full"
            size="lg"
            disabled={!(data.propertyIntent && data.zipCode.length === 5)}
            onClick={() => {
              if (!/^\d{5}$/.test(data.zipCode)) {
                setErrors({ zipCode: "Please enter a valid 5-digit ZIP code" });
                return;
              }
              setErrors({});
              setStep(1);
            }}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-8">
          <button type="button" className="flex items-center gap-1 text-sm text-muted-foreground" onClick={() => setStep(0)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold md:text-3xl">Tell us about the home</h1>
            <p className="mt-2 text-muted-foreground">This helps us match you with the right financing options.</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">What type of home?</p>
            {HOMES.map((item) => (
              <Choice
                key={item.value}
                selected={data.homeType === item.value}
                label={item.label}
                description={item.description}
                onClick={() => update({ homeType: item.value })}
              />
            ))}
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">Land situation?</p>
            {LAND.map((item) => (
              <Choice
                key={item.value}
                selected={data.landStatus === item.value}
                label={item.label}
                description={item.description}
                onClick={() => update({ landStatus: item.value })}
              />
            ))}
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={!(data.homeType && data.landStatus)}
            onClick={() => setStep(2)}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-8">
          <button type="button" className="flex items-center gap-1 text-sm text-muted-foreground" onClick={() => setStep(1)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold md:text-3xl">A few quick details</h1>
            <p className="mt-2 text-muted-foreground">Estimates are fine. This helps match you with the right lenders.</p>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Estimated credit score</p>
              <span className="text-xs text-muted-foreground">No credit check</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {CREDIT.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => update({ creditRange: item.value })}
                  className={cn(
                    "rounded-lg border-2 p-3 text-center",
                    data.creditRange === item.value ? "border-primary bg-primary/5" : "border-border",
                  )}
                >
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Household income</p>
            <div className="grid gap-2">
              {INCOME.map((item) => (
                <Choice
                  key={item.value}
                  selected={data.incomeRange === item.value}
                  label={item.label}
                  onClick={() => update({ incomeRange: item.value })}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Home budget</p>
            <div className="grid gap-2">
              {BUDGET.map((item) => (
                <Choice
                  key={item.value}
                  selected={data.budget === item.value}
                  label={item.label}
                  onClick={() => update({ budget: item.value })}
                />
              ))}
            </div>
          </div>
          <Button
            className="w-full"
            size="lg"
            disabled={!(data.creditRange && data.incomeRange && data.budget)}
            onClick={() => setStep(3)}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-8">
          <button type="button" className="flex items-center gap-1 text-sm text-muted-foreground" onClick={() => setStep(2)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold md:text-3xl">Where should we send your options?</h1>
            <p className="mt-2 text-muted-foreground">We only use this to match you with lenders. No spam.</p>
          </div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Full name</span>
            <input
              value={data.fullName}
              onChange={(event) => update({ fullName: event.target.value })}
              className="h-12 w-full rounded-lg border border-input bg-background px-4"
              autoComplete="name"
            />
            {errors.fullName ? <p className="mt-1 text-sm text-destructive">{errors.fullName}</p> : null}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Email</span>
            <input
              type="email"
              value={data.email}
              onChange={(event) => update({ email: event.target.value })}
              className="h-12 w-full rounded-lg border border-input bg-background px-4"
              autoComplete="email"
            />
            {errors.email ? <p className="mt-1 text-sm text-destructive">{errors.email}</p> : null}
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Phone</span>
            <input
              type="tel"
              value={data.phone}
              onChange={(event) => update({ phone: formatPhone(event.target.value) })}
              className="h-12 w-full rounded-lg border border-input bg-background px-4"
              autoComplete="tel"
            />
            {errors.phone ? <p className="mt-1 text-sm text-destructive">{errors.phone}</p> : null}
          </label>
          <div>
            <p className="mb-2 text-sm font-medium">Timeline</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {TIMELINE.map((item) => (
                <Choice
                  key={item.value}
                  selected={data.timeline === item.value}
                  label={item.label}
                  description={item.description}
                  onClick={() => update({ timeline: item.value })}
                />
              ))}
            </div>
          </div>
          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
          <Button
            className="w-full"
            size="lg"
            disabled={submitting}
            onClick={async () => {
              setSubmitting(true);
              setSubmitError("");
              try {
                const response = await fetch("/api/applications", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });
                const payload: unknown = await response.json();
                if (!response.ok) {
                  const message =
                    typeof payload === "object" && payload && "error" in payload
                      ? String((payload as { error: unknown }).error)
                      : "Could not submit application.";
                  setSubmitError(message);
                  return;
                }
                const parsed = payload as { id: string; matches: LenderMatch[] };
                setResult(parsed);
              } catch {
                setSubmitError("Network error. Please try again.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? "Matching lenders…" : "See my lender matches"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <p className="mt-6 text-center text-xs text-muted-foreground">256-bit encryption · NMLS #2537136 · We never sell your data</p>
    </div>
  );
}
