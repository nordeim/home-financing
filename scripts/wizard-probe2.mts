import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://modfii.com/get-started", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2000);
const out = await page.evaluate(() => {
  const out: string[] = [];
  for (const el of document.querySelectorAll("h1, h2, h3, h4, h5, label, [class*='font-display']")) {
    const t = (el.textContent || "").trim();
    if (t.length > 3 && t.length < 60 && !out.some((o) => o.includes(t.slice(0, 20)))) {
      out.push(`${el.tagName}|${t.slice(0, 55)}`);
    }
  }
  return out.slice(0, 40);
});
console.log(out.join("\n"));
await browser.close();
