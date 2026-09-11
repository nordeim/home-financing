import { Breadcrumbs } from "@/components/page-shell";
import { Container } from "@/components/ui";
import { states } from "@/lib/catalog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Modular Home Financing by State",
  description: "State-by-state modular and prefab home financing guides covering lending climate, USDA maps, and local manufacturers.",
};

export default function StatesPage() {
  return (
    <main className="pt-28 pb-20">
      <Container>
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Modular financing", href: "/modular-home-financing" },
            { name: "States" },
          ]}
        />
        <h1 className="font-display text-4xl font-bold md:text-5xl">Modular Home Financing by State</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Get matched with lenders who finance prefab and modular homes in your state.
        </p>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {states.map((state) => (
            <Link
              key={state.slug}
              href={`/modular-home-financing/states/${state.slug}`}
              className="rounded-xl border border-border px-4 py-3 hover:border-accent"
            >
              <span className="text-xs font-semibold text-primary">{state.abbreviation}</span>
              <p className="font-medium">{state.name}</p>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}
