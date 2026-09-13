import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
for (const [base, tag] of [["https://modfii.com", "src"], ["https://modfii.jesspete.shop", "clone"]] as const) {
  const page = await ctx.newPage();
  await page.goto(base + "/get-started", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const out = await page.evaluate(() => [...document.querySelectorAll("h1,h2,h3")].map(h => h.tagName.toLowerCase() + "|" + (h.textContent || "").trim().replace(/\s+/g, " ").slice(0, 70)));
  console.log("===", tag, "==="); out.forEach(x => console.log(x));
  await page.close();
}
await browser.close();
