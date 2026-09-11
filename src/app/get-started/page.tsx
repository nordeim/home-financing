import { PrequalForm } from "@/components/prequal-form";
import { Container } from "@/components/ui";
import { Clock, Leaf, ShieldCheck, Star, Users } from "lucide-react";
import type { Metadata } from "next";

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

export default function GetStartedPage() {
  return (
    <main className="bg-forest pb-20 pt-28 text-primary-foreground">
      <Container className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
            <Leaf className="h-4 w-4 text-accent" aria-hidden />
            Free Pre-Qualification
          </p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] md:text-5xl">
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
            <figcaption className="mt-3 text-sm text-white/70">Jennifer M. · Austin, TX</figcaption>
          </figure>
        </div>
        <PrequalForm />
      </Container>
    </main>
  );
}
