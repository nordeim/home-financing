import { Badge, ButtonLink, Container } from "@/components/ui";
import type { GuidePageContent } from "@/lib/guides";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function Breadcrumbs({
  items,
  light = false,
}: {
  items: Array<{ name: string; href?: string }>;
  light?: boolean;
}) {
  return (
    <nav aria-label="Breadcrumb" className={`mb-8 text-sm ${light ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center gap-2">
            {index > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-inherit hover:underline">
                {item.name}
              </Link>
            ) : (
              <span className={light ? "text-primary-foreground" : "text-foreground"}>{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  imageSrc,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  crumbs: Array<{ name: string; href?: string }>;
  imageSrc?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-primary pt-28 pb-16 text-primary-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(38_92%_50%/0.18),transparent_60%)]" />
      {imageSrc ? (
        <Image src={imageSrc} alt="" fill className="object-cover opacity-20" sizes="100vw" />
      ) : null}
      <Container className="relative z-10">
        <Breadcrumbs items={crumbs} light />
        {eyebrow ? <Badge className="mb-4 bg-accent text-accent-foreground">{eyebrow}</Badge> : null}
        <h1 className="max-w-4xl font-display text-4xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-xl text-primary-foreground/80">{description}</p>
      </Container>
    </section>
  );
}

export function GuideView({
  guide,
  crumbs,
  children,
}: {
  guide: GuidePageContent;
  crumbs: Array<{ name: string; href?: string }>;
  children?: ReactNode;
}) {
  return (
    <>
      <PageHero
        eyebrow={guide.eyebrow}
        title={guide.title}
        description={guide.description}
        crumbs={crumbs}
        imageSrc={guide.heroImage}
      />
      {guide.stats ? (
        <section className="border-b border-border bg-card">
          <Container className="grid grid-cols-1 gap-6 py-8 sm:grid-cols-3">
            {guide.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </Container>
        </section>
      ) : null}
      <Container className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article>
          {guide.sections.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="font-display text-2xl font-bold text-foreground">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-4 text-lg leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
              {section.bullets ? (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
          {guide.faqs ? (
            <section className="mt-12">
              <h2 className="mb-6 font-display text-2xl font-bold">Frequently asked questions</h2>
              <div className="space-y-4">
                {guide.faqs.map((faq) => (
                  <details key={faq.question} className="rounded-xl border border-border bg-card px-5 py-4">
                    <summary className="cursor-pointer font-semibold">{faq.question}</summary>
                    <p className="mt-3 text-muted-foreground">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
          {children}
        </article>
        <aside className="h-fit rounded-2xl border border-accent/20 bg-accent/10 p-6">
          <h2 className="font-display text-xl font-bold">Get pre-qualified</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            2 minutes. Soft pull only. We never sell your data.
          </p>
          <ButtonLink href="/get-started" variant="accent" className="mt-5 w-full">
            {guide.cta}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </aside>
      </Container>
      {guide.related ? (
        <Container className="pb-20">
          <h2 className="mb-6 font-display text-2xl font-bold">Related resources</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {guide.related.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl border border-border p-5 transition hover:border-accent"
              >
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </Link>
            ))}
          </div>
        </Container>
      ) : null}
    </>
  );
}
