import { chromium } from "playwright";
const browser = await chromium.launch();

async function logo(base: string, tag: string) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(base, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForTimeout(4000);
  const data = await page.evaluate(() => {
    const header = document.querySelector("header");
    const link = header?.querySelector("a[href='/'], a[href='/'] *") ?? header?.querySelector("a");
    if (!link) return { found: false };
    const box = link.querySelector("svg")?.closest("div") ?? link;
    return {
      found: true,
      html: link.innerHTML.slice(0, 900),
      boxSize: `${box.clientWidth}x${box.clientHeight}`,
      svgCount: link.querySelectorAll("svg").length,
      text: link.textContent?.trim().slice(0, 30),
    };
  });
  console.log(`== ${tag} ==`, JSON.stringify(data, null, 1).slice(0, 1200));
  await page.close();
}
await logo("https://modfii.com", "SOURCE");
await logo("https://modfii.jesspete.shop", "CLONE");
await browser.close();
