import { Breadcrumbs } from "@/components/page-shell";
import { Container } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: "How ModFii researches, reviews, and updates prefab home financing content.",
};

export default function Page() {
  return (
    <main className="pt-28 pb-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Editorial Policy" }]} />
        <h1 className="font-display text-4xl font-bold">Editorial Policy</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          ModFii is committed to providing accurate, unbiased information to help you make informed decisions about
          prefab home financing.
        </p>
        <h2 className="mt-8 font-display text-2xl font-bold">Independence</h2>
        <p className="mt-3 text-muted-foreground">
          Our recommendations are based on research, not lender relationships. We earn referral fees when you match with
          a partner, but that never changes program facts, rate ranges, or eligibility rules on this site.
        </p>
        <h2 className="mt-8 font-display text-2xl font-bold">Sources</h2>
        <p className="mt-3 text-muted-foreground">
          Information is sourced from official programs: FHA.gov, VA.gov, USDA.gov, CFPB, Fannie Mae, and Freddie Mac.
          State pages also reference housing finance agencies.
        </p>
        <h2 className="mt-8 font-display text-2xl font-bold">Review</h2>
        <p className="mt-3 text-muted-foreground">
          Content is written and reviewed by mortgage professionals with specialized experience in modular and prefab
          financing. Material facts are dated. Corrections are logged on our corrections page.
        </p>
      </Container>
    </main>
  );
}
