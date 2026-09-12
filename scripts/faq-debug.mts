import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("http://127.0.0.1:3002/", { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.waitForTimeout(1000);
const info = await page.evaluate(() => {
  const items = [...document.querySelectorAll("section#faq details")];
  return items.slice(0, 3).map((d) => ({ name: d.getAttribute("name"), open: d.hasAttribute("open") }));
});
console.log("before:", JSON.stringify(info));
await page.locator("section#faq details").nth(0).locator("summary").click();
await page.waitForTimeout(300);
const after1 = await page.evaluate(() => [...document.querySelectorAll("section#faq details")].slice(0, 3).map((d) => d.hasAttribute("open")));
console.log("after open 0:", JSON.stringify(after1));
await page.locator("section#faq details").nth(1).locator("summary").click();
await page.waitForTimeout(300);
const after2 = await page.evaluate(() => [...document.querySelectorAll("section#faq details")].slice(0, 3).map((d) => d.hasAttribute("open")));
console.log("after open 1:", JSON.stringify(after2));
await browser.close();
