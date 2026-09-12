import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "/home/z/my-project/audit/remediated";
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("http://127.0.0.1:3002/", { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(2000);
await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); } window.scrollTo(0, 0); });
await page.waitForTimeout(600);
const data = await page.evaluate(() => {
  const hero = document.querySelector("main section");
  const header = document.querySelector("header");
  const testi = [...document.querySelectorAll("figure")][0];
  const h1 = document.querySelector("h1");
  const strip = [...document.querySelectorAll("section")].find((s) => /trusted by buyers/i.test(s.textContent || ""));
  return {
    pageHeight: document.body.scrollHeight,
    heroHeight: hero ? getComputedStyle(hero).height : null,
    headerHeight: getComputedStyle(header).height,
    h1Text: h1?.textContent?.slice(0, 50),
    h1Size: h1 ? getComputedStyle(h1).fontSize : null,
    testiRadius: testi ? getComputedStyle(testi).borderRadius : null,
    stripClasses: strip?.className?.toString?.().slice(0, 80),
    eyebrowCount: [...document.querySelectorAll("span, p")].filter((e) => /Your Prefab Financing Partner/.test(e.textContent || "")).length,
  };
});
console.log(JSON.stringify(data, null, 1));
await page.screenshot({ path: `${OUT}/home-full.png`, fullPage: true });
await page.screenshot({ path: `${OUT}/home-fold.png` });
// interior heights
for (const [label, path] of [["hub", "/modular-home-financing"], ["fha", "/modular-home-financing/loan-options/fha"], ["adu", "/adu-financing"], ["tiny", "/tiny-home-financing"], ["construction", "/construction-loans"]]) {
  await page.goto(`http://127.0.0.1:3002${path}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(800);
  const h = await page.evaluate(() => document.body.scrollHeight);
  const heads = await page.evaluate(() => document.querySelectorAll("h1, h2, h3").length);
  console.log(`${label}: ${h}px, ${heads} h1-h3 (source: hub 19058/100+ , fha 13539/54, adu 13456/80, tiny 12749/77, construction 7442/36)`);
}
await browser.close();
