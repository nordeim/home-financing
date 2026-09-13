import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://modfii.jesspete.shop/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);
// scroll to FAQ
await page.locator("#faq").scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
const details = page.locator("#faq details");
const count = await details.count();
// open first two — exclusive check (pass-6 feature)
await details.nth(0).locator("summary").click();
await page.waitForTimeout(300);
await details.nth(1).locator("summary").click();
await page.waitForTimeout(300);
const openStates = await page.evaluate(() => [...document.querySelectorAll("#faq details")].map((d) => (d as HTMLDetailsElement).open));
console.log("FAQ items:", count, "open states after opening two:", JSON.stringify(openStates));
await browser.close();
