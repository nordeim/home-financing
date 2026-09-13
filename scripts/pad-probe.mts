import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
for (const [base, tag] of [["https://modfii.com", "src"], ["https://modfii.jesspete.shop", "clone"]] as const) {
  const page = await ctx.newPage();
  await page.goto(base + "/", { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    const logo = [...document.querySelectorAll("header a")].find((a) => /mod\s*fi/i.test((a.textContent || "").replace(/\s/g, "")));
    const h1 = document.querySelector("h1");
    const footer = document.querySelector("footer");
    return {
      logoX: logo ? Math.round(logo.getBoundingClientRect().x) : null,
      h1X: h1 ? Math.round(h1.getBoundingClientRect().x) : null,
      footerX: footer?.firstElementChild ? Math.round(footer.firstElementChild.getBoundingClientRect().x) : null,
      // nav first item x
      navX: (() => { const n = document.querySelector("header nav a"); return n ? Math.round(n.getBoundingClientRect().x) : null; })(),
    };
  });
  console.log(tag, JSON.stringify(data));
  await page.close();
}
await browser.close();
