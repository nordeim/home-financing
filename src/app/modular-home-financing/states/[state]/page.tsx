import { Breadcrumbs } from "@/components/page-shell";
import { ButtonLink, Container } from "@/components/ui";
import { getState } from "@/lib/catalog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const item = getState(state);
  if (!item) return { title: "State financing" };
  return {
    title: `Modular Home Financing in ${item.name}`,
    description: `Get matched with lenders who finance prefab and modular homes in ${item.name}. ${item.lendingDescription}`,
  };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const item = getState(state);
  if (!item) notFound();

  return (
    <main className="pt-28 pb-20">
      <Container>
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "States", href: "/modular-home-financing/states" },
            { name: item.name },
          ]}
        />
        <h1 className="font-display text-4xl font-bold md:text-5xl">Modular Home Financing in {item.name}</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{item.lendingDescription}</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-4">
            <dt className="text-sm text-muted-foreground">Median home price</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{item.medianHomePrice}</dd>
          </div>
          <div className="rounded-xl border border-border p-4">
            <dt className="text-sm text-muted-foreground">Average loan amount</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{item.averageLoanAmount}</dd>
          </div>
          <div className="rounded-xl border border-border p-4">
            <dt className="text-sm text-muted-foreground">Prefab market growth</dt>
            <dd className="mt-1 font-display text-2xl font-bold">{item.prefabMarketGrowth}</dd>
          </div>
        </dl>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="font-display text-2xl font-bold">Popular areas</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {item.popularAreas.map((area) => (
                <li key={area} className="rounded-full bg-muted px-3 py-1 text-sm">
                  {area}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold">Manufacturers serving {item.name}</h2>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-muted-foreground">
              {item.topManufacturers.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </section>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Lending climate: <strong className="text-foreground">{item.lendingClimate}</strong>
        </p>
        <div className="mt-10 rounded-2xl bg-primary p-8 text-primary-foreground">
          <h2 className="font-display text-2xl font-bold">Ready to finance your modular home in {item.name}?</h2>
          <p className="mt-2 text-primary-foreground/80">
            Pre-qualify in 2 minutes. Get matched with lenders who specialize in {item.name} modular home financing.
          </p>
          <ButtonLink href="/get-started" variant="secondary" className="mt-6">
            Get Pre-Qualified
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
