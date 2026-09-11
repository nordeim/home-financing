import { Breadcrumbs } from "@/components/page-shell";
import { Badge, Container } from "@/components/ui";
import { articles, authorSlug } from "@/lib/catalog";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Learn | Modular Home Financing Guides & Resources",
  description:
    "Free guides, calculators, and expert insights to help you navigate modular and prefab home financing with confidence.",
};

export default function LearnPage() {
  return (
    <main className="pt-28 pb-20">
      <section className="bg-primary pb-16 text-primary-foreground">
        <Container className="pt-8">
          <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Learn" }]} light />
          <h1 className="font-display text-4xl font-bold md:text-5xl">Learn</h1>
          <p className="mt-4 max-w-2xl text-xl text-primary-foreground/80">
            Guides, case studies, and specialist explainers for factory-built home financing.
          </p>
        </Container>
      </section>
      <Container className="grid gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/learn/${article.slug}`}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-accent hover:shadow-md"
          >
            <div className="mb-3 flex items-center gap-2">
              <Badge>{article.category}</Badge>
              {article.tag ? <span className="text-xs text-muted-foreground">{article.tag}</span> : null}
            </div>
            <h2 className="font-display text-xl font-semibold">{article.title}</h2>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{article.description}</p>
            <p className="mt-4 text-xs text-muted-foreground">
              {article.readTime} · {article.authorName}
            </p>
            <p className="sr-only">Author profile {authorSlug(article.authorName)}</p>
          </Link>
        ))}
      </Container>
    </main>
  );
}
