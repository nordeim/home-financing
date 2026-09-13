import { chromium } from "playwright";
const browser = await chromium.launch();
for (const [w, h] of [[1280, 720], [390, 844]] as const) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.goto("https://modfii.com/get-started", { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1800);
  const data = await page.evaluate(() => {
    const h1s = [...document.querySelectorAll("h1")];
    return h1s.map((h) => {
      const cs = getComputedStyle(h);
      const r = h.getBoundingClientRect();
      return { text: h.textContent?.trim().slice(0, 40), size: cs.fontSize, visible: r.width > 0, classes: (h as HTMLElement).className.slice(0, 70) };
    });
  });
  console.log(`${w}px:`, JSON.stringify(data));
  await ctx.close();
}
await browser.close();
