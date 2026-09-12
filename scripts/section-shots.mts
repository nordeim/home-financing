/**
 * Section-level screenshots for close visual comparison — crops specific
 * sections (testimonials, standards, faq, hero, intro tabs) from both sites.
 * Run: node --experimental-strip-types scripts/section-shots.mts
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const OUT = "/home/z/my-project/audit/shots";
mkdirSync(OUT, { recursive: true });

const SECTIONS: Array<[string, RegExp]> = [
  ["hero", /stop losing your dream home/i],
  ["intro", /modular & prefab home loans/i],
  ["broken", /prefab financing is broken/i],
  ["steps", /from application to keys/i],
  ["testimonials", /trusted by 2,000/i],
  ["standards", /our standards/i],
  ["faq", /questions\? we/i],
  ["closing", /your dream prefab home deserves/i],
  ["footer", /FLOATER_FOOTER/],
];

const browser = await chromium.launch();

async function shoot(base: string, tag: string) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(2500);
  // scroll through page to trigger lazy/reveal
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  for (const [name, re] of SECTIONS) {
    if (re.source === "FLOATER_FOOTER") {
      const footer = page.locator("footer");
      await footer.screenshot({ path: `${OUT}/${name}-${tag}.png` }).catch(() => {});
      continue;
    }
    const sec = page.locator("section", { hasText: re }).first();
    await sec.screenshot({ path: `${OUT}/${name}-${tag}.png` }).catch((e) => console.log(`skip ${name}-${tag}: ${String(e).slice(0, 60)}`));
  }
  await ctx.close();
}

await shoot("https://modfii.com", "source");
await shoot(process.env.CLONE_BASE ?? "https://modfii.jesspete.shop", "clone");
console.log("done — shots in", OUT);
await browser.close();
