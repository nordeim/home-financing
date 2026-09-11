import { PageHero } from "@/components/page-shell";
import { Badge, ButtonLink, Container } from "@/components/ui";
import { manufacturers } from "@/lib/catalog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Prefab Home Manufacturers",
  description:
    "Connect with approved lenders for America's top modular and manufactured home builders. Find the right financing for your dream prefab home.",
};

const TIERS = ["Affordable", "Mid-Range", "Premium"] as const;

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
      <Container className="py-12">
        {TIERS.map((tier) => {
          const items = manufacturers.filter((item) => item.category === tier);
          return (
            <section key={tier} className="mb-14">
              <h2 className="mb-6 font-display text-2xl font-bold">{tier} Manufacturers</h2>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/modular-home-financing/manufacturers/${item.slug}`}
                    className="rounded-2xl border border-border bg-card p-6 transition hover:border-accent"
                  >
                    <Badge>{tier}</Badge>
                    <h3 className="mt-3 font-display text-xl font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.headquarters}</p>
                    <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{item.description}</p>
                    <p className="mt-4 text-sm font-medium text-primary">{item.priceRange}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
        <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground">
          <h2 className="font-display text-2xl font-bold">Can&apos;t find your manufacturer?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Our lender network works with hundreds of prefab manufacturers.
          </p>
          <ButtonLink href="/get-started" variant="secondary" className="mt-6">
            Get Pre-Qualified
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
