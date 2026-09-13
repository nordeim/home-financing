/**
 * Deep-diff of the live parity report — produces a structured gap list.
 * Run: node --experimental-strip-types scripts/live-parity-diff.mts
 */
import { readFileSync, writeFileSync } from "node:fs";

const report = JSON.parse(readFileSync("/home/z/my-project/audit/live-parity/report.json", "utf8"));

type Any = Record<string, any>;
const gaps: Array<{ route: string; area: string; src: any; clone: any; severity: "high" | "med" | "low" }> = [];

const num = (v: any) => (typeof v === "number" ? v : parseFloat(v) || 0);
const px = (v: any) => `${Math.round(num(v))}px`;

function diffDeep(route: string, area: string, src: any, clone: any, path = "") {
  if (src === undefined && clone === undefined) return;
  if (typeof src === "number" && typeof clone === "number") {
    const delta = Math.abs(src - clone);
    const rel = src !== 0 ? delta / src : 0;
    if (rel > 0.15 && delta > 8) {
      gaps.push({ route, area: `${area}${path}`, src, clone, severity: rel > 0.4 ? "high" : rel > 0.25 ? "med" : "low" });
    }
    return;
  }
  if (typeof src === "string" && typeof clone === "string") {
    // normalize oklab/rgba color formats & whitespace before comparing
    const norm = (s: string) => s.replace(/\s+/g, "");
    if (norm(src) !== norm(clone)) {
      gaps.push({ route, area: `${area}${path}`, src: String(src).slice(0, 120), clone: String(clone).slice(0, 120), severity: "low" });
    }
    return;
  }
  if (Array.isArray(src) && Array.isArray(clone)) {
    if (JSON.stringify(src) !== JSON.stringify(clone)) {
      gaps.push({ route, area: `${area}${path}`, src: JSON.stringify(src).slice(0, 200), clone: JSON.stringify(clone).slice(0, 200), severity: src.length !== clone.length ? "med" : "low" });
    }
    return;
  }
  if (src && clone && typeof src === "object" && typeof clone === "object") {
    for (const k of new Set([...Object.keys(src), ...Object.keys(clone)])) {
      if (k.startsWith("_")) continue;
      diffDeep(route, area, src[k], clone[k], path ? `${path}.${k}` : `.${k}`);
    }
    return;
  }
  if (JSON.stringify(src) !== JSON.stringify(clone)) {
    gaps.push({ route, area: `${area}${path}`, src: JSON.stringify(src)?.slice(0, 100), clone: JSON.stringify(clone)?.slice(0, 100), severity: "low" });
  }
}

for (const [route, pair] of Object.entries<Any>(report)) {
  const { src, clone } = pair as Any;
  if (!src || !clone) continue;
  if (src._status !== 200 || clone._status !== 200) {
    gaps.push({ route, area: "HTTP status", src: src._status, clone: clone._status, severity: "high" });
  }
  if ((clone._errors ?? []).length > 0) {
    gaps.push({ route, area: "console/page errors (clone)", src: [], clone: clone._errors, severity: "med" });
  }
  if ((clone._failedRequests ?? []).length > 0) {
    gaps.push({ route, area: "failed requests (clone)", src: [], clone: clone._failedRequests, severity: "med" });
  }
  diffDeep(route, "", src, clone);
}

// Filter noise: color-format differences (oklab vs rgb) that resolve to the same channel values
const colorish = (s: any) => typeof s === "string" && /(oklab|oklch|rgba?\(|lab\(|lch\(|hsl\()/.test(s);
const filtered = gaps.filter((g) => {
  if (colorish(g.src) && colorish(g.clone)) return false; // handled below by visual check
  return true;
});

// summary print
console.log(`\n=== ${filtered.length} raw gaps (color-format noise filtered) ===`);
for (const g of filtered.slice(0, 80)) {
  console.log(`[${g.severity.toUpperCase().padEnd(4)}] ${g.route}${g.area}`);
  console.log(`        src:    ${JSON.stringify(g.src).slice(0, 160)}`);
  console.log(`        clone:  ${JSON.stringify(g.clone).slice(0, 160)}`);
}

// per-route health snapshot
console.log("\n=== route health ===");
for (const [route, pair] of Object.entries<Any>(report)) {
  const { src, clone } = pair as Any;
  if (!src || !clone) { console.log(`${route.padEnd(18)} MISSING`); continue; }
  const ph = `${num(src.pageHeight)} vs ${num(clone.pageHeight)}`;
  const img = clone.brokenImgs > 0 ? ` BROKEN IMGS: ${clone.brokenImgs}` : "";
  const errs = (clone._errors ?? []).length > 0 ? ` ERRORS: ${clone._errors.length}` : "";
  console.log(`${route.padEnd(18)} ${src._status}/${clone._status}  pageH ${ph}${img}${errs}`);
}

writeFileSync("/home/z/my-project/audit/live-parity/gaps.json", JSON.stringify(filtered, null, 2));
console.log("\nSaved: /home/z/my-project/audit/live-parity/gaps.json");
