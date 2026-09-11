import { Breadcrumbs } from "@/components/page-shell";
import { ButtonLink, Container } from "@/components/ui";
import { glossaryByLetter } from "@/lib/catalog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Modular Home Financing Glossary",
  description: "Clear definitions for construction loans, mortgage terms, and prefab home terminology.",
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function GlossaryPage() {
  const groups = glossaryByLetter();
  const present = new Set(groups.map((group) => group.letter));

  return (
    <main>
      <section className="bg-primary pt-28 pb-16 text-primary-foreground">
        <Container>
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Glossary" }]} light />
          <h1 className="font-display text-4xl font-bold md:text-5xl">Modular Home Financing Glossary</h1>
          <p className="mt-4 max-w-2xl text-xl text-primary-foreground/80">
            Clear definitions for construction loans, mortgage terms, and prefab home terminology.
          </p>
        </Container>
      </section>
      <nav className="sticky top-16 z-40 border-b border-border bg-background/95 py-3 backdrop-blur-sm" aria-label="Letters">
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
                    <h2 className="text-lg font-semibold">{term.term}</h2>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{term.definition}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="mt-16 rounded-2xl border border-accent/20 bg-accent/10 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Have questions about financing?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Get matched with lenders who specialize in modular and prefab home financing.
          </p>
          <ButtonLink href="/get-started" variant="accent" className="mt-6">
            Get Pre-Qualified
          </ButtonLink>
        </div>
        <div className="mt-8 text-center text-sm">
          <Link href="/modular-home-financing" className="text-primary hover:underline">
            Modular Home Financing Guide
          </Link>
        </div>
      </Container>
    </main>
  );
}
