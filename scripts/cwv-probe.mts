/**
 * Core Web Vitals probe (Phase 5 of the code-review-and-audit pipeline —
 * Lighthouse crashes in this sandbox, so CWV are measured via
 * PerformanceObserver in Playwright against the local prod build).
 * Run: node --experimental-strip-types scripts/cwv-probe.mts
 */
import { chromium } from "playwright";

const BASE = process.env.CWV_BASE ?? "http://127.0.0.1:3002";
const ROUTES = ["/", "/get-started", "/calculator", "/modular-home-financing", "/learn"];

const browser = await chromium.launch();
const results: Array<Record<string, string | number>> = [];

for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${route}`, { waitUntil: "load", timeout: 30000 });
  const metrics = await page.evaluate(
    () =>
      new Promise<Record<string, number>>((resolve) => {
        const out: Record<string, number> = {};
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length) out.lcp = Math.round(entries[entries.length - 1].startTime);
          }).observe({ type: "largest-contentful-paint", buffered: true });
          new PerformanceObserver((list) => {
            let cls = 0;
            for (const e of list.getEntries()) cls += (e as LayoutShift).value;
            out.cls = Math.round(cls * 1000) / 1000;
          }).observe({ type: "layout-shift", buffered: true });
        } catch {
          /* older browsers */
        }
        setTimeout(() => resolve(out), 3000);
      }),
  );
  const nav = await page.evaluate(() => {
    const [entry] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
    return { ttfb: Math.round(entry.responseStart), domContentLoaded: Math.round(entry.domContentLoadedEventEnd), load: Math.round(entry.loadEventEnd) };
  });
  results.push({ route, lcp: metrics.lcp ?? -1, cls: metrics.cls ?? -1, ...nav });
  await ctx.close();
}

console.table(results);
await browser.close();

const summary = results.map((r) => ({
  route: r.route,
  LCP_ms: r.lcp,
  LCP_good: Number(r.lcp) <= 2500,
  CLS: r.cls,
  CLS_good: Number(r.cls) <= 0.1,
}));
console.log("\nCWV thresholds: LCP ≤ 2500ms (good), CLS ≤ 0.1 (good)");
for (const s of summary) console.log(`${s.route}: LCP ${s.LCP_ms}ms ${s.LCP_good ? "✓" : "✗"} · CLS ${s.CLS} ${s.CLS_good ? "✓" : "✗"}`);
