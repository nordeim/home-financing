import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.goto("https://modfii.com/get-started", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2500);
const map = await page.evaluate(() => {
  const items: Array<{ name: string; y: number; section: string; sectionBg: string }> = [];
  const sections = [...document.querySelectorAll("section")];
  const marks: Array<[string, () => Element | null | undefined]> = [
    ["h1", () => document.querySelector("h1")],
    ["form-card", () => [...document.querySelectorAll("div")].find((d) => /shadow-2xl/.test(d.className))],
    ["benefit-2min", () => [...document.querySelectorAll("h3")].find((h) => /2-Minute/.test(h.textContent || ""))],
    ["testimonial", () => [...document.querySelectorAll("blockquote, figure")][0] ?? null],
    ["common-questions", () => [...document.querySelectorAll("h3")].find((h) => /common questions/i.test(h.textContent || ""))],
    ["why-choose", () => [...document.querySelectorAll("h2")].find((h) => /why choose/i.test(h.textContent || ""))],
    ["steps", () => [...document.querySelectorAll("h2")].find((h) => /3 Easy Steps/i.test(h.textContent || ""))],
  ];
  for (const [name, fn] of marks) {
    const el = fn();
    if (!el) { items.push({ name, y: -1, section: "not found", sectionBg: "" }); continue; }
    const sec = (el as Element).closest("section");
    items.push({
      name,
      y: Math.round((el as Element).getBoundingClientRect().top + window.scrollY),
      section: sec ? sec.className.slice(0, 60) : "(no section)",
      sectionBg: sec ? getComputedStyle(sec).backgroundColor : "",
    });
  }
  return items;
});
console.log(JSON.stringify(map, null, 1));
await browser.close();
