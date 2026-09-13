/**
 * Focused probe 6: intro section internals (card grid + chrome) src vs clone.
 * Run: node --experimental-strip-types scripts/live-parity-probe6.mts
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const SRC = "https://modfii.com";
const CLONE = "https://modfii.jesspete.shop";
const OUT = "/home/z/my-project/audit/live-parity";

const browser = await chromium.launch();

async function probe(base: string, tag: string) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const h1 = document.querySelector("h1");
    const intro = h1?.closest("section");
    if (!intro) return { error: "no intro" };
    // the grid of cards
    const grids = [...intro.querySelectorAll(".grid")];
    const cards = [...intro.querySelectorAll("[class*=rounded]")].filter((c) => (c.textContent || "").length > 60);
    return {
      introHTML: intro.outerHTML.slice(0, 5000),
      grids: grids.map((g) => ({
        classes: g.className.replace(/\s+/g, " ").slice(0, 110),
        children: g.children.length,
        cols: getComputedStyle(g).gridTemplateColumns.split(" ").length,
      })),
      cards: cards.slice(0, 8).map((c) => {
        const cs = getComputedStyle(c);
        return {
          classes: c.className.replace(/\s+/g, " ").slice(0, 90),
          h: Math.round(c.getBoundingClientRect().height),
          padding: cs.padding,
          radius: cs.borderRadius,
          bg: cs.backgroundColor,
          title: c.querySelector("h2, h3")?.textContent?.slice(0, 40),
        };
      }),
    };
  });
  writeFileSync(`${OUT}/intro-${tag}.json`, JSON.stringify(data, null, 2));
  await ctx.close();
  return data;
}

const src = await probe(SRC, "src");
const clone = await probe(CLONE, "clone");
console.log("SRC grids:", JSON.stringify(src.grids, null, 1));
console.log("CLONE grids:", JSON.stringify(clone.grids, null, 1));
console.log("\nSRC cards:", JSON.stringify(src.cards, null, 1));
console.log("\nCLONE cards:", JSON.stringify(clone.cards, null, 1));
await browser.close();
