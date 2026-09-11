"use client";

import { ButtonLink, cn } from "@/components/ui";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";

const NAV = [
  { label: "Financing", href: "/modular-home-financing" },
  { label: "Resources", href: "/resources" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "FAQ", href: "/#faq" },
];

const MORE = [
  { label: "ADU Financing", href: "/adu-financing", description: "Backyard homes & in-law suites" },
  { label: "Tiny Home Financing", href: "/tiny-home-financing", description: "Small homes on foundation or wheels" },
  { label: "Calculator", href: "/calculator", description: "Estimate monthly payment" },
  { label: "Learn", href: "/learn", description: "Guides from mortgage specialists" },
];

/**
 * The homepage hero is a full-bleed dark photo, so the header sits
 * transparent with light text until the user scrolls (modfii.com behavior).
 * Interior pages start on a light header immediately.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuId = useId();

  const overDarkHero = pathname === "/" && !scrolled;

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
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md transition-colors duration-300",
        overDarkHero ? "border-transparent bg-transparent" : "border-border/80 bg-background/90",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="ModFii home">
          <Image src="/brand/modfii-logo-icon.svg" alt="" width={36} height={36} priority />
          <span
            className={cn(
              "font-display text-xl font-bold tracking-tight transition-colors",
              overDarkHero ? "text-white" : "text-foreground",
            )}
          >
            ModFii
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                overDarkHero ? "text-white/85 hover:text-white" : "text-muted-foreground",
                pathname === item.href && !overDarkHero && "text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
                overDarkHero ? "text-white/85 hover:text-white" : "text-muted-foreground",
              )}
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
          <ButtonLink
            href="/get-started"
            variant={overDarkHero ? "onPrimary" : "primary"}
            size="sm"
            className={cn(overDarkHero && "border-transparent bg-forest text-white hover:bg-primary-600")}
          >
            Get Started
          </ButtonLink>
        </div>

        <button
          type="button"
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors lg:hidden",
            overDarkHero ? "border-white/30 text-white" : "border-border text-foreground",
          )}
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
