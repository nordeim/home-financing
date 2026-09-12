/**
 * Content outline extraction v2 — flat h1-h4 dump + section count for the
 * source site's deep guide pages.
 * Run: node --experimental-strip-types scripts/source-outline.mts
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "/home/z/my-project/audit/outline";
mkdirSync(OUT, { recursive: true });

const PAGES = [
  ["hub", "/modular-home-financing"],
  ["fha", "/modular-home-financing/loan-options/fha"],
  ["adu", "/adu-financing"],
  ["tiny", "/tiny-home-financing"],
  ["construction", "/construction-loans"],
  ["about", "/about"],
  ["get-started", "/get-started"],
  ["calculator", "/calculator"],
  ["resources", "/resources"],
  ["learn", "/learn"],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

for (const [label, path] of PAGES) {
  const page = await ctx.newPage();
  await page.goto(`https://modfii.com${path}`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1800);
  const outline = await page.evaluate(() => {
    const headings = [...document.querySelectorAll("h1, h2, h3, h4")].map((h) => {
      const cs = getComputedStyle(h);
      return `${h.tagName} [${cs.fontSize}] ${h.textContent?.trim().slice(0, 95)}`;
    });
    const sections = [...document.querySelectorAll("section")].map((s) => {
      const t = s.querySelector("h1, h2, h3");
      return t ? t.textContent?.trim().slice(0, 60) : "(no heading)";
    });
    return { headings, sections, height: document.body.scrollHeight };
  });
  writeFileSync(
    `${OUT}/${label}.txt`,
    `# ${label} — ${path} (pageHeight ${outline.height}px, ${outline.sections.length} sections)\n\n## Headings\n${outline.headings.join("\n")}\n\n## Sections\n${outline.sections.join("\n")}\n`,
  );
  console.log(`== ${label}: ${outline.height}px, ${outline.sections.length} sections, ${outline.headings.length} headings ==`);
  console.log(outline.headings.slice(0, 40).join("\n"));
  console.log("");
  await page.close();
}
await browser.close();
