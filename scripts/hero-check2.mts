import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("http://127.0.0.1:3002/", { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.waitForTimeout(1500);
const data = await page.evaluate(() => {
  const h2 = document.querySelector("main section h2");
  const hero = document.querySelector("main section");
  const range = document.createRange();
  range.selectNodeContents(h2);
  const lineRects = [...range.getClientRects()].filter((r) => r.height > 30);
  return {
    h2Height: h2 ? getComputedStyle(h2).height : null,
    lineCount: lineRects.length,
    heroHeight: hero ? getComputedStyle(hero).height : null,
  };
});
console.log(JSON.stringify(data, null, 1));
await page.screenshot({ path: "/home/z/my-project/audit/remediated/home-fold.png" });
await browser.close();
