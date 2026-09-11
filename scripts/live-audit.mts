/**
 * Live-site E2E audit — https://modfii.jesspete.shop/
 * Validates the deployed clone: routes, API health, console errors, 404s,
 * broken images, and captures screenshots for visual parity review.
 *
 * Run: node --experimental-strip-types scripts/live-audit.mts
 * (or npx tsx scripts/live-audit.mts)
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.AUDIT_BASE ?? "https://modfii.jesspete.shop";
const OUT = "/home/z/my-project/audit/live-site";
mkdirSync(OUT, { recursive: true });

type Row = { check: string; status: "PASS" | "FAIL" | "WARN"; detail: string };

const rows: Row[] = [];
function record(check: string, status: Row["status"], detail: string) {
  rows.push({ check, status, detail });
  console.log(`[${status}] ${check} — ${detail}`);
}

const PAGES = [
  "/",
  "/get-started",
  "/calculator",
  "/learn",
  "/modular-home-financing",
  "/modular-home-financing/loan-options",
  "/modular-home-financing/loan-options/fha",
  "/modular-home-financing/manufacturers",
  "/modular-home-financing/states",
  "/modular-home-financing/states/texas",
  "/adu-financing",
  "/tiny-home-financing",
  "/construction-loans",
  "/compare/fha-vs-conventional-prefab",
  "/compare/prefab-vs-site-built-costs",
  "/glossary",
  "/resources",
  "/about",
  "/privacy-policy",
  "/terms",
  "/editorial-policy",
  "/corrections",
  "/sitemap.xml",
  "/robots.txt",
  "/api/health",
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleErrors: string[] = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

// 1) Route sweep
for (const route of PAGES) {
  try {
    const resp = await page.goto(`${BASE}${route}`, { timeout: 30_000, waitUntil: "domcontentloaded" });
    const status = resp?.status() ?? 0;
    if (route === "/api/health") {
      const body: unknown = await page.evaluate(async () => {
        try {
          return await fetch("/api/health").then((r) => r.json());
        } catch {
          return null;
        }
      });
      record(
        "health endpoint",
        !!body && typeof body === "object" && "ok" in body && (body as { ok: boolean }).ok === true
          ? "PASS"
          : "FAIL",
        JSON.stringify(body),
      );
    } else if (status === 200) {
      record(`route ${route}`, "PASS", `HTTP ${status}`);
    } else {
      record(`route ${route}`, "FAIL", `HTTP ${status}`);
    }
  } catch (err) {
    record(`route ${route}`, "FAIL", String(err).slice(0, 140));
  }
}

// 2) Deep checks on key pages
const keyPages: Array<[string, string, RegExp[]]> = [
  ["home", "/", [/ModFii/i, /Get Started/i, /prefab/i]],
  ["get-started", "/get-started", [/credit/i, /zip/i]],
  ["calculator", "/calculator", [/calculator/i, /down payment/i]],
  ["learn", "/learn", [/financing|guide|article/i]],
];

for (const [name, route, expects] of keyPages) {
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => {});
  await page.waitForTimeout(600);
  const html = await page.content();
  for (const re of expects) {
    record(
      `content ${name} /${re.source.slice(0, 24)}/`,
      re.test(html) ? "PASS" : "FAIL",
      re.test(html) ? "found" : "MISSING in DOM",
    );
  }
  // broken images
  const broken: unknown = await page.evaluate(() =>
    [...document.querySelectorAll("img")]
      .filter((img) => img.complete && img.naturalWidth === 0)
      .map((img) => img.getAttribute("src")),
  );
  const brokenList = Array.isArray(broken) ? (broken as string[]) : [];
  record(
    `images ${name}`,
    brokenList.length === 0 ? "PASS" : "FAIL",
    brokenList.length ? brokenList.join(", ") : "no broken img",
  );
  // screenshot (above the fold)
  await page.screenshot({ path: `${OUT}/${name.replace(/\W+/g, "-")}.png`, fullPage: false });
}

// 3) Calculator interaction — press Calculate and look for a breakdown
await page.goto(`${BASE}/calculator`, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => {});
const calcButtons = page.getByRole("button", { name: /calculate|estimate|see payment/i });
const btnCount = await calcButtons.count();
if (btnCount > 0) {
  await calcButtons
    .first()
    .click()
    .catch((e: unknown) => record("calculator interaction", "WARN", `click failed: ${String(e).slice(0, 80)}`));
  await page.waitForTimeout(1200);
  const body = await page.content();
  const hasBreakdown = /principal|insurance|tax/i.test(body);
  record(
    "calculator interaction",
    hasBreakdown ? "PASS" : "WARN",
    hasBreakdown ? "breakdown rendered" : "no breakdown after click",
  );
} else {
  record("calculator interaction", "WARN", "no calculate button found");
}
await page.screenshot({ path: `${OUT}/calculator-after.png`, fullPage: false });

// 4) Funnel UI — count form fields (must not hard-crash)
await page.goto(`${BASE}/get-started`, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => {});
const inputs = await page.locator("input, select").count();
record("get-started form fields", inputs >= 6 ? "PASS" : "WARN", `${inputs} input/select elements`);

// 5) Console error sweep across the whole session
const realErrors = consoleErrors.filter(
  (e) => !/favicon|net::ERR_ABORTED|googleapis|gstatic|cloudflareinsights|beacon/i.test(e),
);
record(
  "console errors (site-wide)",
  realErrors.length === 0 ? "PASS" : "WARN",
  realErrors.slice(0, 5).join(" | ").slice(0, 300) || "none",
);

// 6) Mobile viewport spot check
const mctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const mpage = await mctx.newPage();
await mpage.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => {});
const hamburger = mpage.locator('[aria-label*="menu" i], button:has(svg.lucide-menu), header button').first();
const hasNav = (await hamburger.count()) > 0;
record("mobile nav affordance", hasNav ? "PASS" : "WARN", hasNav ? "header button found" : "no header button detected");
await mpage.screenshot({ path: `${OUT}/mobile-home.png`, fullPage: false });
await mpage.goto(`${BASE}/get-started`, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => {});
await mpage.screenshot({ path: `${OUT}/mobile-get-started.png`, fullPage: false });

await browser.close();

writeFileSync(`${OUT}/report.json`, JSON.stringify(rows, null, 2));
const pass = rows.filter((r) => r.status === "PASS").length;
const fail = rows.filter((r) => r.status === "FAIL").length;
const warn = rows.filter((r) => r.status === "WARN").length;
console.log(`\n=== LIVE AUDIT: ${pass} PASS / ${fail} FAIL / ${warn} WARN (${rows.length} checks) ===`);
if (fail > 0) {
  process.exitCode = 1;
}
