import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Smoke — adapted from scandihaven storefront.spec.ts for ModFii
 * (home-financing). Covers the critical surfaces that must render on the
 * production Next build (webServer: `next start`), not just dev HMR.
 */

test.describe("home smoke", () => {
  test("home renders hero, nav, and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("get-started funnel renders and is reachable from header", async ({ page }) => {
    await page.goto("/");
    // Header has "Get Pre-Qualified" linking to /get-started
    await page.getByRole("link", { name: /get pre-qualified/i }).first().click();
    await expect(page).toHaveURL(/\/get-started/);
    await expect(page.getByRole("heading", { name: /get matched/i })).toBeVisible();
  });

  test("calculator renders with inputs", async ({ page }) => {
    await page.goto("/calculator");
    await expect(page.getByRole("heading", { name: /modular home payment calculator/i })).toBeVisible();
  });

  test("health endpoint reports db status", async ({ request }) => {
    const response = await request.get("/api/health");
    expect([200, 500]).toContain(response.status());
    const body = (await response.json()) as { ok: boolean; status: string; db: boolean };
    expect(body).toHaveProperty("db");
    expect(body).toHaveProperty("status");
  });

  test("funnel validates and can submit (no hard crash)", async ({ page }) => {
    await page.goto("/get-started");
    // Try submitting empty to trigger client validation — should not 500
    const submit = page.getByRole("button", { name: /see.*matches|get.*matched|submit/i });
    if (await submit.isVisible()) {
      await submit.click();
      // Validation either shows inline errors or stays on page — both ok
      await expect(page).toHaveURL(/\/get-started/);
    }
  });

  test("404 renders recovery paths", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-xyz");
    expect(response?.status()).toBe(404);
    // Not-found.tsx should show a heading
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("no axe violations on home (critical)", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).include("main").analyze();
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical, `critical a11y violations: ${JSON.stringify(critical, null, 2)}`).toEqual([]);
  });
});
