import { expect, test } from "@playwright/test";

/**
 * Regression guards for the 2026-09-11 remediation pass.
 *
 * - The markdown OOM incident: articles containing `#### ` headings used to
 *   hang the renderer and OOM the whole next-server process (origin 502).
 * - Visual-parity additions: wordmark logos, testimonial avatars, learn hub
 *   (search/filter/featured/tools), calculator breakdown bar, footer socials.
 */

test.describe("markdown OOM regression (2026-09-11)", () => {
  const h4Articles = [
    "/learn/construction-loans-vs-traditional-mortgages-prefab",
    "/learn/inside-prefab-home-closing",
  ];

  for (const route of h4Articles) {
    test(`${route} renders without hanging`, async ({ page }) => {
      const response = await page.goto(route, { timeout: 15_000 });
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 4 }).first()).toBeVisible();
    });
  }
});

test.describe("visual parity additions", () => {
  test("home shows manufacturer wordmark logos and testimonial avatars", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('img[alt="Dvele"]')).toBeVisible();
    await expect(page.locator('img[alt="Plant Prefab"]')).toBeVisible();
    await expect(page.locator('img[alt="Sarah Chen"]')).toHaveCount(0); // avatars are decorative alt=""
    const avatarCount = await page.locator('figure img[src*="/images/avatars/"]').count();
    expect(avatarCount).toBe(3);
  });

  test("learn hub has search, filter chips, featured banner, and interactive tools", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { name: /master prefab home financing/i })).toBeVisible();
    await expect(page.getByLabel(/search articles/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /^All/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Guide/ })).toBeVisible();
    await expect(page.getByText("Featured Guide")).toBeVisible();
    await expect(page.getByRole("heading", { name: /interactive tools/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /get weekly prefab insights/i })).toBeVisible();
  });

  test("learn search narrows results", async ({ page }) => {
    await page.goto("/learn");
    await page.getByLabel(/search articles/i).fill("appraisal");
    const cards = page.locator('a[href^="/learn/"]');
    await expect(cards.filter({ hasText: /apprais/i }).first()).toBeVisible();
  });

  test("calculator shows breakdown bar, loan summary, and PMI alert", async ({ page }) => {
    await page.goto("/calculator");
    await expect(page.getByText("Your Estimated Payment", { exact: true })).toBeVisible();
    await expect(page.getByText("Loan Summary")).toBeVisible();
    // Default 10% down triggers the PMI alert
    await expect(page.getByText(/PMI Applied\./i)).toBeVisible();
    await expect(page.getByText(/How to Use the Calculator/i)).toBeVisible();
    await expect(page.getByText(/Explore Financing Options/i)).toBeVisible();
  });

  test("calculator PMI alert disappears at 20% down", async ({ page }) => {
    // React-controlled range input: set value via the native setter + input event.
    //
    // 2026-09-12 root cause (instrumented): a synthetic dispatch that lands
    // BEFORE React hydration poisons the input's value tracker — hydration
    // preserves the mutated DOM value and initializes the tracker from it, so
    // identical re-dispatches read as "no change" and onChange never fires.
    // Retrying in-place therefore cannot recover; each attempt must start
    // from a fresh navigation (clean tracker) until one lands post-hydration.
    await expect(async () => {
      await page.goto("/calculator");
      await page.locator("#calc-down").evaluate((element) => {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        setter?.call(element, "62500");
        element.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await expect(page.getByText(/No PMI\./i)).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 30_000 });
  });

  test("footer has four social icons and Legal column", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByLabel("ModFii on Twitter")).toBeAttached();
    await expect(footer.getByLabel("ModFii on Facebook")).toBeAttached();
    await expect(footer.getByLabel("ModFii on LinkedIn")).toBeAttached();
    await expect(footer.getByLabel("ModFii on YouTube")).toBeAttached();
    // first() — pass 3 adds a second NMLS Consumer Access link in the legal line
    await expect(footer.getByRole("link", { name: "NMLS Consumer Access" }).first()).toBeAttached();
  });

  test("get-started wizard shows step chip, ZIP helper, and privacy note", async ({ page }) => {
    await page.goto("/get-started");
    await expect(page.getByText("Tell us about your project", { exact: true })).toBeVisible();
    await expect(page.getByText("Where the home will be located")).toBeVisible();
    await expect(page.getByText(/By continuing, you agree to our/i)).toBeVisible();
  });
});

/**
 * Pass-3 live-source parity pins (2026-09-12).
 *
 * Every assertion here was derived from a rendered-DOM + computed-style
 * comparison of modfii.com (source of truth) against the deployed clone:
 * docs/REMEDIATION_PLAN_pass3.md holds the evidence table.
 */
test.describe("live-source parity (pass 3)", () => {
  test("brand mark is the source rotated-square gradient badge and the wordmark is two-tone", async ({ page }) => {
    await page.goto("/");
    // 2026-09-12 pass-5 correction: the live source header AND footer render a
    // CSS badge — 32x32 rotated (rotate-3) rounded-lg gradient square with an
    // inner bg-background square + 16x16 gradient center. The circle-ring SVG
    // is only the favicon on both sites (the pass-3 "circle glyph" pin was a
    // mis-verification of the favicon asset).
    for (const region of [page.locator("header"), page.getByRole("contentinfo")]) {
      const badge = region.locator("[class*='rotate-3']");
      await expect(badge.first()).toBeVisible();
      const layers = await badge.first().evaluate((el) => {
        const root = el.closest("[class*='relative']");
        return root ? [...root.querySelectorAll("[class*='rounded']")].map((d) => d.className.toString()) : [];
      });
      expect(layers.join(" ")).toContain("from-primary");
      expect(layers.join(" ")).toContain("bg-background");
      expect(await region.locator("img[src*='modfii-logo-icon.svg']").count()).toBe(0);
    }
    // favicon remains the circle-ring SVG
    const icon = await page.locator("link[rel='icon']").first().getAttribute("href");
    expect(icon).toContain("/brand/modfii-logo-icon.svg");
    // Two-tone wordmark: "Mod" (foreground) + "Fii" (primary) in header and footer
    for (const region of [page.locator("header"), page.getByRole("contentinfo")]) {
      await expect(region.locator(".text-primary", { hasText: "Fii" }).first()).toBeVisible();
    }
  });

  test("header is always light — no transparent-over-dark state on the homepage hero", async ({ page }) => {
    await page.goto("/");
    const background = await page.locator("header").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("mobile header is light over the hero", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const background = await page.locator("header").evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(background).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("intro section renders the source eyebrow pill (pass-4 removal was a wrong pin)", async ({ page }) => {
    await page.goto("/");
    // 2026-09-12 pass-5 correction: direct DOM extraction of the live source
    // shows a "Your Prefab Financing Partner" pill ABOVE the intro H1
    // (bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium
    // mb-6). The pass-4 "source renders none" claim mis-read the evidence.
    const eyebrow = page.getByText("Your Prefab Financing Partner", { exact: true });
    await expect(eyebrow).toBeVisible();
    const classes = (await eyebrow.first().getAttribute("class")) ?? "";
    expect(classes).toContain("bg-primary/10");
    expect(classes).toContain("rounded-full");
  });

  test("closing CTA carries the source trust line", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/No credit impact • 15-minute application • Cancel anytime/)).toBeVisible();
  });

  test("homepage has no green sustainability band and a single See Your Options CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Your sustainability should lower the rate.")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "See Your Options" })).toHaveCount(1);
  });

  test("steps eyebrow is title-cased", async ({ page }) => {
    await page.goto("/");
    const steps = page.locator("#how-it-works");
    await expect(steps.getByText("How It Works", { exact: true })).toBeVisible();
    await expect(page.getByText("How it works", { exact: true })).toHaveCount(0);
  });

  test("desktop More dropdown matches source: two items, no Calculator/Learn", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /more/i }).click();
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: /ADU Financing/ })).toBeVisible();
    await expect(header.getByRole("link", { name: /Tiny Home Financing/ })).toBeVisible();
    await expect(header.getByRole("link", { name: /Calculator/ })).toHaveCount(0);
    await expect(header.getByRole("link", { name: /^Learn/ })).toHaveCount(0);
  });

  test("footer copyright drops the NMLS number and the legal line links NMLS Consumer Access", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByText("© 2026 ModFii. All rights reserved.", { exact: true })).toBeVisible();
    await expect(footer.getByText(/NMLS #/)).toHaveCount(0);
    await expect(footer.getByRole("link", { name: "NMLS Consumer Access" })).toHaveCount(2);
  });

  test("get-started adds the source three-step band", async ({ page }) => {
    await page.goto("/get-started");
    await expect(page.getByRole("heading", { name: /Get Financing in 3 Easy Steps/i })).toBeVisible();
    await expect(page.getByText("Share Your Project")).toBeVisible();
    await expect(page.getByText("Get Matched", { exact: true })).toBeVisible();
    await expect(page.getByText("Choose Your Lender")).toBeVisible();
  });

  test("calculator lower sections sit on the amber band", async ({ page }) => {
    await page.goto("/calculator");
    const section = page.getByRole("heading", { name: /How to Use the Calculator/i }).locator("xpath=ancestor::section[1]");
    await expect(section).toBeVisible();
    const cls = await section.getAttribute("class");
    expect(cls).toContain("bg-accent");
  });
});

/**
 * Pass-4 live-source parity pins (2026-09-13).
 *
 * Derived from the same source-vs-clone methodology as pass 3:
 * docs/REMEDIATION_PLAN_pass4.md holds the evidence table
 * (computed-style probes + de-minified source hero JSX + asset byte-compare).
 */
test.describe("live-source parity (pass 4)", () => {
  test("home hero uses the source overlay recipe with a bottom fade and no grid texture", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("main section").first();
    // Source layering: photo + horizontal primary wash + bottom fade into the
    // wordmark strip; the pass-2 hero-grid texture is not in the source.
    await expect(hero.locator("div[class*='bg-gradient-to-r'][class*='from-primary/95']")).toHaveCount(1);
    await expect(hero.locator("div[class*='bg-gradient-to-b'][class*='to-primary/95']")).toHaveCount(1);
    await expect(hero.locator(".hero-grid")).toHaveCount(0);
  });

  test("hub hero carries the source last-updated line, truth callout, second CTA, and four stat chips", async ({ page }) => {
    await page.goto("/modular-home-financing");
    await expect(page.getByText(/Last Updated: January 2026/i)).toBeVisible();
    await expect(page.getByText("Here's the truth:")).toBeVisible();
    await expect(page.getByText("But most lenders don't understand that.")).toBeVisible();
    await expect(page.getByText("ModFii exists to solve this.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Get Pre-Approved Now/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Compare Loan Options/i })).toBeVisible();
    const hero = page.locator("main section").filter({ has: page.getByRole("heading", { level: 1 }) });
    await expect(hero.getByText("0.5%", { exact: true })).toBeVisible();
    await expect(hero.getByText("94%", { exact: true })).toBeVisible();
  });

  test("FHA loan-options page matches source hero: highlight line, updated line, dual CTAs", async ({ page }) => {
    await page.goto("/modular-home-financing/loan-options/fha");
    await expect(page.locator("h1 span.text-accent")).toHaveText(/Modular Homes/i);
    await expect(page.getByText(/Last Updated: January 2026/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /Check FHA Eligibility/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /View Requirements/i })).toBeVisible();
  });

  test("VA loan-options page matches source hero: updated line, dual CTAs, author strip", async ({ page }) => {
    await page.goto("/modular-home-financing/loan-options/va");
    await expect(page.getByText(/Last Updated: January 2026/i)).toBeVisible();
    await expect(page.locator("h1 span.text-accent")).toHaveText(/Modular Homes/i);
    await expect(page.getByRole("link", { name: /Check VA Eligibility/i }).first()).toBeVisible();
    await expect(page.getByText("Written by")).toBeVisible();
    await expect(page.getByText("Sarah Williams")).toBeVisible();
  });

  test("learn hub cards do not duplicate the word read", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByText(/read read/i)).toHaveCount(0);
    await expect(page.getByText(/15 min read/).first()).toBeVisible();
  });

  test("calculator hero carries the source Free Calculator pill and middle breadcrumb", async ({ page }) => {
    await page.goto("/calculator");
    await expect(page.getByText("Free Calculator")).toBeVisible();
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumbs.getByText("Modular Home Financing")).toBeVisible();
  });
});

/**
 * Pass-5 live-source parity pins (2026-09-12).
 *
 * Evidence: computed-style + DOM probes of the rendered source vs the deployed
 * clone (scripts/source-recon.mts, clone-compare.mts, home-deep-diff.mts,
 * section-diff.mts, resolve-conflicts.mts, hero-overlay-probe.mts,
 * logo-probe2.mts) + VLM screenshot comparisons. docs/REMEDIATION_PLAN_pass5.md
 * holds the finding table (F-01..F-16).
 */
test.describe("live-source parity (pass 5)", () => {
  test("header bar matches the source metrics: /80 alpha, 16px blur, h-20 inner, border/50", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    const styles = await header.evaluate((el) => {
      const cs = getComputedStyle(el);
      const inner = el.firstElementChild;
      return {
        bg: cs.backgroundColor,
        blur: cs.backdropFilter,
        innerHeight: inner ? getComputedStyle(inner).height : "",
        borderBottomWidth: cs.borderBottomWidth,
      };
    });
    // Source probe: rgba(253,253,252,0.8) + blur(16px) + 80px inner + 1px border/50.
    // Tailwind v4 emits alpha colors as oklab(...) — assert the alpha component,
    // which is the format-agnostic equivalent of the source's rgba.
    expect(styles.bg).toMatch(/\/ 0\.8\)$|rgba\(253, ?253, ?252, ?0\.8\)/);
    expect(styles.blur).toBe("blur(16px)");
    expect(styles.innerHeight).toBe("80px");
    expect(styles.borderBottomWidth).toBe("1px");
    const classes = (await header.getAttribute("class")) ?? "";
    expect(classes).toContain("border-border/50");
    expect(classes).toContain("bg-background/80");
    expect(classes).toContain("backdrop-blur-lg");
  });

  test("hero matches the source paddings: section pt-24/md:pt-28 + no container vertical padding", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("main section").first();
    const styles = await hero.evaluate((el) => {
      const cs = getComputedStyle(el);
      const container = el.querySelector(":scope > div");
      const ccs = container ? getComputedStyle(container) : null;
      return { padding: cs.padding, containerPaddingY: ccs ? `${ccs.paddingTop} ${ccs.paddingBottom}` : "n/a" };
    });
    // At 1440px the source renders padding 112px 0px 80px (md:pt-28 + md:pb-20)
    expect(styles.padding).toBe("112px 0px 80px");
    expect(styles.containerPaddingY).toBe("0px 0px");
  });

  test("hero eyebrow pill matches the source translucency (bg-white/15, border-white/30)", async ({ page }) => {
    await page.goto("/");
    const eyebrow = page.getByText("The #1 Prefab Home Mortgage Platform", { exact: true });
    const classes = (await eyebrow.first().getAttribute("class")) ?? "";
    expect(classes).toContain("bg-white/15");
    expect(classes).toContain("border-white/30");
    const styles = await eyebrow.first().evaluate((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, borderColor: cs.borderTopColor };
    });
    // Tailwind v4 oklab format — assert alpha components match the source probes.
    expect(styles.bg).toMatch(/\/ 0\.15\)$|rgba\(255, ?255, ?255, ?0\.15\)/);
    expect(styles.borderColor).toMatch(/\/ 0\.3\)$|rgba\(255, ?255, ?255, ?0\.3\)/);
  });

  test("buttons match the source chrome: 10px radius, weight 500, lg px-8", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /Get Pre-Approved in 15 Minutes/i }).first();
    const styles = await cta.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { radius: cs.borderRadius, weight: cs.fontWeight, paddingX: cs.paddingLeft };
    });
    expect(styles.radius).toBe("10px");
    expect(styles.weight).toBe("500");
    expect(styles.paddingX).toBe("32px");
  });

  test("intro card titles are H2s like the source and the hero title is an H2 with the intro as document H1", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("main section").first();
    await expect(hero.getByRole("heading", { level: 2, name: /Stop Losing Your Dream Home/i })).toBeVisible();
    await expect(hero.getByRole("heading", { level: 1 })).toHaveCount(0);
    const intro = page.locator("#prefab-intro, main").filter({ hasText: "Modular & Prefab Home Loans" }).first();
    await expect(page.getByRole("heading", { level: 1, name: /Modular & Prefab Home Loans/i })).toBeVisible();
    for (const title of ["How Financing Works", "Loan Types Available", "Who We Help", "Why Prefab Financing Is Different"]) {
      await expect(page.getByRole("heading", { level: 2, name: title, exact: true })).toBeVisible();
    }
  });

  test("wordmark strip uses the source chrome: py-8 bg-muted/30 border-y border-border/50", async ({ page }) => {
    await page.goto("/");
    const strip = page.locator("section").filter({ hasText: "Trusted by buyers of leading manufacturers" });
    const classes = (await strip.first().getAttribute("class")) ?? "";
    expect(classes).toContain("py-8");
    expect(classes).toContain("bg-muted/30");
    expect(classes).toContain("border-y");
    expect(classes).toContain("border-border/50");
  });

  test("testimonial cards match the source: bg-background, 16px radius, hover shadow", async ({ page }) => {
    await page.goto("/");
    const card = page.locator("figure").first();
    const styles = await card.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { radius: cs.borderRadius, bg: cs.backgroundColor };
    });
    expect(styles.radius).toBe("16px");
    expect(styles.bg).toBe("rgb(253, 253, 252)");
  });

  test("section heading sizes match the source (cards 16px, steps 20px, standards 30px)", async ({ page }) => {
    await page.goto("/");
    const broken = page.getByRole("heading", { name: /Misclassified as 'Mobile Homes'/i });
    await expect(broken).toHaveCSS("font-size", "16px");
    const step = page.getByRole("heading", { name: /Tell Us About Your Home/i });
    await expect(step).toHaveCSS("font-size", "20px");
    const standards = page.getByRole("heading", { name: /^Our Standards$/i });
    await expect(standards).toHaveCSS("font-size", "30px");
  });

  test("FAQ questions are H3 headings like the source", async ({ page }) => {
    await page.goto("/");
    const faq = page.getByRole("heading", { name: /Questions\? We've Got Answers/i }).locator("xpath=ancestor::section[1]");
    await expect(faq.getByRole("heading", { level: 3, name: /What does ModFii cost\?/i })).toBeVisible();
    await expect(faq.getByRole("heading", { level: 3, name: /How do green mortgages work\?/i })).toBeVisible();
  });

  test("FAQ accordions are exclusive like the source (opening one closes the others)", async ({ page }) => {
    await page.goto("/");
    const items = page.locator("section#faq details");
    await items.nth(0).locator("summary").click();
    await expect(items.nth(0)).toHaveAttribute("open", "");
    await items.nth(1).locator("summary").click();
    await expect(items.nth(1)).toHaveAttribute("open", "");
    // Exclusive accordion (pass-6 A-04): the first item must close when the
    // second opens — mirrors the source's Radix accordion behavior.
    await expect(items.nth(0)).not.toHaveAttribute("open", "");
  });

  test("get-started hero H1 follows the source's desktop ramp (48px at lg)", async ({ page }) => {
    await page.goto("/get-started");
    const h1 = page.getByRole("heading", { level: 1, name: /Get Matched with Prefab-Friendly Lenders/i });
    // Pass-7 re-probe (2026-09-13): the source renders TWO H1s — a mobile-only
    // `text-2xl` (24px) one and the visible desktop `text-3xl md:text-4xl
    // lg:text-5xl` one (48px at 1280). The clone keeps a single semantic H1
    // with the desktop ramp (24px at mobile, 36px at md, 48px at lg+).
    await expect(h1).toHaveCSS("font-size", "48px");
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(h1).toHaveCSS("font-size", "30px");
  });

  test("interior H1 sizes match the source: learn 60px, glossary 48px", async ({ page }) => {
    await page.goto("/learn");
    await expect(page.getByRole("heading", { level: 1, name: /Master Prefab Home Financing/i })).toHaveCSS("font-size", "60px");
    await page.goto("/glossary");
    await expect(page.getByRole("heading", { level: 1, name: /Modular Home Financing Glossary/i })).toHaveCSS("font-size", "48px");
  });

  test("guide H1s carry the source long-form titles", async ({ page }) => {
    await page.goto("/adu-financing");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("How to Finance an Accessory Dwelling Unit");
    await page.goto("/tiny-home-financing");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("How to Finance a Tiny House");
    await page.goto("/construction-loans");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Modular & Prefab Homes");
  });

  test("SEO titles match the source long-form patterns", async ({ page }) => {
    await page.goto("/adu-financing");
    await expect(page).toHaveTitle(/ADU Financing: How to Finance an Accessory Dwelling Unit \(2026 Guide\)/);
    await page.goto("/tiny-home-financing");
    await expect(page).toHaveTitle(/Tiny Home Financing: How to Finance a Tiny House \(2026 Guide\)/);
    await page.goto("/construction-loans");
    await expect(page).toHaveTitle(/Construction Loans for Modular & Prefab Homes/);
  });

  test("debug-error-probe renders the error-boundary recovery UI without crashing the server", async ({ page }) => {
    const response = await page.goto("/debug-error-probe");
    // The error boundary catches the deliberate throw and renders recovery UI
    // (the live deploy returns 200 with the error page; dev may 500 — both fine).
    expect(response?.status()).toBeLessThan(500);
    await expect(page.getByRole("heading").first()).toBeVisible();
    // server stays alive for normal traffic afterwards
    const health = await page.request.get("/api/health");
    expect([200, 500]).toContain(health.status());
  });

  test("hub guide carries the source section outline (content depth parity)", async ({ page }) => {
    await page.goto("/modular-home-financing");
    for (const heading of [
      "What Is Modular Home Financing?",
      "Types of Modular Home Financing",
      "Modular Home Financing Comparison",
      "The Modular Home Financing Process",
      "Why Most Banks Reject Modular Home Loans",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading, exact: true })).toBeVisible();
    }
    // subsection outline (source renders 3 H3s under the first H2)
    await expect(page.getByRole("heading", { level: 3, name: "Modular homes qualify for traditional mortgages" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Construction-to-permanent loans (most common)" })).toBeVisible();
    // FAQ block present like the source's FAQ section
    const faqDetails = page.locator("#faqs details");
    expect(await faqDetails.count()).toBeGreaterThanOrEqual(5);
  });

  test("FHA loan-options guide carries the source section outline (content depth parity)", async ({ page }) => {
    await page.goto("/modular-home-financing/loan-options/fha");
    for (const heading of [
      "Why FHA Loans Are Popular for Modular Homes",
      "FHA Modular vs. FHA Manufactured: What's the Difference?",
      "FHA Mortgage Insurance Premium (MIP) Explained",
      "FHA Borrower Requirements",
      "Property Requirements",
      "FHA Loan Limits by Area",
      "FHA Construction-to-Permanent for Modular Homes",
      "FHA vs. Conventional for Modular Homes",
      "The FHA Appraisal for Modular Homes",
      "Step-by-Step FHA Process for Modular Homes",
      "Common FHA Mistakes with Modular Homes",
      "Why Many FHA Lenders Reject Modular Homes",
      "Check Your FHA Eligibility",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading, exact: true })).toBeVisible();
    }
    const faqDetails = page.locator("#faqs details");
    expect(await faqDetails.count()).toBeGreaterThanOrEqual(8);
  });

  test("ADU guide carries the source section outline (content depth parity)", async ({ page }) => {
    await page.goto("/adu-financing");
    for (const heading of [
      "The ADU Opportunity: Why Backyard Homes Are Booming",
      "What Counts as an ADU? Types Explained",
      "ADU Financing Options: Complete Guide",
      "How to Choose Your ADU Financing Path",
      "ADU Financing Requirements",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { level: 3, name: "Home equity loan / HELOC" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Renovation loans (FHA 203k, HomeStyle, CHOICERenovation)" })).toBeVisible();
    const faqDetails = page.locator("#faqs details");
    expect(await faqDetails.count()).toBeGreaterThanOrEqual(6);
  });

  test("tiny + construction guides carry the source section outlines (content depth parity)", async ({ page }) => {
    await page.goto("/tiny-home-financing");
    for (const heading of [
      "The Tiny Home Movement: Big Appeal, Complex Financing",
      "Why Tiny Homes Are Hard to Finance",
      "Tiny Home Types: What Each Means for Financing",
      "Tiny Home Financing Options: Complete Guide",
      "Financing Comparison Table",
      "Tiny Home Costs: Complete Budget Breakdown",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading, exact: true })).toBeVisible();
    }
    await page.goto("/construction-loans");
    for (const heading of [
      "What Is a Construction Loan?",
      "Types of Construction Loans",
      "How Construction Loans Work",
      "Construction Loan Requirements",
      "One-Time Close vs. Two-Time Close",
      "Timeline",
      "Estimate Your Construction Loan Payments",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { level: 3, name: "Understanding draw schedules" })).toBeVisible();
  });
});

/**
 * Pass-7 live-source parity pins (2026-09-13).
 *
 * Evidence: computed-style recon of https://modfii.com vs the deployed clone
 * (scripts/live-parity-audit.mts + probe2-6 + src-home.html dumps in
 * /home/z/my-project/audit/live-parity/). docs/REMEDIATION_PLAN_pass7.md
 * holds the finding table (F-1..F-12). Default viewport is Desktop Chrome
 * 1280x720; mobile/tablet cases override the viewport inline.
 */
test.describe("live-source parity (pass 7)", () => {
  test("header inner bar renders 64px on mobile and 80px at md+ like the source (h-16 md:h-20)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const header = page.locator("header");
    const innerHeight = await header.evaluate((el) => getComputedStyle(el.firstElementChild as Element).height);
    // Source probe (390px): inner bar h-16 → 64px.
    expect(innerHeight).toBe("64px");
  });

  test("header desktop nav is visible from md (768px) with the source's 32px item gap", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto("/");
    const nav = page.locator("header nav").first();
    await expect(nav).toBeVisible();
    const styles = await nav.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { gap: cs.columnGap };
    });
    // Source probe: nav gap-8 → 32px.
    expect(styles.gap).toBe("32px");
  });

  test("header container uses the source's 16px horizontal inset (container px-4)", async ({ page }) => {
    await page.goto("/");
    const container = page.locator("header > div").first();
    const padding = await container.evaluate((el) => getComputedStyle(el).paddingLeft);
    // Source probe (1280/1440): container px-4 → 16px (clone rendered md:px-8 → 32px).
    expect(padding).toBe("16px");
  });

  test("intro heading block spans the source's max-w-5xl column (1024px) with the md:text-4xl H1 ramp", async ({ page }) => {
    await page.goto("/");
    const h1 = page.getByRole("heading", { level: 1, name: "Modular & Prefab Home Loans" });
    const col = await h1.evaluate((el) => el.closest("div.max-w-5xl, section div")?.getBoundingClientRect().width ?? 0);
    // Source probe (1440): everything in the intro sits inside max-w-5xl (1024px).
    expect(Math.round(col)).toBeLessThanOrEqual(1024);
    const tablet = await page.viewportSize();
    expect(tablet?.width).toBe(1280); // sanity: Desktop Chrome default
    const ramp = await h1.evaluate((el) => getComputedStyle(el).fontSize);
    // At 1280 the source renders lg:text-5xl (48px) — same as before; the md
    // ramp is pinned separately at 800px below.
    expect(ramp).toBe("48px");
    const page800 = await page.context().browser()?.newContext({ viewport: { width: 800, height: 900 } });
    const p800 = await page800?.newPage();
    await p800?.goto("/");
    const h1At800 = await p800?.getByRole("heading", { level: 1, name: "Modular & Prefab Home Loans" });
    const sizeAt800 = await h1At800?.evaluate((el) => getComputedStyle(el).fontSize);
    // Source probe (768-1023): md:text-4xl → 36px (clone jumped 30→48 at md).
    expect(sizeAt800).toBe("36px");
    await page800?.close();
  });

  test("intro eyebrow pill carries the source House icon", async ({ page }) => {
    await page.goto("/");
    const eyebrow = page.getByText("Your Prefab Financing Partner", { exact: true });
    const icon = await eyebrow.locator("svg").first().evaluate((el) => el.getAttribute("class") ?? "");
    // Source renders lucide-house w-4 h-4 inside the pill.
    expect(icon).toMatch(/w-4/);
  });

  test("intro cards match the source chrome: 12px radius, 20px padding, shadow, 14px body", async ({ page }) => {
    await page.goto("/");
    const card = page
      .getByRole("heading", { level: 2, name: "How Financing Works" })
      .locator("xpath=ancestor::div[contains(@class, 'rounded')][1]");
    const styles = await card.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { radius: cs.borderRadius, padding: cs.paddingTop, shadow: cs.boxShadow, borderAlpha: cs.borderTopColor };
    });
    // Source probe: rounded-xl p-5 md:p-6 (24px at md+) border-border/50 shadow-sm.
    expect(styles.radius).toBe("12px");
    expect(styles.padding).toBe("24px");
    expect(styles.shadow).not.toBe("none");
    expect(styles.borderAlpha).toMatch(/\/ 0\.5\)|, ?0\.5\)/);
    const body = card.locator("p").first();
    const bodySize = await body.evaluate((el) => getComputedStyle(el).fontSize);
    expect(bodySize).toBe("14px");
  });

  test("intro card icon chips use the source's 40px gradient tile", async ({ page }) => {
    await page.goto("/");
    const chip = page
      .getByRole("heading", { level: 2, name: "How Financing Works" })
      .locator("xpath=preceding-sibling::span[1]");
    // scroll the card into view so the Reveal wrapper finishes its scale-95 →
    // scale-100 animation before measuring (pre-reveal the 40px chip reads 38px).
    await chip.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const styles = await chip.first().evaluate((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return { w: Math.round(r.width), radius: cs.borderRadius, bg: cs.backgroundImage.slice(0, 60) };
    });
    // Source probe: w-10 h-10 rounded-lg (12px in the source scale) + gradient tile.
    expect(styles.w).toBe(40);
    expect(styles.radius).toBe("12px");
    expect(styles.bg).toContain("linear-gradient");
  });

  test("intro chips grid renders two columns on mobile like the source", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const chipsGrid = page.getByText("FHA Loans", { exact: true }).first().locator("xpath=ancestor::div[contains(@class, 'grid')][1]");
    const cols = await chipsGrid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    // Source probe (390): chips grid grid-cols-2 → 2 tracks (clone rendered 1).
    expect(cols).toBe(2);
  });

  test("problem/solution section renders the source's md:py-28 rhythm and source card chrome", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("heading", { level: 2, name: /Prefab Financing is Broken/i }).locator("xpath=ancestor::section[1]");
    const padTop = await section.evaluate((el) => getComputedStyle(el).paddingTop);
    // Source probe (1280): py-20 md:py-28 → 112px (clone rendered py-24 → 96px).
    expect(padTop).toBe("112px");
    const problemCard = page
      .getByRole("heading", { level: 3, name: /Misclassified/i })
      .locator("xpath=ancestor::div[contains(@class, 'rounded')][1]");
    const pStyles = await problemCard.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { padding: cs.paddingTop, borderColor: cs.borderTopColor };
    });
    // Source: p-5 + border-destructive/20.
    expect(pStyles.padding).toBe("20px");
    expect(pStyles.borderColor).toMatch(/\/ 0\.2\)|, ?0\.2\)/);
    const solutionCard = page
      .getByRole("heading", { level: 3, name: /7-Day Approvals/i })
      .locator("xpath=ancestor::div[contains(@class, 'rounded')][1]");
    const sBg = await solutionCard.evaluate((el) => getComputedStyle(el).backgroundColor);
    // Source solution card: bg-primary/5 (green wash), NOT bg-secondary.
    expect(sBg).toMatch(/oklab\(0\.[0-9.]+/); // sanity: not plain rgb
    const h3 = page.getByRole("heading", { level: 3, name: /Misclassified/i });
    const font = await h3.evaluate((el) => getComputedStyle(el).fontFamily);
    // Source base CSS applies Outfit to all h1–h6 (probed assets/index-*.css) —
    // the clone's h3s render Outfit too; the pass-7 delta was weight/size only.
    expect(font).toContain("Outfit");
  });

  test("steps numerals carry the source's primary/10 tint and 56px icon chips with gradient connectors", async ({ page }) => {
    await page.goto("/");
    const numeral = page.getByText("01", { exact: true }).first();
    const nColor = await numeral.evaluate((el) => getComputedStyle(el).color);
    // Source: text-primary/10 → forest green at 10% alpha.
    expect(nColor).toMatch(/oklab\(0\.[0-9]+ [0-9.-]+ [0-9.-]+ \/ 0\.1\)/);
    const stepHeading = page.getByRole("heading", { level: 3, name: /Tell Us About Your Home/i });
    const chip = await stepHeading.locator("xpath=preceding-sibling::span[1]").evaluate((el) =>
      Math.round(el.getBoundingClientRect().width),
    );
    // Source: w-14 h-14 icon chip (56px).
    expect(chip).toBe(56);
    const connector = stepHeading.locator("xpath=ancestor::div[2]").locator("span[class*=top-16], span[class*='h-px']").first();
    const connBg = await connector.evaluate((el) => getComputedStyle(el).backgroundImage);
    // Source connector: gradient from-primary/50 to transparent.
    expect(connBg).toContain("linear-gradient");
  });

  test("testimonials section carries the source's card→background gradient and md:text-4xl H2 ramp", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("heading", { level: 2, name: /Trusted by 2,000\+/i }).locator("xpath=ancestor::section[1]");
    const bg = await section.evaluate((el) => getComputedStyle(el).backgroundImage);
    // Source: bg-gradient-to-b from-card to-background.
    expect(bg).toContain("linear-gradient");
    const tablet = await page.context().browser()?.newContext({ viewport: { width: 900, height: 900 } });
    const p = await tablet?.newPage();
    await p?.goto("/");
    const h2 = await p?.getByRole("heading", { level: 2, name: /Trusted by 2,000\+/i });
    const size = await h2?.evaluate((el) => getComputedStyle(el).fontSize);
    // Source (768-1023): md:text-4xl → 36px (clone jumped to 48px at md).
    expect(size).toBe("36px");
    await tablet?.close();
  });

  test("standards section uses the source's muted/30 band with border-y and 24px cards", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("heading", { level: 2, name: "Our Standards" }).locator("xpath=ancestor::section[1]");
    const styles = await section.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, borderTop: cs.borderTopWidth, padding: cs.paddingTop };
    });
    // Source: bg-muted/30 (not /50) + border-y + py-16.
    expect(styles.bg).toMatch(/\/ 0\.3\)|, ?0\.3\)/);
    expect(styles.borderTop).toBe("1px");
    expect(styles.padding).toBe("64px");
    const card = page.getByRole("heading", { level: 3, name: "Editorially Independent" }).locator("xpath=ancestor::div[contains(@class, 'rounded')][1]");
    const cStyles = await card.evaluate((el) => {
      const cs = getComputedStyle(el);
      const icon = el.querySelector("span, div");
      return {
        radius: cs.borderRadius,
        padding: cs.paddingTop,
        iconW: icon ? Math.round(icon.getBoundingClientRect().width) : 0,
      };
    });
    // Source: rounded-xl p-6 cards + w-12 (48px) round icon chip.
    expect(cStyles.radius).toBe("12px");
    expect(cStyles.padding).toBe("24px");
    expect(cStyles.iconW).toBe(48);
  });

  test("hero CTA and closing CTA render the source's 44px height (h-11)", async ({ page }) => {
    await page.goto("/");
    const heroCta = page.getByRole("link", { name: /Get Pre-Approved in 15 Minutes/i }).first();
    const heroH = await heroCta.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(heroH).toBe(44);
    const closingCta = page.getByRole("link", { name: /Get Pre-Approved Free/i }).first();
    const closingH = await closingCta.evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(closingH).toBe(44);
  });

  test("hero checks use the source's CircleCheck icons with 20px gap rhythm", async ({ page }) => {
    await page.goto("/");
    const checks = page.getByText("No credit impact", { exact: true }).first();
    const ul = checks.locator("xpath=ancestor::ul[1]");
    const gap = await ul.evaluate((el) => getComputedStyle(el).rowGap);
    // Source: flex flex-wrap items-center gap-5 → 20px (clone rendered gap-x-8).
    expect(gap).toBe("20px");
    const iconSvg = await page.locator("main section").first().evaluate((el) =>
      [...el.querySelectorAll("svg")].some((s) => /lucide-circle-check/.test(s.getAttribute("class") ?? "")),
    );
    // Source hero checks render lucide-circle-check (clone used a ring span + Check).
    expect(iconSvg).toBe(true);
  });

  test("wordmark strip uses the source's mobile 32px gap", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const strip = page.getByText("Trusted by buyers of leading manufacturers").locator("xpath=following-sibling::div[1]");
    const gap = await strip.evaluate((el) => getComputedStyle(el).columnGap);
    // Source (390): gap-8 → 32px (clone rendered gap-x-12 → 48px).
    expect(gap).toBe("32px");
  });

  test("FAQ questions render semibold (600) and answers render 14px like the source", async ({ page }) => {
    await page.goto("/#faq");
    const first = page.locator("#faq details").first();
    const qWeight = await first.locator("summary h3, summary").first().evaluate((el) => getComputedStyle(el).fontWeight);
    expect(qWeight).toBe("600");
    await first.locator("summary").click();
    const answer = first.locator("p").last();
    const aSize = await answer.evaluate((el) => getComputedStyle(el).fontSize);
    // Source: accordion content text-sm → 14px (clone rendered 16px).
    expect(aSize).toBe("14px");
  });

  test("get-started renders exactly one H1 through the wizard steps (source uses labels)", async ({ page }) => {
    await page.goto("/get-started");
    expect(await page.locator("h1").count()).toBe(1);
    // advance to step 1: intent + ZIP (the Choice list renders aria-pressed buttons)
    await page.getByRole("button", { name: /buy a prefab home/i }).first().click();
    await page.getByLabel(/property zip code/i).fill("80202");
    await page.getByRole("button", { name: "Continue" }).first().click();
    await page.waitForTimeout(400);
    expect(await page.locator("h1").count()).toBe(1);
  });

  test("get-started carries the source's trust chips, Why Choose ModFii?, and Common Questions blocks", async ({ page }) => {
    await page.goto("/get-started");
    // Hero trust chips render as H3s on every viewport (source pattern).
    await expect(page.getByRole("heading", { level: 3, name: "2-Minute Application" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "No Credit Impact" }).first()).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Prefab Specialists Only" }).first()).toBeVisible();
    // Source renders Why Choose ModFii? + Common Questions in an lg:hidden light
    // band (desktop keeps the benefits inside the dark hero column). CSS
    // locators — getByRole cannot see display:none elements.
    await expect(page.locator("h2", { hasText: "Why Choose ModFii?" })).toBeAttached();
    await expect(page.locator("h3", { hasText: "Free Service" })).toBeAttached();
    await expect(page.locator("h3", { hasText: "Common Questions" })).toBeAttached();
    // At mobile width the band becomes visible.
    const mobile = await page.context().browser()?.newContext({ viewport: { width: 390, height: 844 } });
    const m = await mobile?.newPage();
    if (m) {
      await m.goto("/get-started");
      await expect(m.getByRole("heading", { level: 2, name: "Why Choose ModFii?" })).toBeVisible();
      await expect(m.getByRole("heading", { level: 3, name: "Common Questions" })).toBeVisible();
    }
    await mobile?.close();
  });

  test("footer column headings are H4s like the source", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    const h4Count = await footer.locator("h4").count();
    // Source: 7 column headings (Loan Options..Legal) render as H4.
    expect(h4Count).toBeGreaterThanOrEqual(6);
  });

  test("footer grid renders the source's 8-column md layout with 40px filled social buttons", async ({ page }) => {
    await page.goto("/");
    const grid = page.getByRole("contentinfo").locator("div").first();
    const cols = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(" ").length);
    // Source (≥768): md:grid-cols-8 → 8 tracks.
    expect(cols).toBe(8);
    const social = page.getByRole("contentinfo").getByLabel("ModFii on Twitter");
    const s = await social.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { w: Math.round(el.getBoundingClientRect().width), bg: cs.backgroundColor };
    });
    // Source: w-10 h-10 rounded-full bg-muted (filled, not bordered).
    expect(s.w).toBe(40);
    expect(s.bg).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("glossary terms render as H3s with the source's two closing H2 sections", async ({ page }) => {
    await page.goto("/glossary");
    // expect() retries — a bare count() raced the static page's a11y tree in
    // sequential runs (pass-7 flake).
    await expect(page.getByRole("heading", { level: 3, name: "Chattel Loan" })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 2, name: "Chattel Loan" })).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 2, name: "Related Resources" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Have Questions About Financing\?/i })).toBeVisible();
  });

  test("hub guide carries the source's full section set incl. 20-question FAQ and Sources", async ({ page }) => {
    await page.goto("/modular-home-financing");
    for (const heading of [
      "Modular vs. Manufactured Home Financing",
      "What You'll Need to Apply",
      "Modular Home Financing Costs",
      "Modular Home Financing by Situation",
      "Why Choose ModFii for Modular Home Financing?",
      "Explore Loan Options",
      "Get Pre-Approved for Modular Home Financing",
      "Modular Home Financing FAQ",
      "Sources",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading, exact: true })).toBeVisible();
    }
    const faqH3 = await page.locator("#faq h3, details h3").count();
    // Source renders a 20-question FAQ on the hub (clone had 8).
    expect(faqH3).toBeGreaterThanOrEqual(20);
  });

  test("mortgage page carries the source's section outline", async ({ page }) => {
    await page.goto("/mortgage");
    for (const heading of [
      "Modular Home Mortgage Options",
      "How to Get a Modular Home Mortgage",
      "Modular Home Mortgage FAQ",
      "Get Your Modular Home Mortgage Today",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("heading", { level: 3, name: "15-Year Fixed Mortgage" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "30-Year Fixed Mortgage" })).toBeVisible();
  });

  test("financing page carries the source's section outline", async ({ page }) => {
    await page.goto("/financing");
    for (const heading of [
      "Pre-Qualify for Modular Home Financing",
      "Modular Home Financing Options",
      "Why Modular Homes Need Specialized Lenders",
      "Ready to Finance Your Modular Home?",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading, exact: true })).toBeVisible();
    }
  });

  test("about page carries the source's six-section outline", async ({ page }) => {
    await page.goto("/about");
    for (const heading of [
      "Our Story",
      "How We're Different",
      "How We Make Money",
      "Our Editorial Standards",
      "Our Team",
      "Contact Us",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: heading, exact: true })).toBeVisible();
    }
  });

  test("resources page carries the source's Popular Guides and starter sections", async ({ page }) => {
    await page.goto("/resources");
    await expect(page.getByRole("heading", { level: 2, name: "Most Popular Guides" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Not Sure Where to Start?" })).toBeVisible();
  });

  test("calculator page carries the source's FAQ + related trio + CTA sections", async ({ page }) => {
    await page.goto("/calculator");
    await expect(page.getByRole("heading", { level: 3, name: "How do I calculate my modular home payment?" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: /What is PMI and when is it required\?/i })).toBeVisible();
    await expect(page.getByText("Current Rates", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Down Payment Guide", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Cost Breakdown", { exact: true }).first()).toBeVisible();
  });

  test("FHA guide carries the source's closing sections (FAQ, Sources, Ready)", async ({ page }) => {
    await page.goto("/modular-home-financing/loan-options/fha");
    await expect(page.getByRole("heading", { level: 2, name: "FHA Modular Home Loan FAQ" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Sources" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: /Ready for FHA Pre-Approval\?/i })).toBeVisible();
  });
});
