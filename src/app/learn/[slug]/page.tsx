import { Breadcrumbs } from "@/components/page-shell";
import { Badge, ButtonLink, Container } from "@/components/ui";
import { authorSlug, getArticle } from "@/lib/catalog";
import { Markdown } from "@/lib/markdown";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article" };
  return { title: article.title, description: article.description };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();
  const related = article.relatedSlugs
    .map((relatedSlug) => getArticle(relatedSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <main className="pt-28 pb-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Learn", href: "/learn" }, { name: article.title }]} />
        <Badge>{article.category}</Badge>
        <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">{article.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{article.description}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          By{" "}
          <Link href={`/authors/${authorSlug(article.authorName)}`} className="font-medium text-primary hover:underline">
            {article.authorName}
          </Link>{" "}
          · {article.authorRole} · {article.readTime} · Updated {article.updatedAt ?? article.publishedAt}
        </p>
        <div className="mt-10">
          <Markdown content={article.content} />
        </div>
        {related.length > 0 ? (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold">Related reading</h2>
            <div className="mt-4 grid gap-4">
              {related.map((item) => (
                <Link key={item.slug} href={`/learn/${item.slug}`} className="rounded-xl border border-border p-4 hover:border-accent">
                  <p className="font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
        <div className="mt-12 rounded-2xl bg-accent/10 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">Ready to get matched?</h2>
          <p className="mt-2 text-muted-foreground">Pre-qualification takes about 2 minutes.</p>
          <ButtonLink href="/get-started" variant="accent" className="mt-5">
            Get Pre-Qualified
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
