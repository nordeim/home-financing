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
  test("brand mark is the circle glyph and the wordmark is two-tone", async ({ page }) => {
    await page.goto("/");
    // Circle mark: the svg served as the brand icon must contain <circle>
    const svg = await page.request.get("/brand/modfii-logo-icon.svg");
    expect(svg.status()).toBe(200);
    expect(await svg.text()).toContain("<circle");
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

  test("intro section carries the source eyebrow label", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Your Prefab Financing Partner")).toBeVisible();
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
