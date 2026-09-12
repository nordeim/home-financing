import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("https://modfii.com/", { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(4500);
const data = await page.evaluate(() => {
  const els = [...document.querySelectorAll("div, span")].filter((d) => getComputedStyle(d).backgroundColor === "rgb(245, 159, 10)");
  return els.map((e) => ({ text: e.textContent?.trim().slice(0, 60), classes: e.className?.toString?.().slice(0, 100) }));
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
