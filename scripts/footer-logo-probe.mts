import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("https://modfii.com/", { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(4500);
const data = await page.evaluate(() => {
  const f = document.querySelector("footer");
  const container = f?.querySelector(".container, div");
  const firstDiv = f?.querySelector("div");
  return { html: firstDiv?.outerHTML.slice(0, 900) ?? "none" };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
