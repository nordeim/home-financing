import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("http://127.0.0.1:3002/", { waitUntil: "domcontentloaded", timeout: 30_000 });
await page.waitForTimeout(1500);
const data = await page.evaluate(() => {
  const h2 = document.querySelector("main section h2");
  const hero = document.querySelector("main section");
  const container = hero?.querySelector(":scope > div.grid");
  const textCol = container?.firstElementChild;
  const rects = h2 ? [...h2.getClientRects()] : [];
  return {
    h2Width: h2 ? getComputedStyle(h2).width : null,
    textColClasses: textCol?.className?.toString?.().slice(0, 60),
    textColWidth: textCol ? getComputedStyle(textCol).maxWidth + " / " + getComputedStyle(textCol).width : null,
    lineCount: rects.length,
    heroHeight: hero ? getComputedStyle(hero).height : null,
  };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
