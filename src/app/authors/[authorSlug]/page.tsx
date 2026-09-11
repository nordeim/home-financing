import { Breadcrumbs } from "@/components/page-shell";
import { Container } from "@/components/ui";
import { articlesByAuthor, getAuthor } from "@/lib/catalog";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ authorSlug: string }> }): Promise<Metadata> {
  const { authorSlug } = await params;
  const author = getAuthor(authorSlug);
  if (!author) return { title: "Author" };
  return { title: author.name, description: author.bio };
}

export default async function AuthorPage({ params }: { params: Promise<{ authorSlug: string }> }) {
  const { authorSlug } = await params;
  const author = getAuthor(authorSlug);
  if (!author) notFound();
  const posts = articlesByAuthor(author.slug);

  return (
    <main className="pt-28 pb-20">
      <Container className="max-w-3xl">
        <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Authors" }, { name: author.name }]} />
        <h1 className="font-display text-4xl font-bold">{author.name}</h1>
        <p className="mt-2 text-sm font-medium text-primary">{author.role}</p>
        <p className="mt-4 text-lg text-muted-foreground">{author.bio}</p>
        <h2 className="mt-10 font-display text-2xl font-bold">Articles</h2>
        {posts.length === 0 ? (
          <p className="mt-4 text-muted-foreground">Editorial contributions appear across ModFii state and loan guides.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link href={`/learn/${post.slug}`} className="font-semibold hover:text-primary">
                  {post.title}
                </Link>
                <p className="text-sm text-muted-foreground">{post.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </main>
  );
}
