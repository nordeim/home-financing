/**
 * Focused probe 2: (1) source header HTML dump to identify the real brand
 * mark, (2) section outlines with case-correct matching, (3) FAQ counts.
 * Run: node --experimental-strip-types scripts/live-parity-outline2.mts
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const SRC = "https://modfii.com";
const CLONE = "https://modfii.jesspete.shop";
const OUT = "/home/z/my-project/audit/live-parity";

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
  ["states", "/modular-home-financing/states", "/modular-home-financing/states"],
  ["rates", "/modular-home-financing/rates", "/modular-home-financing/rates"],
  ["cost", "/modular-home-financing/cost", "/modular-home-financing/cost"],
  ["down-payment", "/modular-home-financing/down-payment", "/modular-home-financing/down-payment"],
  ["manufacturers", "/modular-home-financing/manufacturers", "/modular-home-financing/manufacturers"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

async function probe(base: string, path: string, label: string) {
  const page = await ctx.newPage();
  await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    const outline = [...document.querySelectorAll("h1, h2, h3")].map((h) => {
      const cs = getComputedStyle(h);
      return `${h.tagName.toLowerCase()}|${h.textContent?.trim().replace(/\s+/g, " ").slice(0, 84)}|${cs.fontSize}`;
    });
    // FAQ-ish details/accordion structures
    const faqDetails = document.querySelectorAll("details").length;
    const header = document.querySelector("header");
    return { outline, faqDetails, headerHTML: header ? header.outerHTML.slice(0, 2600) : "" };
  });
  if (label === "home") writeFileSync(`${OUT}/header-${base.includes("jesspete") ? "clone" : "src"}.html`, data.headerHTML);
  await page.close();
  return data;
}

const result: Record<string, any> = {};
for (const [label, srcPath, clonePath] of ROUTES) {
  console.log(`— ${label}`);
  const src = await probe(SRC, srcPath, label);
  const clone = await probe(CLONE, clonePath, label);
  const counts = (o: string[]) => {
    const h1 = o.filter((x) => x.startsWith("h1|")).length;
    const h2 = o.filter((x) => x.startsWith("h2|")).length;
    const h3 = o.filter((x) => x.startsWith("h3|")).length;
    return `${h1}/${h2}/${h3}`;
  };
  result[label] = { src: src.outline, clone: clone.outline, srcFaq: src.faqDetails, cloneFaq: clone.faqDetails };
  console.log(`  outline h1/h2/h3 — src: ${counts(src.outline)}  clone: ${counts(clone.outline)}  faq details — src: ${src.faqDetails} clone: ${clone.faqDetails}`);
}
writeFileSync(`${OUT}/outline2.json`, JSON.stringify(result, null, 2));
await browser.close();
console.log(`Saved ${OUT}/outline2.json + header html dumps`);
