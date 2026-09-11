import { expect, test } from "@playwright/test";

/**
 * Asset + alias regression guards (2026-09-11 remediation).
 *
 * Guards against two production incidents:
 *  1. Six images referenced by src/** (hero-prefab, green-home, interior-living,
 *     adu-backyard, tiny-home, brand/og-image) were missing from public/ and 404'd
 *     on the deployed site — homepage hero rendered photo-less and the green band
 *     showed raw alt text.
 *  2. modfii.com's footer links /compare/fha-vs-conventional and
 *     /compare/prefab-vs-site-built — the clone only shipped the -prefab / -costs
 *     variants, so source-parity links 404'd.
 */

test.describe("referenced image assets resolve", () => {
  const referencedImages = [
    "/images/hero-prefab.jpg",
    "/images/green-home.jpg",
    "/images/interior-living.jpg",
    "/images/adu-backyard.jpg",
    "/images/tiny-home.jpg",
    "/brand/og-image.jpg",
    "/brand/wordmarks/dvele-qHduDYI9.png",
    "/brand/wordmarks/plant-prefab-BZiOWTM8.png",
    "/brand/wordmarks/excel-homes-7uiBs08K.png",
    "/brand/wordmarks/skyline.png",
    "/brand/wordmarks/dutch-housing-DfGaFGP9.png",
    "/images/avatars/sarah-chen.jpg",
    "/images/avatars/marcus-elena-rodriguez.jpg",
    "/images/avatars/james-thornton.jpg",
  ];

  for (const src of referencedImages) {
    test(`asset ${src} returns 200`, async ({ request }) => {
      const resp = await request.get(src);
      expect(resp.status(), `${src} must be served`).toBe(200);
    });
  }

  test("home page renders no broken images", async ({ page }) => {
    await page.goto("/");
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.getAttribute("src")),
    );
    expect(broken, `broken imgs on /: ${broken.join(", ")}`).toEqual([]);
  });

  test("adu-financing renders no broken images", async ({ page }) => {
    await page.goto("/adu-financing");
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.getAttribute("src")),
    );
    expect(broken, `broken imgs on /adu-financing: ${broken.join(", ")}`).toEqual([]);
  });

  test("tiny-home-financing renders no broken images", async ({ page }) => {
    await page.goto("/tiny-home-financing");
    const broken = await page.evaluate(() =>
      [...document.querySelectorAll("img")]
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.getAttribute("src")),
    );
    expect(broken, `broken imgs on /tiny-home-financing: ${broken.join(", ")}`).toEqual([]);
  });
});

test.describe("source-parity compare aliases", () => {
  test("/compare/fha-vs-conventional resolves", async ({ request }) => {
    const resp = await request.get("/compare/fha-vs-conventional", { maxRedirects: 5 });
    expect(resp.status()).toBe(200);
  });

  test("/compare/prefab-vs-site-built resolves", async ({ request }) => {
    const resp = await request.get("/compare/prefab-vs-site-built", { maxRedirects: 5 });
    expect(resp.status()).toBe(200);
  });
});
