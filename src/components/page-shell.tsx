import { ButtonLink, Container, cn } from "@/components/ui";
import type { GuidePageContent } from "@/lib/guides";
import { ArrowRight, ChevronDown, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function Breadcrumbs({
  items,
  light = false,
  align = "left",
}: {
  items: Array<{ name: string; href?: string }>;
  light?: boolean;
  align?: "left" | "center";
}) {
  return (
    <nav aria-label="Breadcrumb" className={`mb-8 text-sm ${light ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
      <ol className={`flex flex-wrap items-center gap-2 ${align === "center" ? "justify-center" : ""}`}>
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

/**
 * Shared interior hero — centered, photo-backed with a deep forest overlay,
 * optional eyebrow pill, amber-highlighted second title line, stat chips and
 * CTA pair, mirroring the modfii.com page heroes.
 */
export function PageHero({
  eyebrow,
  title,
  highlight,
  description,
  crumbs,
  imageSrc,
  stats,
  ctas,
}: {
  eyebrow?: string;
  title: string;
  highlight?: string;
  description: string;
  crumbs: Array<{ name: string; href?: string }>;
  imageSrc?: string;
  stats?: Array<{ label: string; value: string }>;
  ctas?: Array<{ label: string; href: string; variant?: "secondary" | "onPrimary" }>;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-forest pb-16 pt-32 text-primary-foreground md:pb-20 md:pt-36">
      {imageSrc ? (
        <>
          <Image src={imageSrc} alt="" fill className="object-cover opacity-35" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/85 to-forest/90" />
        </>
      ) : (
        <div className="absolute inset-0 bg-primary" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(38_92%_50%/0.16),transparent_60%)]" />
      <Container className="relative z-10">
        <Breadcrumbs items={crumbs} light align="center" />
        <div className="mx-auto max-w-4xl text-center">
          {eyebrow ? (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Star className="h-4 w-4 fill-accent text-accent" aria-hidden />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="font-display text-4xl font-bold leading-[1.08] md:text-6xl">
            {title}
            {highlight ? (
              <>
                {" "}
                <span className="text-accent">{highlight}</span>
              </>
            ) : null}
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-white/85 md:text-xl">{description}</p>
          {ctas && ctas.length > 0 ? (
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {ctas.map((cta, index) => (
                <ButtonLink
                  key={cta.href}
                  href={cta.href}
                  variant={cta.variant ?? (index === 0 ? "secondary" : "onPrimary")}
                  size="lg"
                >
                  {cta.label}
                  {index === 0 ? <ArrowRight className="h-4 w-4" /> : null}
                </ButtonLink>
              ))}
            </div>
          ) : null}
        </div>
        {stats && stats.length > 0 ? (
          <div
            className={cn(
              "mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2",
              stats.length >= 4 ? "lg:grid-cols-4" : "sm:grid-cols-3",
            )}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-white/15 bg-white/10 px-4 py-5 text-center backdrop-blur-sm">
                <p className="text-xs text-white/70">{stat.label}</p>
                <p className="mt-1 font-display text-xl font-bold text-accent">{stat.value}</p>
              </div>
            ))}
          </div>
        ) : null}
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
        highlight={guide.highlight}
        description={guide.description}
        crumbs={crumbs}
        imageSrc={guide.heroImage}
        stats={guide.stats}
        ctas={[{ label: guide.cta, href: "/get-started" }]}
      />
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
                  <details key={faq.question} className="group rounded-xl border border-border bg-card px-5 py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                      {faq.question}
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                    </summary>
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
