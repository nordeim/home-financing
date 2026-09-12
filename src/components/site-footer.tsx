import { SITE } from "@/lib/catalog";
import { Mail, MapPin } from "lucide-react";
import Link from "next/link";

/** lucide 1.44 dropped brand icons — minimal glyph wrappers (modfii.com footer parity). */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M22 5.9c-.7.3-1.5.6-2.3.7a4 4 0 0 0 1.8-2.2c-.8.5-1.7.8-2.6 1a4 4 0 0 0-6.9 3.7A11.5 11.5 0 0 1 3.7 4.9a4 4 0 0 0 1.3 5.4c-.7 0-1.3-.2-1.8-.5v.1a4 4 0 0 0 3.2 4 4 4 0 0 1-1.8.1 4 4 0 0 0 3.8 2.8A8.1 8.1 0 0 1 2 18.4a11.4 11.4 0 0 0 6.2 1.8c7.5 0 11.6-6.2 11.6-11.6v-.5c.8-.6 1.5-1.3 2.2-2.2Z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12c0 1.6.1 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.3-1.6.4-3.2.4-4.8s-.1-3.2-.4-4.8ZM10 15.2V8.8l5.2 3.2L10 15.2Z" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: "Loan Options",
    links: [
      { href: "/modular-home-financing/loan-options/fha", label: "FHA Loans" },
      { href: "/modular-home-financing/loan-options/va", label: "VA Loans" },
      { href: "/modular-home-financing/loan-options/usda", label: "USDA Loans" },
      { href: "/modular-home-financing/loan-options/construction-loan", label: "Construction Loans" },
    ],
  },
  {
    title: "Property Types",
    links: [
      { href: "/adu-financing", label: "ADU Financing" },
      { href: "/tiny-home-financing", label: "Tiny Home Financing" },
      { href: "/construction-loans", label: "Construction Loans Hub" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/resources", label: "All Resources" },
      { href: "/glossary", label: "Financing Glossary" },
      { href: "/learn", label: "Learning Center" },
      { href: "/calculator", label: "Mortgage Calculator" },
      { href: "/modular-home-financing/manufacturers", label: "Find Manufacturers" },
      { href: "/modular-home-financing/states", label: "Browse by State" },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: "/modular-home-financing/with-land", label: "Financing With Land" },
      { href: "/modular-home-financing/without-land", label: "Financing Without Land" },
      { href: "/modular-home-financing/down-payment", label: "Down Payment Guide" },
      { href: "/modular-home-financing/rates", label: "Current Rates" },
      { href: "/modular-home-financing/cost", label: "Cost Breakdown" },
    ],
  },
  {
    title: "Compare",
    links: [
      { href: "/compare/modular-vs-manufactured-financing", label: "Modular vs Manufactured" },
      { href: "/compare/fha-vs-conventional-prefab", label: "FHA vs Conventional" },
      { href: "/compare/prefab-vs-site-built-costs", label: "Prefab vs Site-Built" },
      { href: "/modular-home-financing/chattel-vs-mortgage", label: "Chattel vs Mortgage" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/editorial-policy", label: "Editorial Policy" },
      { href: "/corrections", label: "Corrections Policy" },
      { href: `mailto:${SITE.email}`, label: "Contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] xl:grid-cols-[minmax(0,1.4fr)_repeat(6,minmax(0,1fr))]">
        <div>
          <Link href="/" className="mb-4 inline-flex items-center gap-2">
            {/* Source badge (pass-5): rotated gradient square + inner bg square + gradient core */}
            <span className="relative block h-8 w-8" aria-hidden>
              <span className="absolute inset-0 block rotate-3 rounded-lg bg-gradient-to-br from-primary to-primary-600" />
              <span className="absolute inset-0.5 flex items-center justify-center rounded-lg bg-background">
                <span className="block h-4 w-4 rounded-sm bg-gradient-to-br from-primary to-primary-600" />
              </span>
            </span>
            <span className="font-display text-xl font-bold text-foreground">
              Mod<span className="text-primary">Fii</span>
            </span>
          </Link>
          <p className="mb-4 max-w-xs text-muted-foreground">
            The first mortgage marketplace built exclusively for prefab and modular homes.
          </p>
          <div className="mb-6 space-y-2 text-sm text-muted-foreground">
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-foreground">
              <Mail className="h-4 w-4" />
              {SITE.email}
            </a>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {SITE.hq}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="ModFii on Twitter"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <TwitterIcon className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="ModFii on Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
            <a
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ModFii on LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <LinkedInIcon className="h-4 w-4" />
            </a>
            <a
              href="#"
              aria-label="ModFii on YouTube"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <YouTubeIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="mb-3 text-sm font-semibold text-foreground">{column.title}</p>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-[1400px] px-4 pb-10 md:px-8">
        <p className="mb-3 text-sm font-semibold text-foreground">Legal</p>
        <ul className="space-y-2">
          <li>
            <Link href="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </li>
          <li>
            <a
              href="https://www.nmlsconsumeraccess.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              NMLS Consumer Access
            </a>
          </li>
        </ul>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 ModFii. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/about" className="hover:text-foreground">
              About Us
            </Link>
            <Link href="/editorial-policy" className="hover:text-foreground">
              Editorial Policy
            </Link>
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
        <p className="mx-auto max-w-[1400px] px-4 pb-8 text-xs leading-relaxed text-muted-foreground md:px-8">
          ModFii is a mortgage marketplace, not a lender. We connect borrowers with lenders who specialize in modular
          and prefab home financing. Equal Housing Opportunity.{" "}
          <a
            href="https://www.nmlsconsumeraccess.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            NMLS Consumer Access
          </a>
        </p>
      </div>
    </footer>
  );
}
