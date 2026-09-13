/**
 * Dumps the fully-rendered source home page HTML (post-hydration) for
 * section-by-section parity reference.
 * Run: node --experimental-strip-types scripts/live-parity-dump-src.mts
 */
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://modfii.com/", { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(2500);
const html = await page.content();
writeFileSync("/home/z/my-project/audit/live-parity/src-home.html", html);
console.log("bytes:", html.length);

// Also dump clone home for the same reference
const page2 = await ctx.newPage();
await page2.goto("https://modfii.jesspete.shop/", { waitUntil: "networkidle", timeout: 60_000 });
await page2.waitForTimeout(2000);
const html2 = await page2.content();
writeFileSync("/home/z/my-project/audit/live-parity/clone-home.html", html2);
console.log("clone bytes:", html2.length);
await browser.close();
