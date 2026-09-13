/**
 * Focused probe 3: source vs clone — full header HTML, home FAQ structure,
 * animation/transition signals, hero overlay details.
 * Run: node --experimental-strip-types scripts/live-parity-probe3.mts
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const SRC = "https://modfii.com";
const CLONE = "https://modfii.jesspete.shop";
const OUT = "/home/z/my-project/audit/live-parity";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

async function probeHome(base: string, tag: string) {
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const out: Record<string, unknown> = {};
    out.headerHTML = document.querySelector("header")?.outerHTML.slice(0, 4000) ?? "";
    // FAQ area — find the section containing "Frequently"
    const faqSection = [...document.querySelectorAll("section, div")].find((s) =>
      /frequently asked/i.test(s.querySelector("h2, h3")?.textContent || "") && s.tagName === "SECTION",
    );
    if (faqSection) {
      out.faqHTML = faqSection.outerHTML.slice(0, 3000);
      out.faqFirstItem = faqSection.querySelector("[class*=accordion], details, [data-state]")?.outerHTML.slice(0, 1200) ?? null;
    }
    // Animation signals: elements with transition/animation styles + framer-motion markers
    const animated = [...document.querySelectorAll("*")].filter((el) => {
      const cs = getComputedStyle(el);
      return cs.transitionDuration !== "0s" || cs.animationName !== "none";
    });
    out.animatedCount = animated.length;
    out.animationNames = [...new Set(animated.map((el) => getComputedStyle(el).animationName).filter((n) => n !== "none"))].slice(0, 12);
    out.dataRevealCount = document.querySelectorAll("[data-reveal]").length;
    // Hero section detail — the section containing the H1's ancestor hero
    const h1 = document.querySelector("h1");
    const heroSection = h1?.closest("section");
    if (heroSection) {
      out.heroHTML = heroSection.outerHTML.slice(0, 3000);
    }
    // font families actually used
    const body = getComputedStyle(document.body);
    out.bodyFont = body.fontFamily.slice(0, 90);
    out.h1Font = h1 ? getComputedStyle(h1).fontFamily.slice(0, 90) : null;
    // scroll reveal check: elements with opacity 0
    out.hiddenCount = [...document.querySelectorAll("main *")].filter((el) => getComputedStyle(el).opacity === "0").length;
    return out;
  });
  await page.screenshot({ path: `${OUT}/home-full-${tag}.png`, fullPage: true }).catch(() => {});
  writeFileSync(`${OUT}/home-${tag}.json`, JSON.stringify(data, null, 2));
  await page.close();
  return data;
}

const src = await probeHome(SRC, "src");
const clone = await probeHome(CLONE, "clone");

console.log("SRC  animated:", src.animatedCount, "animations:", JSON.stringify(src.animationNames), "dataReveal:", src.dataRevealCount, "hidden:", src.hiddenCount);
console.log("CLONE animated:", clone.animatedCount, "animations:", JSON.stringify(clone.animationNames), "dataReveal:", clone.dataRevealCount, "hidden:", clone.hiddenCount);
console.log("\nSRC  bodyFont:", src.bodyFont);
console.log("CLONE bodyFont:", clone.bodyFont);
console.log("SRC faqHTML head:", (src.faqHTML as string || "").slice(0, 400));
console.log("CLONE faqHTML head:", (clone.faqHTML as string || "").slice(0, 400));
console.log("SRC heroHTML head:", (src.heroHTML as string || "").slice(0, 500));
console.log("CLONE heroHTML head:", (clone.heroHTML as string || "").slice(0, 500));

await browser.close();
