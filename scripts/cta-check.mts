import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://modfii.jesspete.shop/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1200);
const cta = await page.evaluate(() => {
  const el = [...document.querySelectorAll("a")].find((a) => (a.textContent || "").includes("Get Pre-Approved"));
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return { text: el.textContent?.trim(), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, bg: cs.backgroundColor };
});
console.log("clone hero CTA:", JSON.stringify(cta));
await page.close();
const page2 = await ctx.newPage();
await page2.goto("https://modfii.com/", { waitUntil: "networkidle", timeout: 60000 });
await page2.waitForTimeout(1200);
const cta2 = await page2.evaluate(() => {
  const el = [...document.querySelectorAll("a")].find((a) => (a.textContent || "").includes("Get Pre-Approved"));
  if (!el) return null;
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return { text: el.textContent?.trim(), w: Math.round(r.width), h: Math.round(r.height), fs: cs.fontSize, bg: cs.backgroundColor };
});
console.log("src hero CTA:", JSON.stringify(cta2));
await browser.close();
