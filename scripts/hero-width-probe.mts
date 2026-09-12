import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("https://modfii.com/", { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(4500);
const data = await page.evaluate(() => {
  const h2 = [...document.querySelectorAll("h1, h2")].find((h) => /stop losing your dream home/i.test(h.textContent || ""));
  if (!h2) return null;
  const cs = getComputedStyle(h2);
  const parent = h2.parentElement;
  return {
    h2Width: cs.width,
    maxW: cs.maxWidth,
    parentClasses: parent?.className?.toString?.().slice(0, 120),
    parentWidth: parent ? getComputedStyle(parent).width : null,
    grandparentClasses: parent?.parentElement?.className?.toString?.().slice(0, 120),
    containerStructure: (() => {
      const hero = h2.closest("section");
      return [...(hero?.querySelectorAll(":scope > div > div") ?? [])].slice(0, 3).map((d) => d.className?.toString?.().slice(0, 100));
    })(),
  };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
