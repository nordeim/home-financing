/**
 * Resolve VLM-vs-pin conflicts with direct DOM evidence — extracts the intro
 * section and problem/solution section structure from source and clone.
 * Run: node --experimental-strip-types scripts/resolve-conflicts.mts
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "/home/z/my-project/audit/resolve";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function analyze(base: string, tag: string) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(2200);
  const data = await page.evaluate(() => {
    const out: Record<string, unknown> = {};

    // INTRO: section containing "Modular & Prefab Home Loans"
    const intro = [...document.querySelectorAll("section")].find((s) => /modular & prefab home loans/i.test(s.textContent || ""));
    if (intro) {
      const h1 = intro.querySelector("h1, h2");
      const eyebrow = intro.querySelector("p, span, div");
      const tabs = [...intro.querySelectorAll('[role="tab"], button')].map((b) => b.textContent?.trim()).filter(Boolean).slice(0, 8);
      out.intro = {
        sectionClasses: intro.className?.toString?.().slice(0, 180),
        heading: h1 ? { tag: h1.tagName, text: h1.textContent?.trim(), size: getComputedStyle(h1).fontSize } : null,
        firstTexts: [...intro.querySelectorAll(":scope > div > *")].slice(0, 6).map((e) => `${e.tagName}: ${e.textContent?.trim().slice(0, 70)}`),
        eyebrowAbove: h1?.previousElementSibling?.textContent?.trim().slice(0, 60) ?? null,
        tabs,
        cardCount: intro.querySelectorAll('[class*="card"], article').length,
        hasLoanTypesAvailableGap: /TypesAvailable/.test(intro.textContent?.replace(/\s+/g, "") ?? ""),
      };
    }

    // PROBLEM/SOLUTION: section containing "Prefab Financing is Broken"
    const broken = [...document.querySelectorAll("section")].find((s) => /prefab financing is broken/i.test(s.textContent || ""));
    if (broken) {
      const buttons = [...broken.querySelectorAll("a, button")].map((b) => b.textContent?.trim());
      const cardTitles = [...broken.querySelectorAll("h3")].map((h) => h.textContent?.trim().slice(0, 40));
      const h2 = broken.querySelector("h2");
      out.broken = {
        sectionClasses: broken.className?.toString?.().slice(0, 180),
        h2: h2 ? { text: h2.textContent?.trim(), maxWidth: getComputedStyle(h2).maxWidth, width: getComputedStyle(h2).width } : null,
        cardTitles,
        buttons,
        ctaAfter: broken.nextElementSibling?.querySelector("a, button")?.textContent?.trim().slice(0, 40) ?? null,
      };
    }

    // HERO text exact
    const hero = [...document.querySelectorAll("section")].find((s) => /stop losing your dream home/i.test(s.textContent || ""));
    if (hero) {
      const h = hero.querySelector("h1, h2");
      const p = hero.querySelector("p");
      out.hero = {
        headline: h?.textContent?.trim(),
        para: p?.textContent?.trim().slice(0, 200),
        paraEndsWithPeriod: (p?.textContent?.trim() ?? "").endsWith("."),
        eyebrow: h?.previousElementSibling?.textContent?.trim().slice(0, 60) ?? hero.querySelector("span")?.textContent?.slice(0, 60) ?? null,
        ctaButtons: [...hero.querySelectorAll("a, button")].map((b) => b.textContent?.trim()).filter(Boolean).slice(0, 4),
      };
    }

    // TESTIMONIALS card internals
    const testi = [...document.querySelectorAll("section")].find((s) => /trusted by 2,000/i.test(s.textContent || ""));
    if (testi) {
      const firstCard = testi.querySelector("article, [class*=card], li");
      out.testimonialCard = firstCard
        ? {
            classes: firstCard.className?.toString?.().slice(0, 160),
            radius: getComputedStyle(firstCard).borderRadius,
            bg: getComputedStyle(firstCard).backgroundColor,
            border: getComputedStyle(firstCard).border,
            shadow: getComputedStyle(firstCard).boxShadow.slice(0, 80),
            texts: [...firstCard.querySelectorAll("p")].map((p) => p.textContent?.trim().slice(0, 80)).slice(0, 4),
          }
        : null;
    }

    // BODY background
    out.bodyBg = getComputedStyle(document.body).backgroundColor;
    out.bodyColor = getComputedStyle(document.body).color;
    return out;
  });
  writeFileSync(`${OUT}/${tag}.json`, JSON.stringify(data, null, 2));
  await ctx.close();
  return data;
}

const src = await analyze("https://modfii.com", "source");
const cln = await analyze(process.env.CLONE_BASE ?? "https://modfii.jesspete.shop", "clone");
console.log("SOURCE:", JSON.stringify(src, null, 1));
console.log("\nCLONE:", JSON.stringify(cln, null, 1));
await browser.close();
