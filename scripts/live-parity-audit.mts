/**
 * Live parity audit — compares the deployed clone (modfii.jesspete.shop)
 * against the source site (modfii.com) using computed styles as ground truth
 * (clone-app-pat-pro methodology: CSSOM values beat screenshots; screenshots
 * are captured as visual reference only).
 *
 * Run: npx tsx scripts/live-parity-audit.mts
 * Output: /home/z/my-project/audit/live-parity/report.json + screenshots
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const SRC = process.env.SRC_BASE ?? "https://modfii.com";
const CLONE = process.env.CLONE_BASE ?? "https://modfii.jesspete.shop";
const OUT = "/home/z/my-project/audit/live-parity";
mkdirSync(OUT, { recursive: true });
mkdirSync(`${OUT}/shots-src`, { recursive: true });
mkdirSync(`${OUT}/shots-clone`, { recursive: true });

// [label, sourcePath, clonePath]
const ROUTES: Array<[string, string, string]> = [
  ["home", "/", "/"],
  ["get-started", "/get-started", "/get-started"],
  ["calculator", "/calculator", "/calculator"],
  ["hub", "/modular-home-financing", "/modular-home-financing"],
  ["fha", "/modular-home-financing/loan-options/fha", "/modular-home-financing/loan-options/fha"],
  ["learn", "/learn", "/learn"],
  ["glossary", "/glossary", "/glossary"],
  ["adu", "/adu-financing", "/adu-financing"],
  ["tiny", "/tiny-home-financing", "/tiny-home-financing"],
  ["construction", "/construction-loans", "/construction-loans"],
  ["about", "/about", "/about"],
  ["resources", "/resources", "/resources"],
  ["manufacturers", "/modular-home-financing/manufacturers", "/modular-home-financing/manufacturers"],
  ["mortgage", "/mortgage", "/mortgage"],
  ["financing", "/financing", "/financing"],
];

const browser = await chromium.launch();

type PageData = Record<string, unknown>;

async function analyze(base: string, path: string, label: string, shotDir: string, mobile: boolean): Promise<PageData> {
  const vp = mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await browser.newContext({ viewport: vp });
  const page = await ctx.newPage();
  const errs: string[] = [];
  const failedRequests: string[] = [];
  page.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 120)); });
  page.on("requestfailed", (r) => failedRequests.push(`${r.url().slice(0, 90)} ${r.failure()?.errorText ?? ""}`));

  const resp = await page.goto(`${base}${path}`, { waitUntil: "networkidle", timeout: 60_000 }).catch(() => null);
  await page.waitForTimeout(1800); // SPA hydration / reveal settle
  const status = resp?.status() ?? 0;

  const data = await page.evaluate(() => {
    const out: Record<string, unknown> = {};
    const px = (v: string) => parseFloat(v) || 0;
    const pick = (el: Element | null) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        height: Math.round(r.height),
        width: Math.round(r.width),
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        fontFamily: (cs.fontFamily.split(",")[0] || "").trim(),
        color: cs.color,
        background: cs.backgroundColor,
        borderRadius: cs.borderRadius,
        padding: cs.padding,
        letterSpacing: cs.letterSpacing,
        lineHeight: cs.lineHeight,
      };
    };

    out.docTitle = document.title.slice(0, 110);
    out.pageHeight = Math.round(document.documentElement.scrollHeight);
    out.bodyBg = getComputedStyle(document.body).backgroundColor;

    // Header bar
    const header = document.querySelector("header");
    if (header) {
      const cs = getComputedStyle(header);
      const inner = header.firstElementChild;
      const innerCs = inner ? getComputedStyle(inner) : null;
      out.header = {
        pos: cs.position,
        height: Math.round(header.getBoundingClientRect().height),
        bg: cs.backgroundColor,
        backdropFilter: cs.backdropFilter,
        borderBottom: cs.borderBottom,
        innerHeight: innerCs ? Math.round((inner as HTMLElement).offsetHeight) : null,
      };
      out.headerLogo = pick(header.querySelector("a, [class*=logo]"));
    }

    // Headings inventory
    out.h1 = [...document.querySelectorAll("h1")].map((h) => ({
      text: h.textContent?.trim().slice(0, 90),
      size: getComputedStyle(h).fontSize,
      weight: getComputedStyle(h).fontWeight,
      color: getComputedStyle(h).color,
    }));
    out.h1Count = document.querySelectorAll("h1").length;
    out.h2Count = document.querySelectorAll("h2").length;
    out.h3Count = document.querySelectorAll("h3").length;

    // Hero (first section with large media or first main section)
    const hero = document.querySelector("main section, section");
    if (hero) {
      const cs = getComputedStyle(hero);
      out.hero = {
        height: Math.round(hero.getBoundingClientRect().height),
        bg: cs.backgroundColor,
        bgImage: cs.backgroundImage.slice(0, 80),
        padding: cs.padding,
      };
    }

    // Primary CTA button chrome ("Get Started" / "See Your Options" / "Get Pre-Approved")
    const cta = [...document.querySelectorAll("a, button")].find((el) =>
      /get started|get pre-approved|see your options/i.test(el.textContent || ""),
    );
    if (cta) {
      const cs = getComputedStyle(cta);
      out.cta = {
        text: cta.textContent?.trim().slice(0, 40),
        bg: cs.backgroundColor,
        color: cs.color,
        radius: cs.borderRadius,
        fontWeight: cs.fontWeight,
        fontSize: cs.fontSize,
        padding: cs.padding,
        height: Math.round(cta.getBoundingClientRect().height),
      };
    }

    // Nav items
    const nav = document.querySelector("header nav") ?? document.querySelector("nav");
    out.navItems = nav
      ? [...nav.querySelectorAll("a, button")]
          .map((el) => el.textContent?.trim() || "")
          .filter((t) => t && t.length < 30)
      : [];

    // Images
    const imgs = [...document.querySelectorAll("img")];
    out.imgCount = imgs.length;
    out.brokenImgs = imgs.filter((i) => i.complete && i.naturalWidth === 0).length;

    // Footer
    const footer = document.querySelector("footer");
    if (footer) {
      const cols = [...footer.querySelectorAll("nav, ul, div")].filter(
        (c) => c.querySelectorAll("a").length >= 2 && c.children.length <= 12,
      );
      out.footer = {
        bg: getComputedStyle(footer).backgroundColor,
        height: Math.round(footer.getBoundingClientRect().height),
        linkCount: footer.querySelectorAll("a").length,
        columnCount: cols.length,
        text: footer.textContent?.replace(/\s+/g, " ").trim().slice(0, 260),
      };
    }

    // Buttons inventory (radius/font-weight chrome)
    out.buttonChrome = [...document.querySelectorAll("a[class*=button], button, [class*=btn]")]
      .filter((b) => (b.textContent || "").trim().length > 0 && b.getBoundingClientRect().height > 20)
      .slice(0, 8)
      .map((b) => {
        const cs = getComputedStyle(b);
        return {
          text: b.textContent?.trim().slice(0, 30),
          radius: cs.borderRadius,
          weight: cs.fontWeight,
          bg: cs.backgroundColor,
          color: cs.color,
        };
      });

    return out;
  }).catch((e) => ({ evalError: String(e).slice(0, 200) }));

  if (status === 200) {
    await page.screenshot({ path: `${shotDir}/${label}${mobile ? "-m" : ""}.png`, fullPage: false }).catch(() => {});
  }
  await ctx.close();
  return { ...data, _status: status, _errors: errs.slice(0, 8), _failedRequests: failedRequests.slice(0, 8) } as PageData;
}

const report: Record<string, { src?: PageData; clone?: PageData }> = {};

for (const [label, srcPath, clonePath] of ROUTES) {
  console.log(`— ${label}`);
  report[label] = {};
  report[label].src = await analyze(SRC, srcPath, label, `${OUT}/shots-src`, false);
  report[label].clone = await analyze(CLONE, clonePath, label, `${OUT}/shots-clone`, false);
}

// Mobile pass on the highest-value pages
for (const label of ["home", "get-started", "calculator", "hub"]) {
  const [l, srcPath, clonePath] = ROUTES.find((r) => r[0] === label)!;
  console.log(`— ${label} (mobile)`);
  report[`${label}-mobile`] = {};
  report[`${label}-mobile`].src = await analyze(SRC, srcPath, `${l}-m`, `${OUT}/shots-src`, true);
  report[`${label}-mobile`].clone = await analyze(CLONE, clonePath, `${l}-m`, `${OUT}/shots-clone`, true);
}

writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(`\nReport: ${OUT}/report.json`);

// Human-readable gap summary for the home page
const home = report.home;
if (home?.src && home.clone) {
  const gap = (a: unknown, b: unknown) => (JSON.stringify(a) !== JSON.stringify(b) ? "≠" : "=");
  console.log("\n=== HOME key metrics (src vs clone) ===");
  console.log(`status: ${home.src._status} / ${home.clone._status}`);
  console.log(`pageHeight: ${home.src.pageHeight} vs ${home.clone.pageHeight}`);
  console.log(`header: ${JSON.stringify(home.src.header)}`);
  console.log(`     vs ${JSON.stringify(home.clone.header)}`);
  console.log(`hero height: ${(home.src.hero as Record<string, unknown>)?.height} vs ${(home.clone.hero as Record<string, unknown>)?.height}`);
  console.log(`h1: ${JSON.stringify(home.src.h1)} vs ${JSON.stringify(home.clone.h1)}`);
  console.log(`cta: ${JSON.stringify(home.src.cta)}`);
  console.log(`    vs ${JSON.stringify(home.clone.cta)}`);
  console.log(`navItems: ${JSON.stringify(home.src.navItems)} vs ${JSON.stringify(home.clone.navItems)}`);
}

await browser.close();
