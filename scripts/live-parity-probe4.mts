/**
 * Focused probe 4: rendered container widths + photo hero metrics + h1/intro
 * column widths, at three viewports.
 * Run: node --experimental-strip-types scripts/live-parity-probe4.mts
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const SRC = "https://modfii.com";
const CLONE = "https://modfii.jesspete.shop";
const OUT = "/home/z/my-project/audit/live-parity";

const browser = await chromium.launch();

async function probe(base: string, tag: string, vw: number) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const out: Record<string, unknown> = {};
    // container of the first content section (intro)
    const h1 = document.querySelector("h1");
    const intro = h1?.closest("section");
    const container = intro?.querySelector("div");
    if (container) {
      const r = container.getBoundingClientRect();
      out.introContainer = { w: Math.round(r.width), x: Math.round(r.x), classes: container.className.slice(0, 80) };
    }
    const textCol = h1?.parentElement;
    if (textCol) {
      out.h1Column = { w: Math.round(textCol.getBoundingClientRect().width), classes: (textCol as HTMLElement).className?.slice(0, 80) };
      out.h1Size = getComputedStyle(h1!).fontSize;
    }
    // photo hero = the section BEFORE the intro (or with photo/bg-image)
    const sections = [...document.querySelectorAll("section")];
    out.sectionCount = sections.length;
    const photoHero = sections.find((s) => {
      const cs = getComputedStyle(s);
      return cs.backgroundImage.includes("url") || s.querySelector("img[class*=absolute], img");
    });
    const first = sections[0];
    const heroIdx = photoHero ? sections.indexOf(photoHero) : -1;
    out.firstSection = first
      ? {
          classes: first.className.slice(0, 150),
          h: Math.round(first.getBoundingClientRect().height),
          child: first.querySelector("h1, h2")?.textContent?.slice(0, 60),
        }
      : null;
    if (photoHero) {
      const cs = getComputedStyle(photoHero);
      const r = photoHero.getBoundingClientRect();
      const grid = photoHero.querySelector(".grid");
      out.photoHero = {
        idx: heroIdx,
        classes: photoHero.className.slice(0, 160),
        h: Math.round(r.height),
        bgImage: cs.backgroundImage.slice(0, 70),
        padding: cs.padding,
        heading: photoHero.querySelector("h1, h2")?.textContent?.replace(/\s+/g, " ").slice(0, 90),
        headingSize: photoHero.querySelector("h1, h2") ? getComputedStyle(photoHero.querySelector("h1, h2")!).fontSize : null,
        grid: grid ? { classes: grid.className.slice(0, 120), cols: getComputedStyle(grid).gridTemplateColumns.slice(0, 60) } : null,
      };
    }
    // header container width
    const header = document.querySelector("header");
    const hInner = header?.firstElementChild;
    if (hInner) out.headerContainer = { w: Math.round(hInner.getBoundingClientRect().width), classes: (hInner as HTMLElement).className.slice(0, 60) };
    // footer container
    const footer = document.querySelector("footer");
    const fInner = footer?.firstElementChild;
    if (fInner) out.footerContainer = { w: Math.round(fInner.getBoundingClientRect().width) };
    return out;
  });
  await ctx.close();
  return data;
}

const report: Record<string, any> = {};
for (const vw of [1440, 1280, 390]) {
  report[`src-${vw}`] = await probe(SRC, "src", vw);
  report[`clone-${vw}`] = await probe(CLONE, "clone", vw);
}
writeFileSync(`${OUT}/metrics.json`, JSON.stringify(report, null, 2));

for (const vw of [1440, 1280, 390]) {
  const s = report[`src-${vw}`], c = report[`clone-${vw}`];
  console.log(`\n=== viewport ${vw} ===`);
  console.log(`header container: src ${s.headerContainer?.w}  clone ${c.headerContainer?.w}`);
  console.log(`intro container:  src ${s.introContainer?.w} (${s.introContainer?.classes})  clone ${c.introContainer?.w}`);
  console.log(`h1 column:        src ${s.h1Column?.w}  clone ${c.h1Column?.w}  (h1 size ${s.h1Size} vs ${c.h1Size})`);
  console.log(`photo hero:       src ${JSON.stringify(s.photoHero?.classes)} h=${s.photoHero?.h} heading=${s.photoHero?.headingSize}`);
  console.log(`                  clone ${JSON.stringify(c.photoHero?.classes)} h=${c.photoHero?.h} heading=${c.photoHero?.headingSize}`);
  console.log(`section count:    src ${s.sectionCount} clone ${c.sectionCount}`);
}
await browser.close();
