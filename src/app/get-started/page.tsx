import { PrequalForm } from "@/components/prequal-form";
import { Container } from "@/components/ui";
import { BadgeCheck, Clock, FileText, Handshake, HelpCircle, Home, ShieldCheck, Star, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  description:
    "Get pre-approved for your prefab home in minutes. Specialized lenders, green mortgage discounts, no impact to your credit to explore options.",
};

const BENEFITS = [
  {
    icon: Clock,
    title: "2-Minute Application",
    body: "Quick and easy form—no lengthy paperwork required.",
  },
  {
    icon: ShieldCheck,
    title: "No Credit Impact",
    body: "Soft inquiry only—your credit score stays safe.",
  },
  {
    icon: Users,
    title: "Prefab Specialists Only",
    body: "Lenders who understand modular construction.",
  },
  {
    icon: BadgeCheck,
    title: "Free Service",
    body: "No fees to you—lenders pay us when you close.",
  },
];

// Source /get-started "Common Questions" sidebar block (pass-7 probe).
const COMMON_QUESTIONS = [
  {
    q: "Is this really free?",
    a: "Yes! Lenders pay us a referral fee when you close. You never pay anything to ModFii.",
  },
  {
    q: "Will this hurt my credit?",
    a: "No. We only do a soft inquiry to match you with lenders. Your credit score stays safe.",
  },
  {
    q: "What types of homes qualify?",
    a: "Modular, prefab, manufactured, ADUs, and more. We specialize in factory-built housing.",
  },
];

// Live-source /get-started band below the hero (modfii.com parity, 2026-09-12).
const FUNNEL_STEPS = [
  {
    icon: FileText,
    title: "Share Your Project",
    body: "Tell us about your prefab home, budget, and timeline in our quick 2-minute form.",
  },
  {
    icon: Handshake,
    title: "Get Matched",
    body: "We connect you with lenders from our network who specialize in your home type.",
  },
  {
    icon: Home,
    title: "Choose Your Lender",
    body: "Compare offers with the help of our team and pick the best fit for you.",
  },
];

export default function GetStartedPage() {
  return (
    <main>
      {/* Photo-backed hero (source parity: interior shot under a forest overlay) */}
      <section className="relative isolate overflow-hidden bg-forest pb-20 pt-28 text-primary-foreground">
        <Image
          src="/images/interior-living.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-25"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/70 to-forest/40" aria-hidden />
        <Container className="relative grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden />
              Free Pre-Qualification
            </p>
            <h1 className="mt-5 font-display text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
              Get Matched with <span className="text-accent">Prefab-Friendly Lenders</span>
            </h1>
            <p className="mt-5 mb-10 max-w-lg text-lg leading-relaxed text-white/90">
              Tell us about your project and we&apos;ll connect you with lenders who specialize in modular and prefab home
              financing.
            </p>
            <ul className="mt-9 space-y-4">
              {BENEFITS.slice(0, 3).map((benefit) => (
                <li
                  key={benefit.title}
                  className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <benefit.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold text-white">{benefit.title}</h3>
                    <p className="mt-0.5 text-sm text-white/75">{benefit.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <figure className="mt-9 rounded-xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2" aria-label="Rated 4.9 out of 5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-4 w-4 fill-accent text-accent" aria-hidden />
                ))}
                <span className="text-sm font-semibold text-white">4.9/5</span>
              </div>
              <blockquote className="mt-3 text-sm italic text-white/85">
                &ldquo;After two banks rejected us, ModFii found a lender who approved our Plant Prefab home in days. The
                rate was better than we expected.&rdquo;
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-3 border-t border-white/15 pt-4">
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground"
                >
                  JM
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">Jennifer M.</span>
                  <span className="block text-xs text-white/70">Colorado · Verified Buyer</span>
                </span>
              </figcaption>
            </figure>
            <ul className="mt-8 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/85">
              {["600+ families helped", "50+ lender network", "All 50 states"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-accent" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <PrequalForm />
        </Container>
      </section>

      {/* Source mobile-only band (pass-7 probe): `lg:hidden py-12 bg-background`
          carrying Why Choose ModFii? (4 benefit cards) + Common Questions. On
          desktop the same benefits live inside the dark hero column. */}
      <section className="bg-background py-12 lg:hidden">
        <Container>
          <div className="mb-10">
            <h2 className="mb-6 text-center font-display text-xl font-bold">Why Choose ModFii?</h2>
            <div className="space-y-3">
              {BENEFITS.map((benefit) => (
                <div key={benefit.title} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <benefit.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <h3 className="mb-0.5 text-sm font-semibold">{benefit.title}</h3>
                    <p className="text-xs text-muted-foreground">{benefit.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold">
              <HelpCircle className="h-5 w-5 text-primary" aria-hidden />
              Common Questions
            </h3>
            <div className="space-y-4">
              {COMMON_QUESTIONS.map((item) => (
                <div key={item.q} className="text-sm">
                  <p className="mb-1 font-semibold">{item.q}</p>
                  <p className="text-muted-foreground">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* How-it-works band — mirrors the live source's "Get Financing in 3 Easy Steps"
          (pass-7: source py-16 bg-muted/50 with border-2 shadow-lg cards, w-8
          floating numerals, w-16 gradient icon chips). */}
      <section className="bg-muted/50 py-16 text-foreground">
        <Container>
          <div className="mx-auto mb-12 max-w-xl text-center">
            <h2 className="mb-3 font-display text-2xl font-bold md:text-3xl">
              Get Financing in <span className="text-primary">3 Easy Steps</span>
            </h2>
            <p className="text-muted-foreground">
              Our streamlined process gets you from application to approval faster than traditional lenders.
            </p>
          </div>
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {FUNNEL_STEPS.map((step, index) => (
              <div
                key={step.title}
                className="relative rounded-2xl border-2 border-border bg-card p-6 text-center shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-xl"
              >
                <span
                  aria-hidden
                  className="absolute left-1/2 top-0 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-lg"
                >
                  {index + 1}
                </span>
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary">
                  <step.icon className="h-7 w-7" aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
