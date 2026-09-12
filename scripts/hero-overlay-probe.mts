import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto("https://modfii.com/", { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(4500);
const data = await page.evaluate(() => {
  const hero = [...document.querySelectorAll("section")].find((s) => /stop losing your dream home/i.test(s.textContent || ""));
  if (!hero) return { found: false };
  const img = hero.querySelector("img");
  return {
    found: true,
    imgClasses: img?.className?.toString?.().slice(0, 200),
    imgStyle: img?.getAttribute("style")?.slice(0, 200),
    imgFilter: img ? getComputedStyle(img).filter : null,
    imgObjectFit: img ? getComputedStyle(img).objectFit : null,
    overlayDivs: [...hero.querySelectorAll("div")].filter((d) => {
      const cs = getComputedStyle(d);
      return cs.backgroundImage.includes("gradient") || (cs.backgroundColor !== "rgba(0, 0, 0, 0)" && cs.position === "absolute");
    }).slice(0, 4).map((d) => ({ classes: d.className?.toString?.().slice(0, 150), bg: getComputedStyle(d).backgroundImage.slice(0, 180) || getComputedStyle(d).backgroundColor, opacity: getComputedStyle(d).opacity })),
    sectionClasses: hero.className?.toString?.().slice(0, 200),
    innerMaxWidth: hero.querySelector(".container")?.className?.toString?.().slice(0, 100) ?? hero.firstElementChild?.className?.toString?.().slice(0, 100),
  };
});
console.log(JSON.stringify(data, null, 1));
await browser.close();
