import { Breadcrumbs } from "@/components/page-shell";
import { ButtonLink, Container } from "@/components/ui";
import { SITE } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "About ModFii | Prefab Home Mortgage Marketplace" },
  description: "The first mortgage marketplace built exclusively for prefab and modular homes. Headquartered in Nashville, TN.",
};

export default function AboutPage() {
  return (
    <main className="pb-20 pt-28">
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
        <h2 className="mt-10 font-display text-2xl font-bold">How We&apos;re Different</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
          <li>Only factory-built files — modular, panelized, ADU, HUD-code, tiny on foundation.</li>
          <li>Soft-pull exploration. A hard pull happens only when you choose a lender.</li>
          <li>Editorial coverage sourced from FHA, VA, USDA, CFPB, Fannie Mae, and Freddie Mac.</li>
          <li>Headquartered in Nashville, TN · {SITE.email} · NMLS #{SITE.nmls}</li>
        </ul>
        <h2 className="mt-10 font-display text-2xl font-bold">How We Make Money</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          ModFii is free for borrowers—always. When one of our matched lenders closes your loan, that lender pays us a
          referral fee. That&apos;s the entire revenue model: no borrower fees, no rate markups, no selling your data.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Because lenders compete for your file inside one marketplace, the pricing you see already accounts for the
          referral arrangement. You never pay more by financing through ModFii than you would approaching the same lender
          directly—and you frequently pay less, because competing offers surface the best structure rather than the first
          one quoted.
        </p>
        <h2 className="mt-10 font-display text-2xl font-bold">Our Editorial Standards</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Every guide we publish is written from primary sources—FHA handbooks, VA lender guides, USDA program rules,
          CFPB disclosures, and Fannie Mae and Freddie Mac selling guides—and reviewed by mortgage professionals with
          factory-built lending experience. When rules change, our guides change.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Editorial coverage is independent of which lender pays what. Our team cannot accept payment for coverage, and
          corrections are public: anything material we get wrong is fixed on the record through our corrections process,
          not silently edited.
        </p>
        <h2 className="mt-10 font-display text-2xl font-bold">Our Team</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          ModFii is a small, specialized team headquartered in Nashville, Tennessee. Our backgrounds span mortgage
          origination and underwriting, factory-built construction, and consumer-finance editorial—because financing a
          prefab home well requires all three fluencies at once.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Sarah Chen leads editorial. James Thornton runs lender partnerships. Marcus &amp; Elena Rodriguez manage the
          matching desk that reviews every application before it reaches a lender. You&apos;ll see their names on the
          guides they review.
        </p>
        <h2 className="mt-10 font-display text-2xl font-bold">Contact Us</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            Email:{" "}
            <a href={`mailto:${SITE.email}`} className="text-primary hover:underline">
              {SITE.email}
            </a>
          </li>
          <li>Headquarters: {SITE.hq}</li>
          <li>NMLS #{SITE.nmls}</li>
          <li>Media and partnership inquiries receive a response within two business days.</li>
        </ul>
        <ButtonLink href="/get-started" variant="accent" className="mt-10">
          Get Pre-Qualified
        </ButtonLink>
      </Container>
    </main>
  );
}
