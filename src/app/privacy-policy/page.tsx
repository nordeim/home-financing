import { Breadcrumbs } from "@/components/page-shell";
import { Container } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ModFii collects, uses, and shares information from pre-qualification forms.",
};

export default function Page() {
  return (
    <main className="pt-28 pb-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Privacy Policy" }]} />
        <h1 className="font-display text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-sm text-muted-foreground">Last updated January 2026</p>
        <p className="mt-4 text-muted-foreground">
          We collect the information you submit on Get Pre-Qualified (name, email, phone, ZIP, project details) to match
          you with lenders. We do not sell your data. We do not run a hard credit pull from this site. Partner lenders
          may pull credit only if you choose to continue with them.
        </p>
        <p className="mt-4 text-muted-foreground">
          We store applications in our database to operate the marketplace, prevent fraud, and follow up on matches.
          Contact team@modfii.com to request access or deletion of your application record.
        </p>
      </Container>
    </main>
  );
}
