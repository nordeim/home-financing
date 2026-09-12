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

  test("get-started hero H1 is compact like the source (24px)", async ({ page }) => {
    await page.goto("/get-started");
    const h1 = page.getByRole("heading", { level: 1, name: /Get Matched with Prefab-Friendly Lenders/i });
    await expect(h1).toHaveCSS("font-size", "24px");
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
