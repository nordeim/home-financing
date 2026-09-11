import { CalculatorApp } from "@/components/calculator-app";
import { Breadcrumbs } from "@/components/page-shell";
import { Container } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modular Home Payment Calculator",
  description:
    "Free modular home payment calculator. Estimate monthly payments for prefab and manufactured homes including principal, interest, taxes, insurance, and PMI.",
};

export default function CalculatorPage() {
  return (
    <main className="pt-28 pb-20">
      <Container>
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Calculator" }]} />
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">Free tool</p>
        <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">Modular Home Payment Calculator</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Estimate your monthly payment for a modular, prefab, or manufactured home. Includes principal, interest,
          taxes, insurance, and PMI. No credit check.
        </p>
        <div className="mt-10">
          <CalculatorApp />
        </div>
        <section className="mt-16 max-w-3xl">
          <h2 className="font-display text-2xl font-bold">How to use the calculator</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>Enter the total cost of your modular home including delivery and setup.</li>
            <li>Adjust down payment to see when PMI drops off at 20% equity.</li>
            <li>Use a rate in the mid-6s for well-qualified real-property modular files in 2026.</li>
          </ol>
        </section>
      </Container>
    </main>
  );
}
