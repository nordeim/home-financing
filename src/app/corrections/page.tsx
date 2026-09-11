import { Breadcrumbs } from "@/components/page-shell";
import { Container } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Corrections Policy",
  description: "How to request a correction to ModFii editorial content.",
};

export default function Page() {
  return (
    <main className="pt-28 pb-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Corrections" }]} />
        <h1 className="font-display text-4xl font-bold">Corrections Policy</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          If you find an error in a rate range, program rule, or manufacturer detail, email team@modfii.com with the URL
          and the source that should replace it. We update the page and note the change when the correction is material.
        </p>
        <p className="mt-4 text-muted-foreground">
          Program limits (FHA county loan limits, USDA maps, VA funding fees) change. We prefer linking to the official
          calculator over freezing a number that will age out.
        </p>
      </Container>
    </main>
  );
}
