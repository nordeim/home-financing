import { ButtonLink, Container } from "@/components/ui";
import { Reveal } from "@/components/reveal";
import { SITE } from "@/lib/catalog";
import {
  ArrowRight,
  Ban,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  DollarSign,
  FileText,
  HelpCircle,
  Home,
  Leaf,
  Shield,
  ShieldCheck,
  Star,
  Users,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ModFii - Prefab Home Mortgage Marketplace | Get Approved in 7 Days",
  description: SITE.description,
};

const HERO_CHECKS = ["No credit impact", "0.5% closing fee", "Green mortgage options"];

const PARTNER_WORDMARKS = [
  { src: "/brand/wordmarks/dvele-qHduDYI9.png", alt: "Dvele" },
  { src: "/brand/wordmarks/plant-prefab-BZiOWTM8.png", alt: "Plant Prefab" },
  { src: "/brand/wordmarks/excel-homes-7uiBs08K.png", alt: "Excel Homes" },
  { src: "/brand/wordmarks/skyline.png", alt: "Skyline" },
  { src: "/brand/wordmarks/dutch-housing-DfGaFGP9.png", alt: "Dutch Housing" },
];

const INTRO_CARDS = [
  {
    icon: FileText,
    title: "How Financing Works",
    body: "Financing a modular or prefab home differs from traditional mortgages because these homes are built in factories. Most prefab loans start as construction loans that convert to traditional mortgages once complete. Some buyers use their land as equity, while others finance land and home together.",
  },
  {
    icon: Home,
    title: "Loan Types Available",
    body: "Multiple loan programs designed for modular and prefab construction:",
    chips: ["FHA Loans", "VA Loans", "USDA Loans", "Construction"],
  },
  {
    icon: Users,
    title: "Who We Help",
    body: "First-time buyers, families upgrading, retirees downsizing, and investors building rentals. We specialize in helping buyers rejected by traditional lenders who don't understand prefab. Credit scores from 580 accepted.",
  },
  {
    icon: HelpCircle,
    title: "Why Prefab Financing Is Different",
    body: "Traditional lenders confuse modular homes with manufactured or mobile homes. Modular homes meet the same building codes as site-built, qualify for conventional financing, and are titled as real property. We match you with lenders who understand the distinction.",
  },
];

const PROBLEMS = [
  {
    icon: Ban,
    title: "Misclassified as 'Mobile Homes'",
    description: "Traditional lenders demand sky-high rates or deny loans entirely.",
  },
  {
    icon: Clock,
    title: "60+ Day Approval Delays",
    description: "Lender confusion and construction complexity kills deals.",
  },
  {
    icon: DollarSign,
    title: "2-3% Hidden Closing Fees",
    description: "Most lenders overcharge because they can't assess prefab value.",
  },
];

const FIXES = [
  {
    icon: Zap,
    title: "7-Day Approvals",
    description: "Pre-vetted lenders who understand prefab cut weeks off your timeline.",
  },
  {
    icon: Leaf,
    title: "Green Mortgage Discounts",
    description: "Lower rates for energy-efficient homes—your sustainability pays off.",
  },
  {
    icon: Shield,
    title: "Deal Protection",
    description: "Prefab-friendly appraisers and inspectors who won't derail closing.",
  },
];

const STEPS = [
  {
    icon: FileText,
    number: "01",
    title: "Tell Us About Your Home",
    description: "Share your prefab home details in 3 minutes. We pull energy efficiency data directly from your manufacturer.",
  },
  {
    icon: Users,
    number: "02",
    title: "Get Matched with Specialists",
    description: "Our algorithm connects you with lenders who understand prefab construction and offer the best rates for your situation.",
  },
  {
    icon: Home,
    number: "03",
    title: "Close with Confidence",
    description: "Access our network of prefab-friendly appraisers and inspectors. Get approved in days, not months.",
  },
];

const STORIES = [
  {
    quote:
      "After three banks turned us down, ModFii connected us with a lender who approved our Plant Prefab home in 8 days. We closed at 0.7% below what traditional lenders quoted.",
    name: "Sarah Chen",
    title: "First-time Prefab Buyer",
    location: "Portland, OR",
    savings: "$14,200",
    avatar: "/images/avatars/sarah-chen.jpg",
  },
  {
    quote:
      "The green mortgage discount alone saved us $180/month. ModFii understood our Blu Homes project when everyone else treated it like a mobile home.",
    name: "Marcus & Elena Rodriguez",
    title: "Eco-conscious Homeowners",
    location: "Austin, TX",
    savings: "$21,600",
    avatar: "/images/avatars/marcus-elena-rodriguez.jpg",
  },
  {
    quote:
      "As a prefab manufacturer, we refer all our buyers to ModFii. They've increased our close rate by 40% by solving the financing bottleneck.",
    name: "James Thornton",
    title: "VP Sales, Method Homes",
    location: "Seattle, WA",
    savings: "40% more closes",
    avatar: "/images/avatars/james-thornton.jpg",
  },
];

const FAQS = [
  {
    q: "What does ModFii cost?",
    a: "ModFii is completely free for homebuyers. No fees, no catch. We're paid by our lender partners when you find your match—similar to how LendingTree and Bankrate work. You get access to lenders who specialize in prefab and modular homes without paying a dime for the introduction.",
  },
  {
    q: "What types of prefab homes do you finance?",
    a: "We work with all types of modern prefab and modular construction—including panelized, modular, manufactured homes (post-1976), and container homes. Our lender network understands the full spectrum of factory-built housing.",
  },
  {
    q: "Will applying affect my credit score?",
    a: "No. Our initial rate estimates use a soft credit pull that doesn't impact your score. A hard pull only happens once you choose to move forward with a specific lender.",
  },
  {
    q: "How do green mortgages work?",
    a: "Homes with high energy efficiency ratings qualify for discounted rates from our eco-focused lending partners. We pull efficiency data directly from manufacturers to document your home's green credentials.",
  },
  {
    q: "How long does approval take?",
    a: "Average approvals take just 7 days—compared to the 45-60+ days typical with banks unfamiliar with prefab construction.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "ModFii",
      url: "https://modfii.com",
      description: "Mortgage marketplace for prefab and modular home buyers.",
      email: SITE.email,
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ],
};

function Stars() {
  return (
    <div className="flex gap-1" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-5 w-5 fill-accent text-accent" aria-hidden />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero — source recipe: daylight photo, horizontal forest wash + bottom fade, glass stats card.
          Pass-5: section paddings match the source (pt-24/md:pt-28, pb-16/md:pb-20) — no container py. */}
      <section className="relative isolate overflow-hidden bg-forest pb-16 pt-24 text-primary-foreground md:pb-20 md:pt-28">
        <Image
          src="/images/hero-prefab.jpg"
          alt="Modern prefab home"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/90 to-primary/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/95" />
        <Container className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl text-white">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Star className="h-4 w-4 fill-accent text-accent" aria-hidden />
              The #1 Prefab Home Mortgage Platform
            </p>
            <h2 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              Stop Losing Your Dream Home to <span className="text-accent">Financing Nightmares</span>
            </h2>
            <p className="mt-6 max-w-xl text-lg text-white/90 md:text-xl">
              Most lenders don&apos;t understand prefab homes—killing deals even when you&apos;re pre-approved. ModFii
              connects you with specialized lenders who get it, cutting approval times by 50%.
            </p>
            <div className="mt-8">
              <ButtonLink href="/get-started" variant="secondary" size="lg">
                Get Pre-Approved in 15 Minutes
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
            <ul className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/85">
              {HERO_CHECKS.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-accent/70">
                    <Check className="h-3 w-3 text-accent" aria-hidden />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -right-4 z-10 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-lg">
              🏆 Rated #1 by Prefab Buyers
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
              <h3 className="text-center font-display text-xl font-bold">Why Homeowners Choose ModFii</h3>
              <p className="mt-1 text-center text-sm text-white/70">Specialized lenders, better outcomes</p>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { value: "$12K", label: "Avg. savings", accent: true },
                  { value: "7", label: "Day approval", accent: false },
                  { value: "94%", label: "Success rate", accent: false },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-white/10 p-4 text-center">
                    <p className={`text-3xl font-bold ${stat.accent ? "text-accent" : "text-white"}`}>{stat.value}</p>
                    <p className="mt-1 text-xs text-white/70">{stat.label}</p>
                  </div>
                ))}
              </div>
              <ButtonLink href="/get-started" variant="accent" size="lgSm" className="mt-6 w-full">
                Start Free Pre-Qualification
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Trusted-by wordmark strip — source chrome: py-8 bg-muted/30 border-y border-border/50 */}
      <section className="border-y border-border/50 bg-muted/30 py-8">
        <Container>
          <p className="text-center text-sm text-muted-foreground">Trusted by buyers of leading manufacturers</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {PARTNER_WORDMARKS.map((mark) => (
              <span key={mark.alt} className="flex items-center justify-center opacity-80 transition-opacity hover:opacity-100">
                <Image src={mark.src} alt={mark.alt} width={168} height={32} className="h-8 w-auto object-contain" />
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* Intro — Modular & Prefab Home Loans (lazy-revealed on the source).
          Pass-5: source renders the "Your Prefab Financing Partner" pill above the
          document H1 and washes the section with a muted gradient. */}
      <section className="overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background py-12 md:py-16">
        <Container>
          <Reveal className="mx-auto mb-14 max-w-3xl text-center">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              Your Prefab Financing Partner
            </span>
            <h1 className="font-display text-3xl font-bold md:text-5xl">Modular &amp; Prefab Home Loans</h1>
            <p className="mt-6 text-lg text-muted-foreground">
              ModFii is the leading marketplace connecting prefab, modular, and tiny home buyers with lenders who
              specialize in factory-built construction financing. We help you get approved faster, with better rates,
              and without the confusion that comes from working with traditional mortgage lenders.
            </p>
          </Reveal>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            {INTRO_CARDS.map((card, index) => (
              <Reveal key={card.title} variant="card" delay={index * 75}>
                <div className="h-full rounded-2xl border border-border bg-card p-8">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                      <card.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h2 className="font-display text-xl font-semibold">{card.title}</h2>
                  </div>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{card.body}</p>
                  {card.chips ? (
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {card.chips.map((chip) => (
                        <span
                          key={chip}
                          className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-foreground"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                          {chip}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 text-center">
            <ButtonLink href="/modular-home-financing/loan-options" size="lgSm">
              Explore All Loan Options
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Problem / Solution */}
      <section className="py-20 md:py-24">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-5xl">
              Prefab Financing is Broken. <span className="text-primary">We Fixed It.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Traditional lenders don&apos;t understand modern prefab construction. ModFii connects you with specialists
              who do.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-x-8 gap-y-10 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-destructive">The Problem</p>
              <div className="space-y-4">
                {PROBLEMS.map((item) => (
                  <div key={item.title} className="flex gap-4 rounded-xl border border-destructive/15 bg-destructive/5 p-6">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                      <item.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold">{item.title}</h3>
                      <p className="mt-1 text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">Our Solution</p>
              <div className="space-y-4">
                {FIXES.map((item) => (
                  <div
                    key={item.title}
                    className="group flex gap-4 rounded-xl border border-primary/15 bg-secondary/60 p-6"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:scale-110">
                      <item.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold">{item.title}</h3>
                      <p className="mt-1 text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 text-center">
            <ButtonLink href="/modular-home-financing/loan-options" size="lgSm">
              See Your Options
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-card py-20 md:py-32">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">How It Works</span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">
              From Application to Keys in 3 Simple Steps
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              We&apos;ve transformed a 60-day nightmare into a 15-minute application and 7-day approval process.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <div key={step.number} className="relative rounded-2xl border border-border bg-background p-8">
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-6 top-4 font-display text-7xl font-bold text-secondary"
                >
                  {step.number}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-6 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-muted-foreground">{step.description}</p>
                {index < STEPS.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute -right-6 top-16 hidden h-px w-6 bg-border md:block"
                  />
                ) : null}
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Success stories */}
      <section className="py-20 md:py-28">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">Success Stories</span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">Trusted by 2,000+ Prefab Homeowners</h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Real stories from buyers who finally got the financing they deserved.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {STORIES.map((story) => (
              <figure key={story.name} className="flex flex-col rounded-2xl border border-border bg-background p-8 transition-shadow hover:shadow-lg">
                <Stars />
                <blockquote className="mt-5 flex-1 text-muted-foreground">&ldquo;{story.quote}&rdquo;</blockquote>
                <figcaption className="mt-6 flex items-center gap-4">
                  <Image
                    src={story.avatar}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{story.name}</p>
                    <p className="text-sm text-muted-foreground">{story.title}</p>
                    <p className="text-sm text-muted-foreground">{story.location}</p>
                  </div>
                </figcaption>
                <div className="mt-6 border-t border-border pt-5">
                  <p className="text-sm text-muted-foreground">Total savings</p>
                  <p className="mt-1 font-display text-2xl font-bold text-primary">{story.savings}</p>
                </div>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      {/* Our Standards */}
      <section className="bg-muted/50 py-16">
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold">Our Standards</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              ModFii is committed to providing accurate, unbiased information to help you make informed decisions about
              prefab home financing.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Editorially Independent", body: "Our recommendations are based on research, not lender relationships. We earn referral fees, but this never influences our guidance." },
              { icon: BookOpen, title: "Government Sources", body: "Information is sourced from official programs: FHA.gov, VA.gov, USDA.gov, CFPB, Fannie Mae, and Freddie Mac." },
              { icon: Users, title: "Expert Reviewed", body: "Content is written and reviewed by mortgage professionals with specialized experience in modular and prefab financing." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-card p-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-base font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/editorial-policy" className="text-primary hover:underline">
              Read Our Editorial Policy
            </Link>
            <span aria-hidden className="text-border">·</span>
            <Link href="/about" className="text-primary hover:underline">
              About ModFii
            </Link>
            <span aria-hidden className="text-border">·</span>
            <Link href="/corrections" className="text-primary hover:underline">
              Corrections Policy
            </Link>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 md:py-32">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-primary">FAQ</span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">Questions? We&apos;ve Got Answers</h2>
            <p className="mt-6 text-lg text-muted-foreground">Everything you need to know about financing your prefab home.</p>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            {FAQS.map((item) => (
              <details key={item.q} name="home-faq" className="group rounded-xl border border-border bg-card px-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-6 text-left hover:text-primary [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base font-normal">{item.q}</h3>
                  <ChevronDown className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <p className="pb-6 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-600" />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at center, white 1.5px, transparent 1.5px)",
            backgroundSize: "56px 56px",
          }}
        />
        <Container className="relative max-w-3xl text-center text-primary-foreground">
          <h2 className="font-display text-3xl font-bold md:text-5xl">Your Dream Prefab Home Deserves the Right Financing</h2>
          <p className="mt-6 text-xl text-primary-foreground/80">
            Stop letting outdated lenders kill your deal. Join 2,000+ happy homeowners who got approved in days, not
            months—at rates that reward sustainability.
          </p>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/get-started" variant="secondary" size="xl">
              Get Pre-Approved Free
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <p className="mt-5 flex items-center justify-center gap-2 text-sm text-primary-foreground/75">
            <Shield className="h-4 w-4" aria-hidden />
            No credit impact • 15-minute application • Cancel anytime
          </p>
        </Container>
      </section>
    </main>
  );
}
