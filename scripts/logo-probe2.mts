import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("https://modfii.com/", { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(4500);
const data = await page.evaluate(() => {
  const header = document.querySelector("header");
  const inner = header?.firstElementChild;
  const first = inner?.firstElementChild; // logo block typically first
  return {
    headerChildren: [...(inner?.children ?? [])].slice(0, 3).map((c) => ({ tag: c.tagName, text: c.textContent?.trim().slice(0, 30), html: c.innerHTML?.slice(0, 800) })),
    footerLogo: (() => {
      const f = document.querySelector("footer");
      const firstLink = f?.querySelector("a");
      return firstLink ? { html: firstLink.innerHTML.slice(0, 500), text: firstLink.textContent?.trim().slice(0, 30) } : null;
    })(),
  };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
