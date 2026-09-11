import { Breadcrumbs } from "@/components/page-shell";
import { ButtonLink, Container } from "@/components/ui";
import { SITE } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ModFii",
  description: "The first mortgage marketplace built exclusively for prefab and modular homes. Headquartered in Nashville, TN.",
};

export default function AboutPage() {
  return (
    <main className="pt-28 pb-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "About" }]} />
        <h1 className="font-display text-4xl font-bold md:text-5xl">About ModFii</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The first mortgage marketplace built exclusively for prefab and modular homes.
        </p>
        <h2 className="mt-10 font-display text-2xl font-bold">Our Story</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Here&apos;s a frustrating reality: traditional lenders don&apos;t understand prefab homes. They see
          &ldquo;modular&rdquo; or &ldquo;factory-built&rdquo; on an application and hit the brakes—not because the buyer
          isn&apos;t qualified, but because the loan officer has never processed this type of home before.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          The result? Qualified buyers get stuck in a cycle of rejections, delays, and confusion. They&apos;re told their
          dream home &ldquo;doesn&apos;t qualify&rdquo; when the real problem is lender inexperience. Meanwhile, modular
          and prefab construction has become one of the smartest ways to build—faster timelines, controlled quality, often
          better energy efficiency than site-built homes.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          ModFii exists to close that gap. We are a marketplace, not a lender. We introduce buyers to desks that already
          know factory invoices, crane-set draws, and green-mortgage documentation.
        </p>
        <h2 className="mt-10 font-display text-2xl font-bold">Our Mission</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Connect every prefab home buyer with a lender who understands modern construction—so more families can finance
          better homes, faster.
        </p>
        <h2 className="mt-10 font-display text-2xl font-bold">How we&apos;re different</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Only factory-built files — modular, panelized, ADU, HUD-code, tiny on foundation.</li>
          <li>Soft-pull exploration. A hard pull happens only when you choose a lender.</li>
          <li>Editorial coverage sourced from FHA, VA, USDA, CFPB, Fannie Mae, and Freddie Mac.</li>
          <li>Headquartered in Nashville, TN · {SITE.email} · NMLS #{SITE.nmls}</li>
        </ul>
        <ButtonLink href="/get-started" variant="accent" className="mt-10">
          Get Pre-Qualified
        </ButtonLink>
      </Container>
    </main>
  );
}
