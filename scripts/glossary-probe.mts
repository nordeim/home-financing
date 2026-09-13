import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://modfii.com/glossary", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2000);
const data = await page.evaluate(() => {
  const i = [...document.querySelectorAll("h2")].find((h) => /related resources/i.test(h.textContent || ""));
  if (!i) return null;
  const section = i.closest("section, div");
  return { text: i.textContent, html: section?.outerHTML.slice(0, 2200) };
});
console.log(JSON.stringify(data?.html?.slice(0, 2000), null, 0));
await browser.close();
