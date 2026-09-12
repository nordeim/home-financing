/**
 * Clone-vs-source comparison — captures the same recon data (headings, nav,
 * computed styles, screenshots) from the deployed clone, then diffs it
 * against the saved source data from source-recon.mts.
 * Run: node --experimental-strip-types scripts/clone-compare.mts
 */
import { chromium } from "playwright";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";

const BASE = process.env.CLONE_BASE ?? "https://modfii.jesspete.shop";
const SRC = "/home/z/my-project/audit/source";
const OUT = "/home/z/my-project/audit/clone";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const consoleErrors: string[] = [];
page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
page.on("pageerror", (e) => consoleErrors.push(String(e)));

await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60_000 });
await page.waitForTimeout(1500);

const links = await page.evaluate(() => {
  const seen = new Set<string>();
  for (const a of document.querySelectorAll("a[href]")) {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|javascript)/i.test(href)) continue;
    seen.add(href);
  }
  return [...seen].sort();
});
writeFileSync(`${OUT}/links.txt`, links.join("\n"));

const headings = await page.evaluate(() =>
  [...document.querySelectorAll("h1, h2")].map((h) => `${h.tagName}: ${h.textContent?.trim().slice(0, 90)}`),
);
writeFileSync(`${OUT}/headings.txt`, headings.join("\n"));

const nav = await page.evaluate(() => {
  const nav = document.querySelector("header nav") ?? document.querySelector("header");
  if (!nav) return { text: "NO HEADER NAV", items: [] };
  const items = [...nav.querySelectorAll("a, button")].map((el) => el.textContent?.trim() || "");
  return { text: nav.textContent?.slice(0, 400) ?? "", items: items.filter(Boolean) };
});
writeFileSync(`${OUT}/nav.json`, JSON.stringify(nav, null, 2));

const styles = await page.evaluate(() => {
  const pick = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      classes: el.className?.toString?.().slice(0, 220),
      background: cs.backgroundColor,
      backgroundImage: cs.backgroundImage.slice(0, 120),
      color: cs.color,
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontFamily: cs.fontFamily.slice(0, 80),
      backdropFilter: cs.backdropFilter,
      padding: cs.padding,
      borderRadius: cs.borderRadius,
      boxShadow: cs.boxShadow.slice(0, 120),
      height: cs.height,
    };
  };
  const header = document.querySelector("header");
  const h1 = document.querySelector("h1");
  const firstSection = document.querySelector("main section, section");
  const cta = [...document.querySelectorAll("a, button")].find((el) => /get started/i.test(el.textContent || ""));
  const heroImg = document.querySelector("section img, header img, main img");
  return {
    header: pick(header),
    h1: pick(h1),
    firstSection: pick(firstSection),
    cta: pick(cta ?? null),
    heroImg: heroImg ? { src: heroImg.src, alt: heroImg.getAttribute("alt") } : null,
    body: {
      font: getComputedStyle(document.body).fontFamily,
      bg: getComputedStyle(document.body).backgroundColor,
      color: getComputedStyle(document.body).color,
    },
  };
});
writeFileSync(`${OUT}/styles.json`, JSON.stringify(styles, null, 2));

await page.screenshot({ path: `${OUT}/home-full.png`, fullPage: true });
await page.screenshot({ path: `${OUT}/home-fold.png`, fullPage: false });

const footer = await page.evaluate(() => document.querySelector("footer")?.innerText?.slice(0, 1200) ?? "NO FOOTER");
writeFileSync(`${OUT}/footer.txt`, footer);

// ---- diff report ----
const srcHeadings = readFileSync(`${SRC}/headings.txt`, "utf8").split("\n").filter(Boolean);
const cloneHeadings = readFileSync(`${OUT}/headings.txt`, "utf8").split("\n").filter(Boolean);
const srcLinks = new Set(readFileSync(`${SRC}/links.txt`, "utf8").split("\n").filter((l) => l.startsWith("/")));
const cloneLinks = new Set(links.filter((l) => l.startsWith("/")));
const srcNav = JSON.parse(readFileSync(`${SRC}/nav.json`, "utf8"));
const srcStyles = JSON.parse(readFileSync(`${SRC}/styles.json`, "utf8"));

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
const srcHSet = new Map(srcHeadings.map((h) => [norm(h.split(": ").slice(1).join(": ")), h]));
const cloneHSet = new Set(cloneHeadings.map((h) => norm(h.split(": ").slice(1).join(": "))));

const report = [];
report.push("== HEADING PARITY (source → clone) ==");
for (const [k, orig] of srcHSet) {
  const ok = cloneHSet.has(k);
  const near = [...cloneHSet].find((c) => c.startsWith(k.slice(0, 18)) || k.startsWith(c.slice(0, 18)));
  report.push(`${ok ? "OK  " : near ? "NEAR" : "MISS"} ${orig.slice(0, 80)}${!ok && near ? `  → clone has: ${near.slice(0, 60)}` : ""}`);
}
report.push("");
report.push("== CLONE-ONLY HEADINGS ==");
for (const h of cloneHeadings) {
  const k = norm(h.split(": ").slice(1).join(": "));
  if (!srcHSet.has(k)) report.push(`EXTRA ${h.slice(0, 80)}`);
}
report.push("");
report.push("== NAV ==");
report.push(`source: ${srcNav.items.join(" | ")}`);
report.push(`clone : ${nav.items.join(" | ")}`);
report.push("");
report.push("== LINKS missing from clone ==");
for (const l of srcLinks) if (!cloneLinks.has(l) && !cloneLinks.has(l.replace(/^\/compare\/fha-vs-conventional$/, "/compare/fha-vs-conventional-prefab"))) report.push(`MISS ${l}`);
report.push("");
report.push("== STYLE DIFFS (source vs clone) ==");
for (const key of ["header", "h1", "cta", "body"]) {
  const s = srcStyles[key];
  const c = styles[key];
  if (!s || !c) { report.push(`${key}: MISSING on ${!s ? "source" : "clone"}`); continue; }
  for (const prop of ["background", "color", "fontSize", "fontWeight", "fontFamily", "backdropFilter", "borderRadius", "height"]) {
    const sv = String(s[prop] ?? ""); const cv = String(c[prop] ?? "");
    if (sv !== cv) report.push(`${key}.${prop}: src="${sv.slice(0, 70)}" clone="${cv.slice(0, 70)}"`);
  }
}
report.push("");
report.push(`console errors on clone: ${consoleErrors.length} ${consoleErrors.slice(0, 3).join(" | ")}`);

writeFileSync(`${OUT}/diff-report.txt`, report.join("\n"));
console.log(report.join("\n"));
await browser.close();
