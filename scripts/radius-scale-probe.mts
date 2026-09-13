import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://modfii.com/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2000);
const scale = await page.evaluate(() => {
  const out: Record<string, string> = {};
  for (const cls of ["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full"]) {
    const el = [...document.querySelectorAll("main *")].find((e) => (e as HTMLElement).className?.toString().split(" ").includes(cls));
    if (el) out[cls] = getComputedStyle(el).borderRadius;
  }
  return out;
});
console.log("SRC  scale:", JSON.stringify(scale));
const page2 = await ctx.newPage();
await page2.goto("http://127.0.0.1:3002/", { waitUntil: "networkidle", timeout: 60000 });
await page2.waitForTimeout(1000);
const scale2 = await page2.evaluate(() => {
  const out: Record<string, string> = {};
  for (const cls of ["rounded-sm", "rounded-md", "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full"]) {
    const el = [...document.querySelectorAll("main *")].find((e) => (e as HTMLElement).className?.toString().split(" ").includes(cls));
    if (el) out[cls] = getComputedStyle(el).borderRadius;
  }
  return out;
});
console.log("CLONE scale:", JSON.stringify(scale2));
await browser.close();
