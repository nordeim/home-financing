import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("https://modfii.com/", { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(2000);
// open the More dropdown
const more = page.getByRole("button", { name: /^more$/i }).first();
await more.click().catch(() => {});
await page.waitForTimeout(600);
const data = await page.evaluate(() => {
  const pick = (el: Element | null, label: string) => el ? { label, radius: getComputedStyle(el).borderRadius, classes: el.className?.toString?.().slice(0, 100) } : { label, radius: "n/a" };
  return [
    pick(document.querySelector("header a[class*=rounded], header button[class*=rounded]"), "header CTA"),
    pick(document.querySelector("[role=menu], [class*=dropdown], header div[class*=absolute]"), "More dropdown"),
    pick([...document.querySelectorAll("details + *, [data-state] > div")][0] ?? null, "faq item"),
    pick(document.querySelector("input, select"), "input"),
    pick([...document.querySelectorAll("section img")].find((i) => /wordmark|dvele/i.test(i.src))?.closest("div:not([class*=grid])") ?? null, "wordmark cell"),
    pick([...document.querySelectorAll("div")].find((d) => /sarah chen/i.test(d.textContent || "") && d.className?.toString?.().includes("rounded")), "testimonial card"),
    pick([...document.querySelectorAll("div")].find((d) => d.className?.toString?.().match(/glass|backdrop/) && /avg\. savings/i.test(d.textContent || "")), "hero stat card"),
    pick([...document.querySelectorAll("button, a")].find((b) => /get started/i.test(b.textContent || "")), "get started btn"),
  ];
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
