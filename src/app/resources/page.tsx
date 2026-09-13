import { Breadcrumbs } from "@/components/page-shell";
import { ButtonLink, Container } from "@/components/ui";
import { BookOpen, Calculator, GitCompare, House, Landmark, MapPinned, Scale } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Modular Home Financing Resources | Guides & Tools",
  description:
    "Explore ModFii's complete library of modular home financing guides, loan comparisons, state resources, and tools.",
};

const GROUPS = [
  {
    title: "Loan Types",
    icon: Landmark,
    description: "Government-backed and conventional loan programs for modular homes.",
    links: [
      { title: "FHA Loans for Modular Homes", href: "/modular-home-financing/loan-options/fha" },
      { title: "VA Loans for Modular Homes", href: "/modular-home-financing/loan-options/va" },
      { title: "USDA Loans for Modular Homes", href: "/modular-home-financing/loan-options/usda" },
      { title: "Construction-to-Permanent Loans", href: "/modular-home-financing/loan-options/construction-loan" },
    ],
  },
  {
    title: "Construction Loans",
    icon: House,
    description: "Finance the building of your new modular or prefab home.",
    links: [
      { title: "Construction Loans Overview", href: "/construction-loans" },
      { title: "FHA Construction Loans", href: "/construction-loans/fha" },
      { title: "VA Construction Loans", href: "/construction-loans/va" },
      { title: "USDA Construction Loans", href: "/construction-loans/usda" },
    ],
  },
  {
    title: "Financing Guides",
    icon: BookOpen,
    description: "In-depth guides on costs, rates, and financing strategies.",
    links: [
      { title: "Financing With Land", href: "/modular-home-financing/with-land" },
      { title: "Financing Without Land", href: "/modular-home-financing/without-land" },
      { title: "Down Payment Guide", href: "/modular-home-financing/down-payment" },
      { title: "Modular Home Rates", href: "/modular-home-financing/rates" },
      { title: "Modular Home Costs", href: "/modular-home-financing/cost" },
    ],
  },
  {
    title: "Alternative Housing",
    icon: House,
    description: "Financing options for ADUs, tiny homes, and non-traditional housing.",
    links: [
      { title: "ADU Financing Guide", href: "/adu-financing" },
      { title: "Tiny Home Financing Guide", href: "/tiny-home-financing" },
      { title: "Chattel vs. Mortgage Loans", href: "/modular-home-financing/chattel-vs-mortgage" },
    ],
  },
  {
    title: "Comparisons",
    icon: GitCompare,
    description: "Side-by-side comparisons to help you make informed decisions.",
    links: [
      { title: "Modular vs. Manufactured Financing", href: "/compare/modular-vs-manufactured-financing" },
      { title: "FHA vs. Conventional for Prefab", href: "/compare/fha-vs-conventional-prefab" },
      { title: "Prefab vs. Site-Built Costs", href: "/compare/prefab-vs-site-built-costs" },
    ],
  },
  {
    title: "Tools & Calculators",
    icon: Calculator,
    description: "Interactive tools to plan your modular home purchase.",
    links: [
      { title: "Mortgage Calculator", href: "/calculator" },
      { title: "Get Pre-Qualified", href: "/get-started" },
    ],
  },
  {
    title: "Reference",
    icon: Scale,
    description: "Glossary, policies, and company information.",
    links: [
      { title: "Financing Glossary", href: "/glossary" },
      { title: "About ModFii", href: "/about" },
      { title: "Editorial Policy", href: "/editorial-policy" },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-primary pt-28 pb-16 text-primary-foreground">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(38_92%_50%/0.15),transparent_60%)]" />
        <Container className="relative">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Resources" }]} light />
          <h1 className="font-display text-4xl font-bold md:text-5xl">Modular Home Financing Resources</h1>
          <p className="mt-4 max-w-2xl text-xl text-primary-foreground/80">
            Guides, tools, and everything you need to finance your prefab or modular home.
          </p>
        </Container>
      </section>
      <Container className="py-12">
        <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.title} className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-accent/10 p-2 text-accent">
                  <group.icon className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold">{group.title}</h2>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">{group.description}</p>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm hover:text-accent">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-accent/20 bg-accent/10 p-8">
            <div className="mb-4 flex items-center gap-3">
              <MapPinned className="h-6 w-6 text-accent" />
              <h2 className="text-2xl font-bold">Browse by State</h2>
            </div>
            <p className="mb-6 text-muted-foreground">
              Explore state-specific programs, FHA loan limits, USDA eligibility, and local regulations.
            </p>
            <div className="mb-6 flex flex-wrap gap-2">
              {["California", "Texas", "Florida", "New York", "North Carolina"].map((name) => (
                <Link
                  key={name}
                  href={`/modular-home-financing/states/${name.toLowerCase().replace(" ", "-")}`}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-sm hover:border-accent"
                >
                  {name}
                </Link>
              ))}
            </div>
            <ButtonLink href="/modular-home-financing/states" variant="outline">
              Browse All 50 States
            </ButtonLink>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-8">
            <h2 className="text-2xl font-bold">Browse by Manufacturer</h2>
            <p className="mt-2 mb-6 text-muted-foreground">
              Find lenders familiar with your preferred modular home builder.
            </p>
            <div className="mb-6 flex flex-wrap gap-2">
              {[
                ["Clayton Homes", "clayton-homes"],
                ["Champion Homes", "champion-homes"],
                ["Cavco Industries", "cavco-industries"],
                ["Palm Harbor", "palm-harbor-homes"],
              ].map(([name, slug]) => (
                <Link
                  key={slug}
                  href={`/modular-home-financing/manufacturers/${slug}`}
                  className="rounded-full border border-border bg-background px-3 py-1.5 text-sm hover:border-primary"
                >
                  {name}
                </Link>
              ))}
            </div>
            <ButtonLink href="/modular-home-financing/manufacturers" variant="outline">
              View All Manufacturers
            </ButtonLink>
          </div>
        </div>

        {/* Source pass-7 additions: Most Popular Guides + Not Sure Where to
            Start? (docs/REMEDIATION_PLAN_pass7.md F-10). */}
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Most Popular Guides</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                href: "/modular-home-financing",
                title: "Modular Home Financing: The Complete Guide",
                description: "Everything you need to know about financing a modular or prefab home.",
              },
              {
                href: "/modular-home-financing/loan-options/fha",
                title: "FHA Loans for Modular Homes",
                description: "3.5% down payments and flexible credit requirements for modular buyers.",
              },
              {
                href: "/construction-loans",
                title: "Construction Loans for Prefab Homes",
                description: "How one-time-close construction loans work with factory timelines.",
              },
              {
                href: "/modular-home-financing/down-payment",
                title: "Modular Home Down Payment Guide",
                description: "From $0 down options to using land equity for your entire down payment.",
              },
            ].map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group rounded-lg border border-border p-5 transition-colors hover:border-accent"
              >
                <p className="font-semibold transition-colors group-hover:text-accent">{guide.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{guide.description}</p>
              </Link>
            ))}
          </div>
        </section>
        <section className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="text-2xl font-bold">Not Sure Where to Start?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Answer a few questions about your project and we&apos;ll point you to the right guide and the right lenders.
          </p>
          <ButtonLink href="/get-started" variant="primary" className="mt-6">
            Get Pre-Qualified
            <span aria-hidden>→</span>
          </ButtonLink>
        </section>
      </Container>
    </main>
  );
}
