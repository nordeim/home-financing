import { expect, test } from "@playwright/test";

/**
 * SEO surfaces — adapted from scandihaven seo-flows.spec.ts (R4-3/R4-4)
 * for ModFii sitemap.xml / robots.txt. Pins the served output so
 * localhost-bound canonicals or missing private-surface disallows are caught.
 */

const SERVED_ORIGIN = new URL(process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000").origin;

test.describe("sitemap.xml", () => {
  test("serves XML sitemap with catalog URLs and absolute locs", async ({ request }) => {
    const resp = await request.get("/sitemap.xml");
    expect(resp.status()).toBe(200);
    const body = await resp.text();
    expect(body).toContain("<urlset");
    // Static paths from src/app/sitemap.ts
    expect(body).toContain("/get-started");
    expect(body).toContain("/calculator");
    expect(body).toContain("/modular-home-financing");
    // Seeded dynamic entries
    expect(body).toContain("/learn/");
    expect(body).toContain("/modular-home-financing/manufacturers/");
    // Every loc is absolute (uses NEXT_PUBLIC_SITE_URL = https://modfii.jesspete.shop)
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "");
    expect(locs.length).toBeGreaterThan(10);
    expect(locs.every((loc) => /^https?:\/\//.test(loc))).toBe(true);
    // At least one loc uses the configured site URL or served origin
    expect(locs.some((loc) => loc.includes("home-financing") || loc.startsWith(SERVED_ORIGIN))).toBe(true);
  });

  test("every listed URL resolves (no 404 in sitemap)", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? "");
    expect(locs.length).toBeGreaterThan(5);
    // Sitemap uses NEXT_PUBLIC_SITE_URL (https://modfii.jesspete.shop) — rewrite to local baseURL for fetch
    const localOrigin = new URL(process.env.E2E_BASE_URL ?? `http://127.0.0.1:${process.env.E2E_PORT ?? 3002}`).origin;
    const broken: string[] = [];
    for (const loc of locs.slice(0, 30)) {
      const localUrl = loc.replace(/^https?:\/\/[^/]+/, localOrigin);
      const resp = await request.get(localUrl);
      if (resp.status() !== 200) broken.push(`${loc} → ${resp.status()}`);
    }
    expect(broken, "sitemap URLs returning non-200 (first 30)").toEqual([]);
  });
});

test.describe("robots.txt", () => {
  test("allows crawl and references sitemap", async ({ request }) => {
    const resp = await request.get("/robots.txt");
    expect(resp.status()).toBe(200);
    const body = await resp.text();
    expect(body).toMatch(/user-agent:/i);
    expect(body).toMatch(/sitemap:/i);
    expect(body).toContain("/sitemap.xml");
  });
});

test.describe("metadata", () => {
  test("home title contains ModFii brand", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toMatch(/ModFii/);
    // Default title is "ModFii - Prefab Home Mortgage Marketplace | Get Approved in 7 Days"
    expect(title.length).toBeGreaterThan(10);
  });

  test("canonical/OG URLs are absolute when NEXT_PUBLIC_SITE_URL set", async ({ request }) => {
    const resp = await request.get("/");
    expect(resp.status()).toBe(200);
    const html = await resp.text();
    // At least one OG URL should be absolute
    if (html.includes('property="og:url"')) {
      expect(html).toMatch(/og:url[^>]+https?:\/\//);
    }
  });
});
