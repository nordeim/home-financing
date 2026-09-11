import { Breadcrumbs } from "@/components/page-shell";
import { Container } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of use for the ModFii mortgage marketplace.",
};

export default function Page() {
  return (
    <main className="pt-28 pb-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Terms of Service" }]} />
        <h1 className="font-display text-4xl font-bold">Terms of Service</h1>
        <p className="mt-4 text-muted-foreground">
          ModFii is a mortgage marketplace, not a lender, broker of record, or creditor. Rate estimates and matches are
          illustrative, not commitments. Loan approval is solely the lender&apos;s decision. You agree not to submit
          false information on pre-qualification forms. Equal Housing Opportunity. NMLS #2537136.
        </p>
      </Container>
    </main>
  );
}
