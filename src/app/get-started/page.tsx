import { PrequalForm } from "@/components/prequal-form";
import { Container } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Pre-Qualified",
  description:
    "Get pre-approved for your prefab home in minutes. Specialized lenders, green mortgage discounts, no impact to your credit to explore options.",
};

export default function GetStartedPage() {
  return (
    <main className="bg-[radial-gradient(circle_at_top,hsl(155_45%_28%/0.08),transparent_50%)] pt-28 pb-20">
      <Container className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="text-sm font-semibold tracking-wider text-primary uppercase">Free pre-qualification</p>
          <h1 className="mt-3 font-display text-4xl font-bold md:text-5xl">Get matched with prefab specialists.</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Share a few details. We&apos;ll introduce you to lenders who already understand factory-built construction—no
            hard credit pull to look.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            <li>• Average approvals in 7 days</li>
            <li>• Green mortgage discounts for efficient homes</li>
            <li>• Construction-to-permanent desks for new builds</li>
          </ul>
        </div>
        <PrequalForm />
      </Container>
    </main>
  );
}
