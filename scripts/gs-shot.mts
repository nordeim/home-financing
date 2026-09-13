import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://modfii.com/get-started", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
await page.evaluate(() => window.scrollTo(0, 1200));
await page.waitForTimeout(800);
// probe the Common Questions block position + colors
const data = await page.evaluate(() => {
  const headings = [...document.querySelectorAll("h3")].filter((h) => /common questions/i.test(h.textContent || ""));
  if (!headings.length) return null;
  const h = headings[0];
  const cs = getComputedStyle(h);
  const r = h.getBoundingClientRect() + { top: window.scrollY };
  const ancestor = h.closest("section");
  const acs = ancestor ? getComputedStyle(ancestor) : null;
  // find the testimonial figure
  const fig = document.querySelector("figure") ?? h.closest("figure, div");
  const figCard = h.parentElement?.parentElement;
  return {
    color: cs.color,
    y: Math.round(h.getBoundingClientRect().top + window.scrollY),
    sectionBg: acs?.backgroundColor,
    sectionBgImage: acs?.backgroundImage.slice(0, 60),
    cardBg: figCard ? getComputedStyle(figCard).backgroundColor : null,
    cardClasses: figCard?.className?.slice(0, 120),
  };
});
console.log(JSON.stringify(data, null, 1));
await page.screenshot({ path: "/home/z/my-project/audit/live-parity/src-get-started-full.png", fullPage: true });
await browser.close();
