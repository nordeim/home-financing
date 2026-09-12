import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("https://modfii.com/", { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(4000);
await page.getByRole("button", { name: /^more$/i }).first().click().catch(() => {});
await page.waitForTimeout(700);
const data = await page.evaluate(() => {
  const panels = [...document.querySelectorAll("header div")].filter((d) => {
    const cs = getComputedStyle(d);
    return cs.position === "absolute" && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && d.textContent && d.textContent.trim().length > 5;
  });
  return panels.map((p) => ({ radius: getComputedStyle(p).borderRadius, bg: getComputedStyle(p).backgroundColor, shadow: getComputedStyle(p).boxShadow.slice(0, 80), border: getComputedStyle(p).border, text: p.textContent?.trim().slice(0, 60), classes: p.className?.toString?.().slice(0, 120) }));
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
