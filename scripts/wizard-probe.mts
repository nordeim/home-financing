import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://modfii.com/get-started", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);
const out = await page.evaluate(() => {
  // find the form area — look for step titles
  const form = document.querySelector("form") ?? document.querySelector("main");
  const out: string[] = [];
  if (form) {
    for (const el of form.querySelectorAll("h1, h2, h3, h4, [class*=font-display]")) {
      if ((el.textContent || "").trim().length > 3 && (el.textContent || "").trim().length < 60) {
        out.push(`${el.tagName}|${(el.textContent || "").trim().slice(0, 50)}|${(el as HTMLElement).className.slice(0, 80)}`);
      }
    }
  }
  return out.slice(0, 20);
});
console.log(out.join("\n"));
await browser.close();
