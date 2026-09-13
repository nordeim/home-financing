import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://modfii.jesspete.shop/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);
await page.locator("figure").first().scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
const avatars = await page.evaluate(() =>
  [...document.querySelectorAll("figure img")].map((i) => ({
    src: i.getAttribute("src"),
    complete: i.complete,
    naturalW: i.naturalWidth,
    displayed: Math.round(i.getBoundingClientRect().width),
    visible: !!(i.offsetWidth && i.offsetHeight),
  })),
);
console.log(JSON.stringify(avatars, null, 1));
await browser.close();
