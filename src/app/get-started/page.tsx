import { PrequalForm } from "@/components/prequal-form";
import { Container } from "@/components/ui";
import { BadgeCheck, Clock, FileText, Handshake, Home, ShieldCheck, Sparkles, Star, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Get Pre-Qualified",
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
            <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-accent" aria-hidden />
              Free Pre-Qualification
            </p>
            <h1 className="mt-5 font-display text-2xl font-bold leading-[1.15]">
              Get Matched with <span className="text-accent">Prefab-Friendly Lenders</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">
              Tell us about your project and we&apos;ll connect you with lenders who specialize in modular and prefab home
              financing.
            </p>
            <ul className="mt-9 space-y-4">
              {BENEFITS.map((benefit) => (
                <li
                  key={benefit.title}
                  className="flex items-center gap-4 rounded-xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <benefit.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{benefit.title}</p>
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

      {/* How-it-works band — mirrors the live source's "Get Financing in 3 Easy Steps" */}
      <section className="bg-background py-16 text-foreground md:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Get Financing in <span className="text-primary">3 Easy Steps</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Our streamlined process gets you from application to approval faster than traditional lenders.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-3">
            {FUNNEL_STEPS.map((step, index) => (
              <div key={step.title} className="relative rounded-2xl border border-border bg-card p-7 text-center">
                <span
                  aria-hidden
                  className="absolute left-1/2 top-0 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                >
                  {index + 1}
                </span>
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
                  <step.icon className="h-6 w-6" aria-hidden />
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
