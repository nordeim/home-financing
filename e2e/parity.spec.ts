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
    await page.goto("/calculator");
    // React-controlled range input: set value via the native setter + input event.
    await page.locator("#calc-down").evaluate((element) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(element, "62500");
      element.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await expect(page.getByText(/No PMI\./i)).toBeVisible();
  });

  test("footer has four social icons and Legal column", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByLabel("ModFii on Twitter")).toBeAttached();
    await expect(footer.getByLabel("ModFii on Facebook")).toBeAttached();
    await expect(footer.getByLabel("ModFii on LinkedIn")).toBeAttached();
    await expect(footer.getByLabel("ModFii on YouTube")).toBeAttached();
    await expect(footer.getByRole("link", { name: "NMLS Consumer Access" })).toBeAttached();
  });

  test("get-started wizard shows step chip, ZIP helper, and privacy note", async ({ page }) => {
    await page.goto("/get-started");
    await expect(page.getByText("Tell us about your project", { exact: true })).toBeVisible();
    await expect(page.getByText("Where the home will be located")).toBeVisible();
    await expect(page.getByText(/By continuing, you agree to our/i)).toBeVisible();
  });
});
