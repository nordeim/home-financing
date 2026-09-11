import { SITE } from "@/lib/catalog";
import { Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/** lucide 1.44 dropped brand icons — minimal LinkedIn glyph wrapper. */
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
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
            <Image src="/brand/modfii-logo-icon.svg" alt="" width={36} height={36} />
            <span className="font-display text-xl font-bold">ModFii</span>
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
              href={SITE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="ModFii on LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <LinkedInIcon className="h-4 w-4" />
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
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>© 2026 ModFii. All rights reserved. NMLS #{SITE.nmls}</p>
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
            <a
              href="https://www.nmlsconsumeraccess.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              NMLS Consumer Access
            </a>
          </div>
        </div>
        <p className="mx-auto max-w-[1400px] px-4 pb-8 text-xs leading-relaxed text-muted-foreground md:px-8">
          ModFii is a mortgage marketplace, not a lender. We connect borrowers with lenders who specialize in modular
          and prefab home financing. Equal Housing Opportunity.
        </p>
      </div>
    </footer>
  );
}
