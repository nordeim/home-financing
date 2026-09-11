import { LearnExplorer, type LearnArticle } from "@/components/learn-explorer";
import { articles } from "@/lib/catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Learn | Modular Home Financing Guides & Resources",
  description:
    "Free guides, calculators, and expert insights to help you navigate modular and prefab home financing with confidence.",
};

const FEATURED_SLUG = "complete-guide-prefab-home-financing-2026";

function toLearnArticle(article: (typeof articles)[number]): LearnArticle {
  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    category: article.category,
    readTime: article.readTime,
    tag: article.tag,
    authorName: article.authorName,
    authorRole: article.authorRole,
  };
}

export default function LearnPage() {
  const featuredArticle = articles.find((article) => article.slug === FEATURED_SLUG) ?? articles[0];
  const featured = toLearnArticle(featuredArticle);
  const rest = articles.filter((article) => article.slug !== featured.slug).map(toLearnArticle);

  return (
    <main className="pb-20">
      {/* Cream hero — mirrors modfii.com/learn (Learning Center pill + centered title) */}
      <section className="bg-gradient-to-b from-background via-muted/30 to-background py-14 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Learning Center
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold md:text-5xl">Master Prefab Home Financing</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Free guides, calculators, and expert insights to help you navigate the prefab mortgage landscape with
            confidence.
          </p>
        </div>
      </section>
      <LearnExplorer articles={rest} featured={featured} />
    </main>
  );
}
