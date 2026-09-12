import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("https://modfii.com/", { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(4500);
const data = await page.evaluate(() => {
  const hero = [...document.querySelectorAll("section")].find((s) => /stop losing your dream home/i.test(s.textContent || ""));
  const badge = hero?.querySelector("[class*='bg-accent']");
  const statCard = hero?.querySelector("[class*='glass'], [class*='backdrop']");
  const eyebrow = hero?.querySelector("p, span");
  return {
    badge: badge ? { text: badge.textContent?.trim().slice(0, 80), html: badge.outerHTML.slice(0, 300) } : null,
    statCard: statCard ? { text: statCard.textContent?.trim().slice(0, 150), classes: statCard.className?.toString?.().slice(0, 200) } : null,
    eyebrow: eyebrow ? { text: eyebrow.textContent?.trim().slice(0, 60), classes: eyebrow.className?.toString?.().slice(0, 120) } : null,
  };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
