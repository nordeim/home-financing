"use client";

import { ButtonLink, cn } from "@/components/ui";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const NAV = [
  { label: "Financing", href: "/modular-home-financing" },
  { label: "Resources", href: "/resources" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
];

// Live modfii.com dropdown carries exactly these two items (2026-09-12 probe).
const MORE = [
  { label: "ADU Financing", href: "/adu-financing", description: "Backyard homes & in-law suites" },
  { label: "Tiny Home Financing", href: "/tiny-home-financing", description: "Small homes on foundation or wheels" },
];

/**
 * Live modfii.com renders a light frosted header in every state — over the
 * homepage hero, after scroll, and on mobile. Pass-5 metrics (2026-09-12):
 * bg-background/80 + backdrop-blur-lg (16px) + border-border/50 + h-20 inner
 * bar (81px rendered). Brand mark: source renders a CSS rotated-square
 * gradient badge (32×32 rotate-3 rounded-lg, inner bg-background square,
 * 16×16 gradient center) — the circle-ring SVG is only the favicon.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const menuId = useId();

  // Close menus after client-side navigation. Adjusting state during render
  // (React's "store info from previous renders" pattern) instead of a
  // setState-in-effect, which triggers cascading renders.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
    setMoreOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-[1400px] items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2" aria-label="ModFii home">
          {/* Source badge: rotated gradient square + inner bg square + gradient core */}
          <div className="relative h-8 w-8" aria-hidden>
            <div className="absolute inset-0 rotate-3 rounded-lg bg-gradient-to-br from-primary to-primary-600" />
            <div className="absolute inset-0.5 flex items-center justify-center rounded-lg bg-background">
              <div className="h-4 w-4 rounded-sm bg-gradient-to-br from-primary to-primary-600" />
            </div>
          </div>
          <span className="font-display text-xl font-bold text-foreground">
            Mod<span className="text-primary">Fii</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.href && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((value) => !value)}
            >
              More
              <ChevronDown className={cn("h-4 w-4 transition", moreOpen && "rotate-180")} />
            </button>
            {moreOpen ? (
              <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-border bg-card p-2 shadow-[0_18px_40px_-24px_hsl(155_30%_12%_/_0.35)]">
                {MORE.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-lg px-3 py-2.5 hover:bg-muted"
                    onClick={() => setMoreOpen(false)}
                  >
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink href="/get-started" variant="primary" size="sm">
            Get Started
          </ButtonLink>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-foreground transition-colors lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div id={menuId} className="border-t border-border bg-background lg:hidden">
          <nav className="mx-auto flex max-w-[1400px] flex-col gap-1 px-4 py-4" aria-label="Mobile">
            {[...NAV, ...MORE].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink href="/get-started" variant="primary" className="mt-3" onClick={() => setOpen(false)}>
              Get Started
            </ButtonLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
