import { Badge, ButtonLink, Container } from "@/components/ui";
import { SITE } from "@/lib/catalog";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Leaf,
  Shield,
  Sparkles,
  Timer,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ModFii - Prefab Home Mortgage Marketplace | Get Approved in 7 Days",
  description: SITE.description,
};

const PROBLEMS = [
  {
    title: "Denied for the wrong reasons",
    description: "Traditional lenders demand sky-high rates or deny loans entirely.",
  },
  {
    title: "Deals die in underwriting",
    description: "Lender confusion and construction complexity kills deals.",
  },
  {
    title: "You overpay for the same house",
    description: "Most lenders overcharge because they can't assess prefab value.",
  },
];

const FIXES = [
  {
    icon: Timer,
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
    number: "01",
    title: "Tell Us About Your Home",
    description: "Share your prefab home details in 3 minutes. We pull energy efficiency data directly from your manufacturer.",
  },
  {
    number: "02",
    title: "Get Matched with Specialists",
    description: "Our algorithm connects you with lenders who understand prefab construction and offer the best rates for your situation.",
  },
  {
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
  },
  {
    quote:
      "The green mortgage discount alone saved us $180/month. ModFii understood our Blu Homes project when everyone else treated it like a mobile home.",
    name: "Marcus & Elena Rodriguez",
    title: "Eco-conscious Homeowners",
    location: "Austin, TX",
    savings: "$21,600",
  },
  {
    quote:
      "As a prefab manufacturer, we refer all our buyers to ModFii. They've increased our close rate by 40% by solving the financing bottleneck.",
    name: "James Thornton",
    title: "VP Sales, Method Homes",
    location: "Seattle, WA",
    savings: "40% more closes",
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

export default function HomePage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative isolate min-h-[92vh] overflow-hidden bg-forest text-primary-foreground">
        <Image
          src="/images/hero-prefab.jpg"
          alt="Modern prefab home at dusk with warm interior light"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest/95 via-forest/80 to-forest/35" />
        <div className="hero-grid absolute inset-0 opacity-40" />
        <Container className="relative grid min-h-[92vh] items-center gap-10 py-28 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.8fr)]">
          <div>
            <Badge className="mb-6 bg-accent text-accent-foreground">The #1 Prefab Home Mortgage Platform</Badge>
            <h1 className="font-display text-4xl font-bold leading-[1.05] md:text-6xl lg:text-7xl">
              Stop Losing Your Dream Home to <span className="text-accent">Financing Nightmares</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/90 md:text-xl">
              Most lenders don&apos;t understand prefab homes—killing deals even when you&apos;re pre-approved. ModFii
              connects you with specialized lenders who get it, cutting approval times by 50%.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <ButtonLink href="/get-started" variant="secondary" size="lg">
                Get Pre-Approved Free
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/#how-it-works" variant="onPrimary" size="lg">
                See How It Works
              </ButtonLink>
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-white/70">
              <Sparkles className="h-4 w-4 text-accent" />
              Green mortgage options · No credit impact to explore
            </p>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -right-2 z-10 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-lg">
              🏆 Rated #1 by Prefab Buyers
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 backdrop-blur-md">
              <h2 className="text-center font-display text-xl font-bold">Why Homeowners Choose ModFii</h2>
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
              <ButtonLink href="/get-started" variant="accent" size="lg" className="mt-6 w-full">
                Start Free Pre-Qualification
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-card py-8">
        <Container className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Your Prefab Financing Partner</span>
          <span>Modular & Prefab Home Loans</span>
          <span>NMLS #{SITE.nmls}</span>
          <span>Equal Housing Opportunity</span>
        </Container>
      </section>

      <section className="py-20 md:py-28">
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
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              {PROBLEMS.map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {FIXES.map((item) => (
                <div key={item.title} className="group rounded-xl border border-border bg-background p-6">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition group-hover:scale-110">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold">{item.title}</h3>
                  <p className="mt-3 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden py-20 md:py-24">
        <Image src="/images/green-home.jpg" alt="" fill className="object-cover opacity-20" sizes="100vw" />
        <div className="absolute inset-0 bg-primary/90" />
        <Container className="relative grid items-center gap-10 lg:grid-cols-2">
          <div className="text-primary-foreground">
            <Badge className="mb-4 bg-accent text-accent-foreground">Green mortgages</Badge>
            <h2 className="font-display text-3xl font-bold md:text-5xl">Your sustainability should lower the rate.</h2>
            <p className="mt-5 text-lg text-primary-foreground/80">
              ENERGY STAR, HERS, and high-performance prefab packages can unlock discounted rates. We document
              manufacturer specs so eco-focused lenders can actually price the efficiency.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/15">
            <Image
              src="/images/interior-living.jpg"
              alt="Bright living room inside a modern prefab home"
              width={1200}
              height={800}
              className="h-full w-full object-cover"
            />
          </div>
        </Container>
      </section>

      <section id="how-it-works" className="bg-card py-20 md:py-32">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-medium tracking-wider text-primary uppercase">How it works</span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">Three steps from factory to financed.</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="rounded-2xl border border-border bg-background p-8">
                <p className="font-display text-4xl font-bold text-accent">{step.number}</p>
                <h3 className="mt-4 font-display text-2xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <ButtonLink href="/get-started" size="lg">
              See Your Options
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-medium tracking-wider text-primary uppercase">Success Stories</span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">Trusted by 2,000+ Prefab Homeowners</h2>
            <p className="mt-6 text-lg text-muted-foreground">
              Real stories from buyers who finally got the financing they deserved.
            </p>
          </div>
          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {STORIES.map((story) => (
              <figure key={story.name} className="rounded-2xl border border-border bg-background p-8">
                <p className="text-sm font-semibold text-accent">Saved {story.savings}</p>
                <blockquote className="mt-4 text-muted-foreground">&ldquo;{story.quote}&rdquo;</blockquote>
                <figcaption className="mt-6">
                  <p className="font-semibold">{story.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {story.title} · {story.location}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-muted/50 py-16">
        <Container className="grid gap-6 md:grid-cols-3">
          {[
            { icon: BadgeCheck, title: "Independent research", body: "Our recommendations are based on research, not lender relationships. We earn referral fees, but this never influences our guidance." },
            { icon: Building2, title: "Primary sources", body: "Information is sourced from official programs: FHA.gov, VA.gov, USDA.gov, CFPB, Fannie Mae, and Freddie Mac." },
            { icon: CheckCircle2, title: "Specialist review", body: "Content is written and reviewed by mortgage professionals with specialized experience in modular and prefab financing." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-background p-6">
              <item.icon className="mb-3 h-6 w-6 text-primary" />
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </Container>
        <Container className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <Link href="/editorial-policy" className="text-primary hover:underline">
            Read Our Editorial Policy
          </Link>
          <Link href="/about" className="text-primary hover:underline">
            About ModFii
          </Link>
          <Link href="/corrections" className="text-primary hover:underline">
            Corrections Policy
          </Link>
        </Container>
      </section>

      <section id="faq" className="py-20 md:py-32">
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-medium tracking-wider text-primary uppercase">FAQ</span>
            <h2 className="mt-4 font-display text-3xl font-bold md:text-5xl">Questions? We&apos;ve Got Answers</h2>
            <p className="mt-6 text-lg text-muted-foreground">Everything you need to know about financing your prefab home.</p>
          </div>
          <div className="mx-auto max-w-3xl space-y-4">
            {FAQS.map((item) => (
              <details key={item.q} className="rounded-xl border border-border bg-card px-6">
                <summary className="cursor-pointer py-6 text-left font-semibold hover:text-primary">{item.q}</summary>
                <p className="pb-6 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary-600" />
        <Container className="relative max-w-3xl text-center text-primary-foreground">
          <h2 className="font-display text-3xl font-bold md:text-5xl">Your Dream Prefab Home Deserves the Right Financing</h2>
          <p className="mt-6 text-xl text-primary-foreground/80">
            Stop letting outdated lenders kill your deal. Join 2,000+ happy homeowners who got approved in days, not
            months—at rates that reward sustainability.
          </p>
          <div className="mt-10 flex justify-center">
            <ButtonLink href="/get-started" variant="secondary" size="lg">
              Get Pre-Approved Free
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </Container>
      </section>
    </main>
  );
}
