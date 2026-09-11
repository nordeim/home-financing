import { PageHero } from "@/components/page-shell";
import { Badge, ButtonLink, Container } from "@/components/ui";
import { manufacturers } from "@/lib/catalog";
import { ArrowRight, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prefab Home Manufacturers",
  description:
    "Connect with approved lenders for America's top modular and manufactured home builders. Find the right financing for your dream prefab home.",
};

const TIERS = [
  { key: "Affordable", sub: "Under $150K price", band: "bg-cream" },
  { key: "Mid-Range", sub: "$150K – $300K price", band: "bg-accent/10" },
  { key: "Premium", sub: "$300K+ price", band: "bg-secondary/60" },
] as const;

export default function ManufacturersPage() {
  return (
    <main>
      <PageHero
        eyebrow="50+ builders covered"
        title="Prefab Home Manufacturers"
        description="Connect with approved lenders for America's top modular and manufactured home builders."
        crumbs={[
          { name: "Home", href: "/" },
          { name: "Modular financing", href: "/modular-home-financing" },
          { name: "Manufacturers" },
        ]}
        imageSrc="/images/hero-prefab.jpg"
        ctas={[{ label: "Get pre-qualified", href: "/get-started" }]}
      />
      {TIERS.map((tier) => {
        const items = manufacturers.filter((item) => item.category === tier.key);
        return (
          <section key={tier.key} className={`${tier.band} py-12`}>
            <Container>
              <div className="mb-6 flex flex-wrap items-baseline gap-3">
                <h2 className="font-display text-2xl font-bold">
                  {tier.key === "Mid-Range" ? "Mid-Range Modern Prefab" : `${tier.key} Manufacturers`}
                </h2>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  ({tier.sub})
                </span>
              </div>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/modular-home-financing/manufacturers/${item.slug}`}
                    className="flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-accent hover:shadow-md"
                  >
                    <Badge>{tier.key}</Badge>
                    <h3 className="mt-3 font-display text-xl font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.headquarters}</p>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm text-muted-foreground">{item.description}</p>
                    <p className="mt-4 text-sm font-medium text-primary">{item.priceRange}</p>
                    <p className="mt-3 flex flex-wrap gap-1.5">
                      {item.homeTypes.slice(0, 3).map((homeType) => (
                        <span
                          key={homeType}
                          className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {homeType}
                        </span>
                      ))}
                    </p>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      View Models
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </p>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        );
      })}

      {/* All-manufacturers chip directory (source parity) */}
      <section className="bg-accent/10 py-12">
        <Container>
          <h2 className="text-center font-display text-2xl font-bold">All Manufacturers</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Complete A–Z directory of every builder in our lending network.
          </p>
          <nav aria-label="All manufacturers" className="mx-auto mt-8 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {manufacturers.map((item) => (
              <Link
                key={item.slug}
                href={`/modular-home-financing/manufacturers/${item.slug}`}
                className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-medium transition hover:border-accent hover:text-primary"
              >
                {item.name}
                <span className="mt-0.5 block text-xs text-muted-foreground">{item.priceRange}</span>
              </Link>
            ))}
          </nav>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Can&apos;t Find Your Manufacturer?</h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
              Our lender network works with hundreds of prefab manufacturers. Get matched with the right financing for
              your build.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <ButtonLink href="/get-started" variant="secondary">
                Get Pre-Qualified
              </ButtonLink>
              <a
                href={`mailto:team@modfii.com?subject=${encodeURIComponent("Manufacturer financing question")}`}
                className="inline-flex items-center gap-2 rounded-md border border-primary-foreground/30 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
              >
                <Mail className="h-4 w-4" aria-hidden />
                Email Our Team
              </a>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
