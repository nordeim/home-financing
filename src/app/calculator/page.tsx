import { CalculatorApp } from "@/components/calculator-app";
import { Breadcrumbs } from "@/components/page-shell";
import { BadgeCheck, Banknote, Calculator, ChevronDown, CircleCheck, FileText, Home, Percent } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Modular Home Payment Calculator | Estimate Your Monthly Mortgage",
  description:
    "Free modular home payment calculator. Estimate monthly payments for prefab and manufactured homes including principal, interest, taxes, insurance, and PMI.",
};

const TRUST_CHIPS = ["No credit check required", "Instant results", "100% free"];

const HOW_TO_STEPS = [
  { icon: Home, title: "1. Enter Home Price", body: "Input the total cost of your modular home including delivery and setup." },
  { icon: Banknote, title: "2. Set Down Payment", body: "Adjust your down payment to see how it affects your monthly costs." },
  { icon: Percent, title: "3. Choose Loan Terms", body: "Select your interest rate and loan term (10, 15, 20, 25, or 30 years)." },
  { icon: FileText, title: "4. View Results", body: "See your complete payment breakdown with taxes, insurance, and PMI." },
];

const LOAN_OPTIONS = [
  { tag: "3.5% Down", title: "FHA Loans", body: "Government-backed loans with low down payment requirements and flexible credit standards.", href: "/modular-home-financing/loan-options/fha" },
  { tag: "0% Down", title: "VA Loans", body: "For eligible veterans with no down payment required and no PMI, even at 0% down.", href: "/modular-home-financing/loan-options/va" },
  { tag: "0% Down", title: "USDA Loans", body: "Rural development loans for eligible suburban and rural properties.", href: "/modular-home-financing/loan-options/usda" },
  { tag: "Varies", title: "Construction Loans", body: "Construction-to-permanent loans finance your home construction and land purchase.", href: "/modular-home-financing/loan-options/construction-loan" },
];

const CALCULATOR_FAQS = [
  {
    q: "How do I calculate my modular home payment?",
    a: "Use the calculator above: enter the home price, down payment, interest rate, and loan term. The calculator adds property taxes, homeowners insurance, HOA dues, and PMI (when your down payment is under 20%) to estimate your true monthly cost.",
  },
  {
    q: "What is a typical interest rate for modular home loans?",
    a: "Real-property modular homes—permanently affixed to land you own or are buying—typically qualify for the same rates as site-built homes. In 2026, well-qualified borrowers are seeing rates in the mid-6s. Rates vary by credit score, down payment, and loan program.",
  },
  {
    q: "How much down payment do I need for a modular home?",
    a: "It depends on the loan type: FHA loans require 3.5% down, VA and USDA loans require 0% down for eligible borrowers, and conventional loans typically require 5–20%. A 20% down payment eliminates private mortgage insurance (PMI).",
  },
  {
    q: "What is PMI and when is it required?",
    a: "Private mortgage insurance protects the lender when your down payment is less than 20% of the home price. PMI typically costs 0.5–1% of your loan amount annually and can be removed once you reach 20% equity.",
  },
];

const RELATED = [
  { icon: Percent, title: "Current Rates", body: "See today's rates", href: "/modular-home-financing/rates" },
  { icon: Banknote, title: "Down Payment Guide", body: "Understand down payment options", href: "/modular-home-financing/down-payment" },
  { icon: Home, title: "Cost Breakdown", body: "Full modular home costs", href: "/modular-home-financing/cost" },
  { icon: BadgeCheck, title: "Get Pre-Approved", body: "Start your journey today", href: "/get-started" },
];

const POPULAR = [
  { label: "Modular Home Financing", href: "/modular-home-financing" },
  { label: "FHA Loans", href: "/modular-home-financing/loan-options/fha" },
  { label: "VA Loans", href: "/modular-home-financing/loan-options/va" },
  { label: "Construction Loans", href: "/modular-home-financing/loan-options/construction-loan" },
  { label: "Find Manufacturers", href: "/modular-home-financing/manufacturers" },
];

export default function CalculatorPage() {
  return (
    <main className="pb-20">
      <section className="pt-28">
        <Container>
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Modular Home Financing", href: "/modular-home-financing" },
              { name: "Payment Calculator" },
            ]}
            chevron
          />
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground">
            <Calculator className="h-4 w-4 text-primary" aria-hidden />
            Free Calculator
          </p>
          <h1 className="mt-4 max-w-xl font-display text-4xl font-bold md:text-5xl">
            Modular Home Payment Calculator
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Estimate your monthly payment for a modular, prefab, or manufactured home. Our calculator includes
            principal, interest, taxes, insurance, and PMI.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {TRUST_CHIPS.map((chip) => (
              <span key={chip} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <CircleCheck className="h-4 w-4 text-primary" aria-hidden />
                {chip}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <Container className="mt-10">
        <CalculatorApp />
      </Container>

      {/* How to use — warm amber band (source parity: peach wash below the calculator) */}
      <section className="mt-20 bg-accent/15 py-16">
        <Container>
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">How to Use the Calculator</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {HOW_TO_STEPS.map((step) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-6 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Explore financing options */}
      <section className="bg-accent/15 py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Explore Financing Options</h2>
            <p className="mt-3 text-muted-foreground">
              Different loan types have different down payment requirements and rates. Explore your options to find the
              best fit for your situation.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LOAN_OPTIONS.map((option) => (
              <div key={option.title} className="flex flex-col rounded-2xl border border-border bg-card p-6">
                <span className="inline-flex w-fit rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                  {option.tag}
                </span>
                <h3 className="mt-3 font-display text-lg font-semibold">{option.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{option.body}</p>
                <Link
                  href={option.href}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="bg-accent/15 py-16">
        <Container>
          <h2 className="text-center font-display text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {CALCULATOR_FAQS.map((faq) => (
              <details key={faq.q} name="calc-faq" className="group rounded-xl border border-border bg-card px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-semibold hover:text-primary [&::-webkit-details-marker]:hidden">
                  <h3 className="text-sm">{faq.q}</h3>
                  <ChevronDown
                    className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="pb-5 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Related resources */}
      <section className="bg-accent/15 pb-16 pt-2">
        <Container>
          <h2 className="font-display text-3xl font-bold">Related Resources</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {RELATED.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition hover:border-accent hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-display font-semibold">{item.title}</span>
                  <span className="block text-sm text-muted-foreground">{item.body}</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground">Popular Resources:</span>
            {POPULAR.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground transition hover:border-primary hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-600" />
        <Container className="relative max-w-3xl text-center text-primary-foreground">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to Get Pre-Qualified?</h2>
          <p className="mt-4 text-primary-foreground/85">
            Now that you know your estimated payment, take the next step and get pre-qualified with lenders who
            specialize in modular home financing.
          </p>
          <div className="mt-8 flex justify-center">
            <ButtonLink href="/get-started" variant="secondary" size="lg">
              Get Pre-Qualified Now
            </ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
