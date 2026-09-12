/**
 * Interior pages diff — visits key interior routes on source and clone,
 * captures hero internals + screenshots for parity review.
 * Run: node --experimental-strip-types scripts/interior-diff.mts
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "/home/z/my-project/audit/interior";
mkdirSync(OUT, { recursive: true });

// [label, sourcePath, clonePath]
const ROUTES: Array<[string, string, string]> = [
  ["get-started", "/get-started", "/get-started"],
  ["calculator", "/calculator", "/calculator"],
  ["hub", "/modular-home-financing", "/modular-home-financing"],
  ["fha", "/modular-home-financing/loan-options/fha", "/modular-home-financing/loan-options/fha"],
  ["learn", "/learn", "/learn"],
  ["adu", "/adu-financing", "/adu-financing"],
  ["tiny", "/tiny-home-financing", "/tiny-home-financing"],
  ["construction", "/construction-loans", "/construction-loans"],
  ["about", "/about", "/about"],
  ["glossary", "/glossary", "/glossary"],
  ["resources", "/resources", "/resources"],
  ["compare-fha", "/compare/fha-vs-conventional", "/compare/fha-vs-conventional-prefab"],
];

const browser = await chromium.launch();
const results: Record<string, unknown> = {};

async function analyze(base: string, path: string) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs: string[] = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 80)));
  await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const data = await page.evaluate(() => {
    const out: Record<string, unknown> = {};
    const h1 = document.querySelector("h1");
    out.h1 = h1 ? { text: h1.textContent?.trim().slice(0, 80), size: getComputedStyle(h1).fontSize, color: getComputedStyle(h1).color } : null;
    const hero = document.querySelector("main section, section");
    if (hero) {
      const cs = getComputedStyle(hero);
      out.hero = {
        classes: hero.className?.toString?.().slice(0, 200),
        height: cs.height,
        bg: cs.backgroundColor,
        bgImage: cs.backgroundImage.slice(0, 90),
        img: hero.querySelector("img") ? { src: hero.querySelector("img")!.src.split("/").pop()?.slice(0, 50), opacity: getComputedStyle(hero.querySelector("img")!).opacity } : null,
        eyebrow: hero.querySelector("p, span")?.textContent?.trim().slice(0, 60),
      };
    }
    out.h2s = [...document.querySelectorAll("h2")].slice(0, 8).map((h) => h.textContent?.trim().slice(0, 60));
    out.pageHeight = document.body.scrollHeight;
    out.title = document.title.slice(0, 70);
    return out;
  });
  await ctx.close();
  return { ...data, errors: errs };
}

const report: string[] = [];
for (const [label, srcPath, clonePath] of ROUTES) {
  const src = await analyze("https://modfii.com", srcPath);
  const cln = await analyze(process.env.CLONE_BASE ?? "https://modfii.jesspete.shop", clonePath);
  results[label] = { src, cln };
  // screenshots
  const sctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const spage = await sctx.newPage();
  await spage.goto(`https://modfii.com${srcPath}`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await spage.waitForTimeout(1200);
  await spage.screenshot({ path: `${OUT}/${label}-source.png`, fullPage: false });
  await spage.screenshot({ path: `${OUT}/${label}-source-full.png`, fullPage: true });
  await sctx.close();
  const cctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const cpage = await cctx.newPage();
  await cpage.goto(`${(process.env.CLONE_BASE ?? "https://modfii.jesspete.shop")}${clonePath}`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => {});
  await cpage.waitForTimeout(1200);
  await cpage.screenshot({ path: `${OUT}/${label}-clone.png`, fullPage: false });
  await cpage.screenshot({ path: `${OUT}/${label}-clone-full.png`, fullPage: true });
  await cctx.close();

  report.push(`== ${label} ==`);
  report.push(`  src H1: ${src.h1 ? `"${src.h1.text}" ${src.h1.size} ${src.h1.color}` : "none"} | clone H1: ${cln.h1 ? `"${cln.h1.text}" ${cln.h1.size} ${cln.h1.color}` : "none"}`);
  report.push(`  src hero: ${src.hero ? `${src.hero.height} bg=${src.hero.bg} img=${src.hero.img?.src ?? "-"}(${src.hero.img?.opacity ?? "-"}) eyebrow="${src.hero.eyebrow ?? ""}"` : "none"}`);
  report.push(`  cln hero: ${cln.hero ? `${cln.hero.height} bg=${cln.hero.bg} img=${cln.hero.img?.src ?? "-"}(${cln.hero.img?.opacity ?? "-"}) eyebrow="${cln.hero.eyebrow ?? ""}"` : "none"}`);
  report.push(`  pageHeight: src=${src.pageHeight} clone=${cln.pageHeight} | title src="${src.title}" clone="${cln.title}"`);
  if (cln.errors.length) report.push(`  CLONE JS ERRORS: ${cln.errors.slice(0, 2).join(" | ")}`);
  report.push("");
}

writeFileSync(`${OUT}/results.json`, JSON.stringify(results, null, 2));
writeFileSync(`${OUT}/report.txt`, report.join("\n"));
console.log(report.join("\n"));
await browser.close();
