import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("http://127.0.0.1:3002/", { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.waitForTimeout(1500);
const data = await page.evaluate(() => {
  const header = document.querySelector("header");
  const eyebrow = [...document.querySelectorAll("p")].find((p) => /The #1 Prefab Home Mortgage Platform/.test(p.textContent || ""));
  const footerBadge = document.querySelector("footer [class*='rotate-3']");
  const headerBadge = document.querySelector("header [class*='rotate-3']");
  return {
    headerBg: getComputedStyle(header).backgroundColor,
    headerBlur: getComputedStyle(header).backdropFilter,
    headerInnerH: getComputedStyle(header.firstElementChild).height,
    eyebrowBg: eyebrow ? getComputedStyle(eyebrow).backgroundColor : null,
    eyebrowBorder: eyebrow ? getComputedStyle(eyebrow).borderTopColor : null,
    footerBadgeTag: footerBadge?.tagName,
    headerBadgeTag: headerBadge?.tagName,
  };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
