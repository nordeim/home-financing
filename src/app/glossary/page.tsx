import { PageHero } from "@/components/page-shell";
import { ButtonLink, Container } from "@/components/ui";
import { glossaryByLetter } from "@/lib/catalog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Modular Home Financing Glossary | Terms & Definitions",
  description: "Clear definitions for construction loans, mortgage terms, and prefab home terminology.",
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function GlossaryPage() {
  const groups = glossaryByLetter();
  const present = new Set(groups.map((group) => group.letter));

  return (
    <main>
      <PageHero
        title="Modular Home Financing Glossary"
        titleSize="md"
        description="Clear definitions for construction loans, mortgage terms, and prefab home terminology."
        crumbs={[{ name: "Home", href: "/" }, { name: "Glossary" }]}
        imageSrc="/images/green-home.jpg"
      />
      <nav className="sticky top-20 z-40 border-b border-border bg-background/95 py-3 backdrop-blur-sm" aria-label="Letters">
        <Container>
          <div className="flex flex-wrap justify-center gap-1">
            {LETTERS.map((letter) =>
              present.has(letter) ? (
                <a
                  key={letter}
                  href={`#letter-${letter}`}
                  className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
                >
                  {letter}
                </a>
              ) : (
                <span key={letter} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground/40">
                  {letter}
                </span>
              ),
            )}
          </div>
        </Container>
      </nav>
      <Container className="max-w-4xl py-12">
        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.letter} id={`letter-${group.letter}`} className="scroll-mt-32">
              <div className="mb-6 flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-2xl font-bold text-accent-foreground">
                  {group.letter}
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-6 border-l-2 border-muted pl-4">
                {group.terms.map((term) => (
                  <div key={term.term} className="pl-4">
                    <h3 className="text-lg font-semibold">{term.term}</h3>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{term.definition}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-16 rounded-2xl border border-accent/20 bg-accent/10 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Have Questions About Financing?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Get matched with lenders who specialize in modular and prefab home financing.
          </p>
          <ButtonLink href="/get-started" variant="accent" className="mt-6">
            Get Pre-Qualified
          </ButtonLink>
        </div>
        {/* Source pass-7 glossary closers: Related Resources card grid + the
            Have Questions CTA above (docs/REMEDIATION_PLAN_pass7.md F-8). */}
        <section className="mt-16 border-t border-border pt-8">
          <h2 className="mb-6 text-2xl font-bold">Related Resources</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                href: "/modular-home-financing",
                title: "Modular Home Financing Guide",
                body: "Complete guide to financing your prefab or modular home purchase.",
              },
              {
                href: "/modular-home-financing/loan-options/construction-loan",
                title: "Construction Loans",
                body: "Learn how construction-to-permanent loans work for modular homes.",
              },
              {
                href: "/modular-home-financing/loan-options",
                title: "Loan Options",
                body: "Compare FHA, VA, USDA, and conventional loan programs.",
              },
              {
                href: "/calculator",
                title: "Payment Calculator",
                body: "Estimate your monthly mortgage payment and affordability.",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-lg border border-border p-4 transition-colors hover:border-accent"
              >
                <h3 className="font-semibold transition-colors group-hover:text-accent">{card.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{card.body}</p>
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
