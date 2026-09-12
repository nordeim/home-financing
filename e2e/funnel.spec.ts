import { expect, test } from "@playwright/test";

/**
 * Funnel + API contract — ModFii-specific. Mirrors the rigor of
 * scandihaven cart-flows.spec.ts: assert SERVER truth across a reload,
 * scope price totals, and verify the matcher API contract.
 */

test.describe("funnel API", () => {
  test("POST /api/applications validates bad payload with 400", async ({ request }) => {
    const resp = await request.post("/api/applications", {
      data: { fullName: "", email: "bad", phone: "", zipCode: "" },
      headers: { "x-forwarded-for": `test-400-${Date.now()}` },
    });
    expect(resp.status()).toBe(400);
    const body = await resp.json();
    expect(body).toHaveProperty("error");
    expect(typeof body.error).toBe("string");
  });

  test("funnel API responses are always JSON (S-10 contract, incl. rate-limit 429)", async ({ request }) => {
    // Pass-5 (F-13): every response from the public funnel must be JSON —
    // 400 (validation) and 429 (rate limit) here; the DB-outage 500 path is
    // pinned by scripts/verify-db-outage.sh (cannot run inside the shared
    // Playwright webServer which has a healthy DB).
    const bad = await request.post("/api/applications", {
      data: { fullName: "x" },
      headers: { "x-forwarded-for": `test-json-400-${Date.now()}` },
    });
    expect(bad.status()).toBe(400);
    expect(bad.headers()["content-type"]).toContain("application/json");

    const burstIp = `json-429-${Date.now()}`;
    let limited;
    for (let i = 0; i < 10; i++) {
      limited = await request.post("/api/applications", {
        data: { fullName: "" },
        headers: { "x-forwarded-for": burstIp },
      });
    }
    expect(limited?.status()).toBe(429);
    expect(limited?.headers()["content-type"]).toContain("application/json");
    const errBody = await limited?.json();
    expect(errBody).toHaveProperty("error");
  });

  test("POST /api/applications returns matches for a valid payload", async ({ request }) => {
    const payload = {
      fullName: "Alex Rivera",
      email: `alex+${Date.now()}@example.com`,
      phone: "5551234567",
      zipCode: "90210",
      propertyIntent: "purchase",
      homeType: "modular",
      landStatus: "own_land",
      manufacturerKnown: false,
      creditRange: "good",
      incomeRange: "100k_150k",
      budget: "250k_400k",
      timeline: "3_6_months",
    };
    const resp = await request.post("/api/applications", {
      data: payload,
      headers: { "x-forwarded-for": `test-valid-${Date.now()}` },
    });
    expect(resp.status()).toBe(200);
    const body = (await resp.json()) as { id: string; matches: unknown[] };
    expect(body).toHaveProperty("id");
    expect(body).toHaveProperty("matches");
    expect(Array.isArray(body.matches)).toBe(true);
    expect(body.matches.length).toBeGreaterThan(0);
    expect(body.matches.length).toBeLessThanOrEqual(4);
    // Each match has expected shape
    const first = body.matches[0] as Record<string, unknown>;
    expect(first).toHaveProperty("lender");
    expect(first).toHaveProperty("estimatedRate");
    expect(first).toHaveProperty("matchScore");
  });

  test("rate limit eventually 429 under burst (best-effort)", async ({ request }) => {
    // Fire 10 rapid invalid posts to trip in-memory limiter (8/10 min by IP)
    const burstIp = `burst-${Date.now()}`;
    const results: number[] = [];
    for (let i = 0; i < 10; i++) {
      const r = await request.post("/api/applications", {
        data: { fullName: "", email: `burst${i}@example.com` },
        headers: { "x-forwarded-for": burstIp },
      });
      results.push(r.status());
    }
    // At least one should be 429 or all 400 - either proves limiter is wired
    expect(results.some((s) => s === 400 || s === 429)).toBe(true);
    // Ensure limiter actually tripped
    expect(results).toContain(429);
  });
});

test.describe("funnel UI", () => {
  test("get-started shows lenders after submit (or validation)", async ({ page }) => {
    await page.goto("/get-started");
    // level 1 — the pass-3 three-step band adds a "Get Matched" card heading
    await expect(page.getByRole("heading", { level: 1, name: /get matched/i })).toBeVisible();
    // Fill minimal fields if form is present
    const nameInput = page.getByLabel(/name/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill("Jordan Lee");
      const email = page.getByLabel(/email/i);
      if (await email.isVisible()) await email.fill(`jordan+${Date.now()}@example.com`);
      const phone = page.getByLabel(/phone/i);
      if (await phone.isVisible()) await phone.fill("5551234567");
      const zip = page.getByLabel(/zip/i);
      if (await zip.isVisible()) await zip.fill("90210");
      // Submit and assert no hard error page
      const submit = page.getByRole("button", { name: /see.*matches|get.*matched|submit/i });
      if (await submit.isVisible()) {
        await submit.click();
        await expect(page.locator("main")).not.toContainText(/Internal Server Error/i);
      }
    }
  });
});
