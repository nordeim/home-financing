"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  FileText,
  Leaf,
  Mail,
  Play,
  Search,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Button, ButtonLink, Container, cn } from "@/components/ui";
import { calculatePayment, formatUsd } from "@/lib/calculator";

export interface LearnArticle {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  tag?: string;
  authorName: string;
  authorRole: string;
}

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  Guide: BookOpen,
  Article: FileText,
  Video: Play,
  "Case Study": Briefcase,
  Tool: Zap,
};

const FILTERS = ["All", "Guide", "Article", "Video", "Case Study", "Tool"] as const;
type Filter = (typeof FILTERS)[number];

function tagPillClass(tag: string): string {
  if (tag === "New") return "bg-accent/10 text-accent-foreground";
  if (tag === "Popular") return "bg-primary/10 text-primary";
  return "bg-muted text-muted-foreground";
}

function ArticleCard({ article }: { article: LearnArticle }) {
  const Icon = CATEGORY_ICONS[article.category] ?? FileText;
  return (
    <Link
      href={`/learn/${article.slug}`}
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition hover:border-accent hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        {article.tag ? (
          <span className={cn("rounded-full px-3 py-1 text-xs font-medium", tagPillClass(article.tag))}>
            {article.tag}
          </span>
        ) : null}
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-primary">{article.category}</p>
      <h3 className="mt-2 font-display text-lg font-semibold leading-snug group-hover:text-primary">
        {article.title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{article.description}</p>
      <p className="mt-4 text-xs text-muted-foreground">
        {article.readTime} · By {article.authorName}
      </p>
      <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Read more
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </p>
    </Link>
  );
}

/** Compact affordability calculator embedded in the Learn hub (source parity). */
function AffordabilityTool() {
  const [homePrice, setHomePrice] = useState(225_000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [termYears, setTermYears] = useState(30);
  const [energyEfficient, setEnergyEfficient] = useState(false);

  const downPayment = Math.round((homePrice * downPct) / 100);
  const effectiveRate = energyEfficient ? Math.max(0, rate - 0.375) : rate;
  const result = useMemo(
    () =>
      calculatePayment({
        homePrice,
        downPayment,
        annualRate: effectiveRate,
        termYears,
        annualTaxRate: 1.1,
        annualInsurance: 1_000,
        hoaMonthly: 0,
      }),
    [homePrice, downPayment, effectiveRate, termYears],
  );
  const totalInterest = Math.max(0, result.monthlyPi * termYears * 12 - result.loanAmount);

  const segments = [
    { label: "P&I", value: result.monthlyPi, color: "bg-primary" },
    { label: "Tax", value: result.monthlyTax, color: "bg-accent" },
    { label: "Insurance", value: result.monthlyInsurance, color: "bg-secondary" },
    ...(result.monthlyPmi > 0 ? [{ label: "PMI", value: result.monthlyPmi, color: "bg-destructive/70" }] : []),
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="bg-primary px-6 py-4 text-primary-foreground">
        <p className="font-display text-lg font-bold">Prefab Home Affordability Calculator</p>
        <p className="text-sm text-primary-foreground/75">
          Estimate your monthly payment with green discounts applied.
        </p>
      </div>
      <div className="grid gap-8 p-6 md:grid-cols-2 md:p-8">
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="tool-price" className="font-medium">Home Price</label>
              <span className="font-semibold">{formatUsd(homePrice)}</span>
            </div>
            <input
              id="tool-price"
              type="range"
              min={50_000}
              max={750_000}
              step={5_000}
              value={homePrice}
              onChange={(event) => setHomePrice(Number(event.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="tool-down" className="font-medium">% Down Payment</label>
              <span className="font-semibold">{downPct}% ({formatUsd(downPayment)})</span>
            </div>
            <input
              id="tool-down"
              type="range"
              min={0}
              max={50}
              step={1}
              value={downPct}
              onChange={(event) => setDownPct(Number(event.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="tool-rate" className="font-medium">Interest Rate</label>
              <span className="font-semibold">{effectiveRate.toFixed(2)}%</span>
            </div>
            <input
              id="tool-rate"
              type="range"
              min={3}
              max={12}
              step={0.125}
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              className="mt-2 w-full accent-primary"
            />
          </div>
          <div>
            <p className="text-sm font-medium">Loan Term</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[10, 15, 20, 25, 30].map((years) => (
                <Button
                  key={years}
                  variant={termYears === years ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTermYears(years)}
                >
                  {years} yr
                </Button>
              ))}
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-secondary/70 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={energyEfficient}
              onChange={(event) => setEnergyEfficient(event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            <Leaf className="h-4 w-4 text-primary" aria-hidden />
            <span>
              <span className="font-medium">Energy Efficient Home</span>
              <span className="text-muted-foreground"> — 0.375% rate discount</span>
            </span>
          </label>
        </div>
        <div className="flex flex-col">
          <div className="rounded-xl bg-secondary/60 p-5">
            <p className="text-sm text-muted-foreground">Estimated Monthly Payment</p>
            <p className="mt-1 font-display text-4xl font-bold text-primary">
              {formatUsd(Math.round(result.monthlyTotal))}
              <span className="text-base font-semibold text-muted-foreground">/month</span>
            </p>
            <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-border" role="img" aria-label="Payment breakdown">
              {segments.map((segment) => (
                <span
                  key={segment.label}
                  className={segment.color}
                  style={{ width: `${(segment.value / total) * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {segments.map((segment) => (
                <span key={segment.label} className="inline-flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", segment.color)} aria-hidden />
                  {segment.label} {formatUsd(Math.round(segment.value))}
                </span>
              ))}
            </div>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted-foreground">Loan Amount</dt>
              <dd className="font-semibold">{formatUsd(result.loanAmount)}</dd>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted-foreground">Total Interest</dt>
              <dd className="font-semibold">{formatUsd(Math.round(totalInterest))}</dd>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted-foreground">Down Payment</dt>
              <dd className="font-semibold">{formatUsd(downPayment)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">PMI</dt>
              <dd className="font-semibold">
                {result.monthlyPmi > 0 ? `${formatUsd(Math.round(result.monthlyPmi))}/mo` : "$0.00/mo"}
              </dd>
            </div>
          </dl>
          <a
            href={`mailto:team@modfii.com?subject=${encodeURIComponent("Full affordability report")}&body=${encodeURIComponent(
              `Home price: ${formatUsd(homePrice)}\nDown payment: ${formatUsd(downPayment)} (${downPct}%)\nRate: ${effectiveRate.toFixed(3)}%\nTerm: ${termYears} years\nEstimated monthly payment: ${formatUsd(Math.round(result.monthlyTotal))}`,
            )}`}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-600"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Get Your Full Report
          </a>
        </div>
      </div>
    </div>
  );
}

export function LearnExplorer({ articles, featured }: { articles: LearnArticle[]; featured: LearnArticle }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const counts = useMemo(() => {
    const map = new Map<string, number>([["All", articles.length + 1]]);
    for (const article of [featured, ...articles]) {
      map.set(article.category, (map.get(article.category) ?? 0) + 1);
    }
    return map;
  }, [articles, featured]);

  const normalizedQuery = query.trim().toLowerCase();
  const visible = articles.filter((article) => {
    const matchesFilter = filter === "All" || article.category === filter;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      `${article.title} ${article.description} ${article.authorName}`.toLowerCase().includes(normalizedQuery);
    return matchesFilter && matchesQuery;
  });

  return (
    <Container className="py-14 md:py-16">
      {/* Search + filter chips */}
      <div className="mx-auto max-w-3xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <label htmlFor="learn-search" className="sr-only">Search articles, guides, and resources</label>
          <input
            id="learn-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles, guides, and resources..."
            className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-sm outline-none transition focus:border-primary"
          />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {FILTERS.map((option) => (
            <Button
              key={option}
              variant={filter === option ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilter(option)}
            >
              {option}
              <span className={cn("ml-1", filter === option ? "text-primary-foreground/70" : "text-muted-foreground")}>
                ({counts.get(option) ?? 0})
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Featured guide banner */}
      <Link
        href={`/learn/${featured.slug}`}
        className="group mt-10 flex flex-col gap-5 rounded-2xl border border-accent/40 bg-accent/5 p-6 transition hover:border-accent md:p-8"
      >
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          Featured Guide
        </span>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-bold group-hover:text-primary md:text-3xl">{featured.title}</h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">{featured.description}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              {featured.readTime} · By {featured.authorName}
            </p>
          </div>
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary md:flex">
            <BookOpen className="h-7 w-7" aria-hidden />
          </span>
        </div>
      </Link>

      {/* Grid */}
      {visible.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No resources match your search yet. Try a different keyword or filter.
        </p>
      )}

      {/* Interactive tools */}
      <div className="mt-20 text-center">
        <h2 className="font-display text-3xl font-bold md:text-4xl">Interactive Tools</h2>
        <p className="mt-3 text-muted-foreground">Calculate your prefab home affordability with our free tools</p>
      </div>
      <div className="mt-8">
        <AffordabilityTool />
      </div>

      {/* Newsletter */}
      <div className="mt-20 rounded-3xl bg-cream px-6 py-12 text-center md:py-16">
        <h2 className="font-display text-3xl font-bold">Get Weekly Prefab Insights</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Join 5,000+ homeowners and builders receiving our weekly insights on prefab mortgages, market updates, and
          exclusive guides.
        </p>
        <ButtonLink
          href="mailto:team@modfii.com?subject=Subscribe%20to%20Prefab%20Insights"
          variant="primary"
          size="lg"
          className="mt-6"
        >
          Subscribe Free
          <ArrowRight className="h-4 w-4" />
        </ButtonLink>
        <p className="mt-4 text-xs text-muted-foreground">No spam ever. Unsubscribe anytime.</p>
      </div>
    </Container>
  );
}
