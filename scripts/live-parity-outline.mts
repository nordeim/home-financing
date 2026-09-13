/**
 * Focused probes: (1) real header logo metrics, (2) section outlines (H2/H3
 * inventory) for content-depth comparison, (3) titles inventory, (4) glossary
 * heading semantics.
 * Run: node --experimental-strip-types scripts/live-parity-outline.mts
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const SRC = "https://modfii.com";
const CLONE = "https://modfii.jesspete.shop";
const OUT = "/home/z/my-project/audit/live-parity";
mkdirSync(OUT, { recursive: true });

const ROUTES: Array<[string, string, string]> = [
  ["home", "/", "/"],
  ["hub", "/modular-home-financing", "/modular-home-financing"],
  ["fha", "/modular-home-financing/loan-options/fha", "/modular-home-financing/loan-options/fha"],
  ["adu", "/adu-financing", "/adu-financing"],
  ["tiny", "/tiny-home-financing", "/tiny-home-financing"],
  ["construction", "/construction-loans", "/construction-loans"],
  ["mortgage", "/mortgage", "/mortgage"],
  ["financing", "/financing", "/financing"],
  ["about", "/about", "/about"],
  ["resources", "/resources", "/resources"],
  ["calculator", "/calculator", "/calculator"],
  ["glossary", "/glossary", "/glossary"],
  ["get-started", "/get-started", "/get-started"],
  ["learn", "/learn", "/learn"],
  ["manufacturers", "/modular-home-financing/manufacturers", "/modular-home-financing/manufacturers"],
  ["states", "/modular-home-financing/states", "/modular-home-financing/states"],
  ["rates", "/modular-home-financing/rates", "/modular-home-financing/rates"],
  ["cost", "/modular-home-financing/cost", "/modular-home-financing/cost"],
  ["down-payment", "/modular-home-financing/down-payment", "/modular-home-financing/down-payment"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

async function probe(base: string, path: string) {
  const page = await ctx.newPage();
  await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    // 1) Header logo — find the anchor that contains the brand text or sits first in the header bar
    const header = document.querySelector("header");
    let logo = null;
    if (header) {
      const brandLink =
        [...header.querySelectorAll("a")].find((a) => /mod\s*fii/i.test(a.textContent || "")) ??
        header.querySelector("a");
      if (brandLink) {
        const cs = getComputedStyle(brandLink);
        const r = brandLink.getBoundingClientRect();
        // the visual glyph element (svg or first non-text child)
        const glyph = brandLink.querySelector("svg, img, div");
        const gcs = glyph ? getComputedStyle(glyph) : null;
        const gr = glyph?.getBoundingClientRect();
        logo = {
          linkW: Math.round(r.width),
          linkH: Math.round(r.height),
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          gap: cs.gap,
          text: brandLink.textContent?.replace(/\s+/g, "").slice(0, 20),
          glyph: glyph
            ? {
                tag: glyph.tagName.toLowerCase(),
                w: Math.round(gr?.width ?? 0),
                h: Math.round(gr?.height ?? 0),
                bg: gcs?.background.slice(0, 90),
                borderRadius: gcs?.borderRadius,
                transform: gcs?.transform,
              }
            : null,
        };
      }
    }
    // 2) Full heading outline
    const outline = [...document.querySelectorAll("h1, h2, h3")].map((h) => {
      const cs = getComputedStyle(h);
      return `${h.tagName}|${h.textContent?.trim().replace(/\s+/g, " ").slice(0, 80)}|${cs.fontSize}`;
    });
    // 3) Title + meta description
    const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    return { title: document.title.slice(0, 120), metaDesc: metaDesc.slice(0, 160), logo, outline };
  });
  await page.close();
  return data;
}

const result: Record<string, { src: any; clone: any }> = {};
for (const [label, srcPath, clonePath] of ROUTES) {
  console.log(`— ${label}`);
  result[label] = {
    src: await probe(SRC, srcPath),
    clone: await probe(CLONE, clonePath),
  };
}
writeFileSync(`${OUT}/outline.json`, JSON.stringify(result, null, 2));

// Print compact logo + title + outline count comparison
for (const [label, pair] of Object.entries<any>(result)) {
  const { src, clone } = pair;
  const counts = (o: string[]) => {
    const h1 = o.filter((x) => x.startsWith("h1|")).length;
    const h2 = o.filter((x) => x.startsWith("h2|")).length;
    const h3 = o.filter((x) => x.startsWith("h3|")).length;
    return `${h1}/${h2}/${h3}`;
  };
  console.log(`\n### ${label}`);
  console.log(`title src:    ${src.title}`);
  console.log(`title clone:  ${clone.title}`);
  console.log(`outline (h1/h2/h3) src: ${counts(src.outline)}  clone: ${counts(clone.outline)}`);
  if (label === "home" || label === "get-started") {
    console.log(`logo src:    ${JSON.stringify(src.logo)}`);
    console.log(`logo clone:  ${JSON.stringify(clone.logo)}`);
  }
}
await browser.close();
