/**
 * Source-site recon — modfii.com is a client-rendered Vite SPA, so we drive a
 * real browser, wait for hydration, then dump nav links + route inventory.
 * Run: npx tsx scripts/source-recon.mts
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "/home/z/my-project/audit/source";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleErrors: string[] = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push(String(e)));

await page.goto("https://modfii.com/", { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(2500);

// 1) All in-page links after hydration
const links = await page.evaluate(() => {
  const seen = new Set<string>();
  for (const a of document.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|javascript)/i.test(href)) continue;
    seen.add(href);
  }
  return [...seen].sort();
});
writeFileSync(`${OUT}/links.txt`, links.join("\n"));

// 2) Heading inventory (h1/h2) for section parity
const headings = await page.evaluate(() =>
  [...document.querySelectorAll("h1, h2")].map((h) => `${h.tagName}: ${h.textContent?.trim().slice(0, 90)}`),
);
writeFileSync(`${OUT}/headings.txt`, headings.join("\n"));

// 3) Nav structure — top-level nav items + any dropdown items
const nav = await page.evaluate(() => {
  const nav = document.querySelector("header nav") ?? document.querySelector("header");
  if (!nav) return { text: "NO HEADER NAV", items: [] as string[] };
  const items = [...nav.querySelectorAll("a, button")].map((el) => el.textContent?.trim() || "");
  return { text: nav.textContent?.slice(0, 400) ?? "", items: items.filter(Boolean) };
});
writeFileSync(`${OUT}/nav.json`, JSON.stringify(nav, null, 2));

// 4) Computed styles of the header bar + hero
const styles = await page.evaluate(() => {
  const pick = (el: Element | null) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      classes: (el as HTMLElement).className?.toString?.().slice(0, 220),
      background: cs.backgroundColor,
      backgroundImage: cs.backgroundImage.slice(0, 120),
      color: cs.color,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontFamily: cs.fontFamily.slice(0, 80),
      backdropFilter: cs.backdropFilter,
      padding: cs.padding,
      borderRadius: cs.borderRadius,
      boxShadow: cs.boxShadow.slice(0, 120),
      height: cs.height,
    };
  };
  const header = document.querySelector("header");
  const h1 = document.querySelector("h1");
  const firstSection = document.querySelector("main section, section");
  const cta = [...document.querySelectorAll("a, button")].find((el) => /get started/i.test(el.textContent || ""));
  const heroImg = document.querySelector("section img, header img, main img");
  return {
    header: pick(header),
    h1: pick(h1),
    firstSection: pick(firstSection),
    cta: pick(cta ?? null),
    heroImg: heroImg ? { src: (heroImg as HTMLImageElement).src, alt: heroImg.getAttribute("alt") } : null,
    body: {
      font: getComputedStyle(document.body).fontFamily,
      bg: getComputedStyle(document.body).backgroundColor,
      color: getComputedStyle(document.body).color,
    },
  };
});
writeFileSync(`${OUT}/styles.json`, JSON.stringify(styles, null, 2));

// 5) Full-page + viewport screenshots
await page.screenshot({ path: `${OUT}/home-full.png`, fullPage: true });
await page.screenshot({ path: `${OUT}/home-fold.png`, fullPage: false });

// 6) Footer text
const footer = await page.evaluate(() => document.querySelector("footer")?.innerText?.slice(0, 1200) ?? "NO FOOTER");
writeFileSync(`${OUT}/footer.txt`, footer);

console.log("LINKS:", links.length);
console.log(links.join(" | "));
console.log("\nH1/H2 count:", headings.length);
console.log("Console errors:", consoleErrors.length, consoleErrors.slice(0, 3));
await browser.close();
