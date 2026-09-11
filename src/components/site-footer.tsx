import { SITE } from "@/lib/catalog";
import { Mail, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Financing",
    links: [
      { href: "/modular-home-financing", label: "Modular Home Financing" },
      { href: "/modular-home-financing/loan-options", label: "Loan Options" },
      { href: "/construction-loans", label: "Construction Loans" },
      { href: "/adu-financing", label: "ADU Financing" },
      { href: "/tiny-home-financing", label: "Tiny Home Financing" },
      { href: "/calculator", label: "Payment Calculator" },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: "/modular-home-financing/rates", label: "Rates" },
      { href: "/modular-home-financing/cost", label: "Costs" },
      { href: "/modular-home-financing/down-payment", label: "Down Payment" },
      { href: "/modular-home-financing/with-land", label: "With Land" },
      { href: "/modular-home-financing/without-land", label: "Without Land" },
      { href: "/modular-home-financing/chattel-vs-mortgage", label: "Chattel vs Mortgage" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/learn", label: "Learn" },
      { href: "/resources", label: "Resources" },
      { href: "/glossary", label: "Glossary" },
      { href: "/modular-home-financing/states", label: "All 50 States" },
      { href: "/modular-home-financing/manufacturers", label: "Manufacturers" },
      { href: "/about", label: "About ModFii" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
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
          <a
            href={SITE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-primary hover:underline"
          >
            LinkedIn
          </a>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="mb-3 text-sm font-semibold text-foreground">{column.title}</p>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
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
            <Link href="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/editorial-policy" className="hover:text-foreground">
              Editorial Policy
            </Link>
            <Link href="/corrections" className="hover:text-foreground">
              Corrections
            </Link>
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
