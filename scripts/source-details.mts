/**
 * Precise extraction: source hero paragraphs + testimonial cards + intro card
 * internals. Run: node --experimental-strip-types scripts/source-details.mts
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://modfii.com/", { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(2200);
const data = await page.evaluate(() => {
  const out: Record<string, unknown> = {};
  const hero = [...document.querySelectorAll("section")].find((s) => /stop losing your dream home/i.test(s.textContent || ""));
  if (hero) {
    out.heroParagraphs = [...hero.querySelectorAll("p")].map((p) => p.textContent?.trim().slice(0, 220));
    out.heroCTAStyles = [...hero.querySelectorAll("a, button")]
      .filter((b) => /get pre-approved|start free/i.test(b.textContent || ""))
      .map((b) => {
        const cs = getComputedStyle(b);
        return { text: b.textContent?.trim().slice(0, 40), bg: cs.backgroundColor, color: cs.color, size: cs.fontSize, weight: cs.fontWeight, padding: cs.padding, radius: cs.borderRadius, classes: b.className?.toString?.().slice(0, 140) };
      });
    out.heroEyebrow = hero.querySelector("span, p")?.className?.toString?.().slice(0, 140);
    out.statChips = [...hero.querySelectorAll("[class*=glass], [class*=stat], [class*=grid] > div")].slice(0, 8).map((d) => d.textContent?.trim().slice(0, 60));
  }
  const testi = [...document.querySelectorAll("section")].find((s) => /trusted by 2,000/i.test(s.textContent || ""));
  if (testi) {
    const cards = [...testi.children[0].querySelectorAll("div")].filter((d) => /sarah chen|marcus|james thornton/i.test(d.textContent || "")).slice(0, 3);
    out.testiCards = cards.map((c) => {
      const cs = getComputedStyle(c);
      return { classes: c.className?.toString?.().slice(0, 150), radius: cs.borderRadius, bg: cs.backgroundColor, border: cs.border, shadow: cs.boxShadow.slice(0, 90), padding: cs.padding };
    });
    out.testiGrid = testi.children[0].className?.toString?.().slice(0, 150);
    out.savings = [...testi.querySelectorAll("div")].filter((d) => /average savings|total savings|\$\d/i.test(d.textContent || "")).slice(0, 6).map((d) => d.textContent?.trim().slice(0, 60));
  }
  const intro = [...document.querySelectorAll("section")].find((s) => /modular & prefab home loans/i.test(s.textContent || ""));
  if (intro) {
    out.introCards = [...intro.querySelectorAll("h3")].slice(0, 8).map((h) => {
      const card = h.closest("div");
      return { title: h.textContent?.trim(), cardClasses: card?.className?.toString?.().slice(0, 120), bg: card ? getComputedStyle(card).backgroundColor : null, radius: card ? getComputedStyle(card).borderRadius : null };
    });
    out.introEyebrow = intro.querySelector("h1")?.parentElement?.querySelector("span, p, div")?.className?.toString?.().slice(0, 140);
    const explore = [...intro.querySelectorAll("a, button")].find((b) => /explore all loan options/i.test(b.textContent || ""));
    out.exploreCTA = explore ? { parent: explore.closest("div")?.className?.toString?.().slice(0, 100), classes: explore.className?.toString?.().slice(0, 140), size: getComputedStyle(explore).fontSize } : null;
  }
  // FAQ accordion first item
  const faq = [...document.querySelectorAll("section")].find((s) => /questions\? we'?ve got answers/i.test(s.textContent || ""));
  if (faq) {
    const item = faq.querySelector("[class*=accordion], [data-state] > div, details");
    out.faqItem = item ? { classes: item.className?.toString?.().slice(0, 140), html: item.outerHTML.slice(0, 600) } : null;
    out.faqHeading = faq.querySelector("h2")?.className?.toString?.().slice(0, 140);
  }
  return out;
});
writeFileSync("/home/z/my-project/audit/resolve/source-details.json", JSON.stringify(data, null, 2));
console.log(JSON.stringify(data, null, 1));
await browser.close();
