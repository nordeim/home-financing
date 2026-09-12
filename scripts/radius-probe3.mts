import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("https://modfii.com/", { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(5000);
await page.getByRole("button", { name: /^more$/i }).first().click().catch(() => {});
await page.waitForTimeout(900);
const html = await page.evaluate(() => {
  const header = document.querySelector("header");
  const abs = [...(header?.querySelectorAll("div") ?? [])].filter((d) => getComputedStyle(d).position === "absolute");
  return abs.map((p) => ({ classes: p.className?.toString?.().slice(0, 130), radius: getComputedStyle(p).borderRadius, text: p.textContent?.trim().slice(0, 50) }));
});
console.log(JSON.stringify(html, null, 1));
await browser.close();
