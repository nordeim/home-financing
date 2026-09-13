/**
 * Focused probe 5: enumerate home sections + mobile height delta +
 * wordmark strip metrics.
 * Run: node --experimental-strip-types scripts/live-parity-probe5.mts
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const SRC = "https://modfii.com";
const CLONE = "https://modfii.jesspete.shop";
const OUT = "/home/z/my-project/audit/live-parity";

const browser = await chromium.launch();

async function probe(base: string, vw: number) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(2200);
  const data = await page.evaluate(() => {
    const sections = [...document.querySelectorAll("section")];
    const list = sections.map((s, i) => {
      const r = s.getBoundingClientRect();
      return {
        i,
        classes: s.className.replace(/\s+/g, " ").slice(0, 110),
        h: Math.round(r.height + s.scrollTop),
        top: Math.round(s.offsetTop),
        heading: s.querySelector("h1, h2")?.textContent?.replace(/\s+/g, " ").trim().slice(0, 70) ?? null,
        imgs: s.querySelectorAll("img").length,
        text: s.textContent?.replace(/\s+/g, " ").trim().slice(0, 110),
      };
    });
    // wordmark strip: the section with 5 manufacturer images
    const strip = sections.find((s) => [...s.querySelectorAll("img")].length >= 4 && (s.textContent || "").length < 400);
    const stripInfo = strip
      ? {
          classes: strip.className.slice(0, 100),
          imgs: [...strip.querySelectorAll("img")].map((i) => ({
            w: Math.round(i.getBoundingClientRect().width),
            h: Math.round(i.getBoundingClientRect().height),
            alt: i.alt,
          })),
        }
      : null;
    // last section (closing CTA)
    const last = sections[sections.length - 1];
    return {
      sections: list,
      strip: stripInfo,
      pageHeight: Math.round(document.documentElement.scrollHeight),
      last: last ? { classes: last.className.slice(0, 100), h: Math.round(last.getBoundingClientRect().height), text: last.textContent?.slice(0, 200) } : null,
    };
  });
  await ctx.close();
  return data;
}

const src = await probe(SRC, 1440);
const clone = await probe(CLONE, 1440);
const srcM = await probe(SRC, 390);
const cloneM = await probe(CLONE, 390);
writeFileSync(`${OUT}/sections.json`, JSON.stringify({ src, clone, srcM, cloneM }, null, 2));

console.log("=== SRC sections (1440) ===");
src.sections.forEach((s: any) => console.log(`${String(s.i).padStart(2)} h=${String(s.h).padStart(5)} ${s.heading ?? "(no heading)"} | ${s.classes}`));
console.log("\n=== CLONE sections (1440) ===");
clone.sections.forEach((s: any) => console.log(`${String(s.i).padStart(2)} h=${String(s.h).padStart(5)} ${s.heading ?? "(no heading)"} | ${s.classes}`));
console.log(`\npageHeight 1440: src ${src.pageHeight} clone ${clone.pageHeight}`);
console.log(`pageHeight 390:  src ${srcM.pageHeight} clone ${cloneM.pageHeight}`);
console.log(`SRC  strip: ${JSON.stringify(src.strip)?.slice(0, 400)}`);
console.log(`CLONE strip: ${JSON.stringify(clone.strip)?.slice(0, 400)}`);
await browser.close();
