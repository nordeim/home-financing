import { ButtonLink, Container, cn } from "@/components/ui";
import type { GuidePageContent } from "@/lib/guides";
import { ArrowRight, Calendar, ChevronDown, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";

export function Breadcrumbs({
  items,
  light = false,
  align = "left",
  chevron = false,
  className,
}: {
  items: Array<{ name: string; href?: string }>;
  light?: boolean;
  align?: "left" | "center";
  chevron?: boolean;
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("text-sm", light ? "text-primary-foreground/70" : "text-muted-foreground", className)}
    >
      <ol className={`flex flex-wrap items-center gap-2 ${align === "center" ? "justify-center" : ""}`}>
        {items.map((item, index) => (
          <li key={`${item.name}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              chevron ? (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
              ) : (
                <span aria-hidden>/</span>
              )
            ) : null}
            {item.href ? (
              <Link href={item.href} className="hover:text-inherit hover:underline">
                {item.name}
              </Link>
            ) : (
              <span className={cn("font-medium", light ? "text-primary-foreground" : "text-foreground")}>{item.name}</span>
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
 *
 * Pass-4 live-source alignment: optional `updated` line ("Last Updated: …",
 * Calendar icon — source renders it under the breadcrumbs on hub + loan
 * pages), contextual `eyebrowIcon`, optional hero `callout` paragraphs
 * (source "Here's the truth" glass card), and `crumbsOutside` for pages
 * where the source places breadcrumbs on the page background above the
 * photo panel (e.g. /modular-home-financing).
 */
export function PageHero({
  eyebrow,
  eyebrowIcon: EyebrowIcon = Star,
  title,
  titleSize = "lg",
  highlight,
  description,
  crumbs,
  imageSrc,
  stats,
  ctas,
  updated,
  callout,
  crumbsOutside = false,
}: {
  eyebrow?: string;
  eyebrowIcon?: ComponentType<{ className?: string }>;
  title: string;
  /** Source hero H1 scale (pass-5 probes): guide/loan pages 60px, glossary 48px. */
  titleSize?: "lg" | "md";
  highlight?: string;
  description: string;
  crumbs: Array<{ name: string; href?: string }>;
  imageSrc?: string;
  stats?: Array<{ label: string; value: string }>;
  ctas?: Array<{ label: string; href: string; variant?: "secondary" | "onPrimary" | "accent" | "outline" }>;
  updated?: string;
  callout?: GuidePageContent["callout"];
  crumbsOutside?: boolean;
}) {
  // The source hero breadcrumb trail starts at the section level (no "Home"
  // crumb inside the photo panel); the outside variant keeps the full trail.
  const heroCrumbs = crumbsOutside ? crumbs : crumbs.filter((c) => c.name !== "Home");
  const hero = (
    <section className="relative isolate overflow-hidden bg-forest pb-16 pt-28 text-primary-foreground md:pb-20 md:pt-32">
      {imageSrc ? (
        <>
          <Image src={imageSrc} alt="" fill className="object-cover opacity-45" sizes="100vw" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-forest/85 via-forest/80 to-forest/85" />
        </>
      ) : (
        <div className="absolute inset-0 bg-primary" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(38_92%_50%/0.16),transparent_60%)]" />
      <Container className="relative z-10">
        {!crumbsOutside ? <Breadcrumbs items={heroCrumbs} light align="center" className="mb-8" /> : null}
        <div className="mx-auto max-w-4xl text-center">
          {updated ? (
            <p className="mb-5 flex items-center justify-center gap-1.5 text-sm text-primary-foreground/75">
              <Calendar className="h-4 w-4" aria-hidden />
              Last Updated: {updated}
            </p>
          ) : null}
          {eyebrow ? (
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <EyebrowIcon className="h-4 w-4 text-accent" aria-hidden />
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={cn(
              "font-display font-bold leading-[1.08]",
              titleSize === "md" ? "text-4xl md:text-5xl" : "text-4xl md:text-6xl",
            )}
          >
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
        {callout && callout.length > 0 ? (
          <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-8 text-left backdrop-blur-md">
            <div className="space-y-4">
              {callout.map((para) => (
                <p key={para.lead} className="text-sm leading-relaxed text-white/85 md:text-base">
                  <span className="font-bold text-white">{para.lead}</span> {para.text}
                </p>
              ))}
            </div>
          </div>
        ) : null}
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

  if (!crumbsOutside) {
    return hero;
  }
  return (
    <>
      <section className="pt-24">
        <Container>
          <Breadcrumbs items={crumbs} className="mb-6" chevron />
        </Container>
      </section>
      {hero}
    </>
  );
}

export function GuideView({
  guide,
  crumbs,
  children,
  crumbsOutside = false,
}: {
  guide: GuidePageContent;
  crumbs: Array<{ name: string; href?: string }>;
  children?: ReactNode;
  crumbsOutside?: boolean;
}) {
  return (
    <>
      <PageHero
        eyebrow={guide.eyebrow}
        eyebrowIcon={guide.eyebrowIcon}
        title={guide.title}
        highlight={guide.highlight}
        description={guide.description}
        crumbs={crumbs}
        imageSrc={guide.heroImage}
        stats={guide.stats}
        ctas={guide.ctas ?? [{ label: guide.cta, href: "/get-started" }]}
        updated={guide.updated}
        callout={guide.callout}
        crumbsOutside={crumbsOutside}
      />
      {guide.author ? (
        <section className="border-b border-border bg-card py-8">
          <Container>
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                  <GuideAuthorIcon />
                </span>
                <div className="text-sm">
                  <p className="text-muted-foreground">Written by</p>
                  <p className="font-semibold">
                    {guide.author.name}
                    {guide.author.credential ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">{guide.author.credential}</span> : null}
                  </p>
                  <p className="text-muted-foreground">{guide.author.role}</p>
                </div>
              </div>
              {guide.reviewedBy ? (
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-primary">
                    <GuideAuthorIcon />
                  </span>
                  <div className="text-sm">
                    <p className="text-muted-foreground">Reviewed by</p>
                    <p className="font-semibold">
                      {guide.reviewedBy.name}
                      {guide.reviewedBy.credential ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">{guide.reviewedBy.credential}</span> : null}
                    </p>
                    <p className="text-muted-foreground">{guide.reviewedBy.role}</p>
                  </div>
                </div>
              ) : null}
            </div>
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
              {section.lead ? <p className="mt-4 font-medium text-foreground">{section.lead}</p> : null}
              {section.bullets ? (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
              {section.subsections?.map((sub) => (
                <div key={sub.heading} className="mt-6">
                  <h3 className="font-display text-xl font-semibold text-foreground">{sub.heading}</h3>
                  {sub.lead ? <p className="mt-2 font-medium text-foreground">{sub.lead}</p> : null}
                  {sub.body?.map((paragraph) => (
                    <p key={paragraph} className="mt-3 leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                  {sub.bullets ? (
                    <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
                      {sub.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </section>
          ))}
          {guide.faqs ? (
            <section className="mt-12" id="faqs">
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

function GuideAuthorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}
