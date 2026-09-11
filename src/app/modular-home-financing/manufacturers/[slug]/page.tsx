import { Breadcrumbs } from "@/components/page-shell";
import { Badge, ButtonLink, Container } from "@/components/ui";
import { getManufacturer } from "@/lib/catalog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getManufacturer(slug);
  if (!item) return { title: "Manufacturer" };
  return { title: `${item.name} Financing`, description: item.metaDescription || item.description };
}

export default async function ManufacturerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getManufacturer(slug);
  if (!item) notFound();

  return (
    <main className="pt-28 pb-20">
      <Container>
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Manufacturers", href: "/modular-home-financing/manufacturers" },
            { name: item.name },
          ]}
        />
        <Badge>{item.category}</Badge>
        <h1 className="mt-4 font-display text-4xl font-bold">{item.name} Financing</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{item.description}</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border p-4">
            <dt className="text-sm text-muted-foreground">Headquarters</dt>
            <dd className="mt-1 font-semibold">{item.headquarters}</dd>
          </div>
          <div className="rounded-xl border border-border p-4">
            <dt className="text-sm text-muted-foreground">Founded</dt>
            <dd className="mt-1 font-semibold">{item.founded}</dd>
          </div>
          <div className="rounded-xl border border-border p-4">
            <dt className="text-sm text-muted-foreground">Typical price range</dt>
            <dd className="mt-1 font-semibold">{item.priceRange}</dd>
          </div>
        </dl>
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <section>
            <h2 className="font-display text-2xl font-bold">Home types</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {item.homeTypes.map((type) => (
                <li key={type} className="rounded-full bg-muted px-3 py-1 text-sm">
                  {type}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl font-bold">Why lenders care</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
              {item.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </section>
        </div>
        <p className="mt-8 max-w-3xl text-muted-foreground">
          ModFii matches {item.name} buyers with lenders who have already closed factory-built files—so your packet is
          not treated like a mobile home or an unknown custom build.
        </p>
        <ButtonLink href="/get-started" variant="accent" className="mt-8">
          Find approved lenders
        </ButtonLink>
      </Container>
    </main>
  );
}
