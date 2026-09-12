/**
 * Deep home diff — extracts full heading trees, hero internals, and key
 * section chrome from source and clone for a precise parity gap list.
 * Run: node --experimental-strip-types scripts/home-deep-diff.mts
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "/home/z/my-project/audit/deep";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function analyze(base: string, tag: string) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(2000);

  const data = await page.evaluate(() => {
    const out: Record<string, unknown> = {};

    // full heading tree h1-h4
    out.headings = [...document.querySelectorAll("h1, h2, h3, h4")].map((h) => ({
      level: h.tagName,
      text: h.textContent?.trim().slice(0, 100),
      size: getComputedStyle(h).fontSize,
      weight: getComputedStyle(h).fontWeight,
      color: getComputedStyle(h).color,
    }));

    // hero section: first section with a big heading or the element that wraps the h1/h2 hero
    const heroCandidates = [...document.querySelectorAll("section")].slice(0, 3);
    out.heroes = heroCandidates.map((s) => {
      const cs = getComputedStyle(s);
      const heading = s.querySelector("h1, h2");
      const bg = s.querySelector("img");
      return {
        classes: s.className?.toString?.().slice(0, 250),
        minHeight: cs.minHeight,
        height: cs.height,
        padding: cs.padding,
        bg: cs.backgroundColor,
        bgImage: cs.backgroundImage.slice(0, 100),
        heading: heading ? { level: heading.tagName, text: heading.textContent?.trim().slice(0, 70), size: getComputedStyle(heading).fontSize, color: getComputedStyle(heading).color } : null,
        img: bg ? { src: bg.src.slice(-60), size: `${bg.clientWidth}x${bg.clientHeight}`, opacity: getComputedStyle(bg).opacity } : null,
        text: s.textContent?.trim().slice(0, 300),
      };
    });

    // buttons: all visible buttons/CTAs in first 2 sections + header
    const btns = [...document.querySelectorAll("header a, header button, section a, section button")]
      .filter((el) => /get started|see your options|calculate|get pre|learn more|read more|explore|start/i.test(el.textContent || ""))
      .slice(0, 10);
    out.buttons = btns.map((b) => {
      const cs = getComputedStyle(b);
      return {
        text: b.textContent?.trim().slice(0, 40),
        bg: cs.backgroundColor,
        color: cs.color,
        radius: cs.borderRadius,
        padding: cs.padding,
        weight: cs.fontWeight,
        fontSize: cs.fontSize,
        border: cs.border,
        classes: b.className?.toString?.().slice(0, 150),
      };
    });

    // FAQ accordions
    out.faqCount = document.querySelectorAll("details, [data-state]").length;

    // wordmark strip images
    out.logos = [...document.querySelectorAll("img")]
      .filter((i) => /wordmark|brand|logo|skyline|dvele|plant|dutch|excel/i.test(i.src))
      .map((i) => ({ src: i.src.slice(-50), h: i.clientHeight, w: i.clientWidth, opacity: getComputedStyle(i).opacity }));

    // testimonials avatar
    out.avatars = [...document.querySelectorAll("img")].filter((i) => /avatar|sarah|marcus|james|thornton|chen|rodriguez/i.test(i.src)).map((i) => i.src.slice(-50));

    // footer structure
    const footer = document.querySelector("footer");
    out.footerColumns = footer
      ? [...footer.querySelectorAll("h3, h4, [class*=col] h3, [class*=heading]")].slice(0, 12).map((e) => e.textContent?.trim().slice(0, 30))
      : [];

    // overall page height + section count
    out.pageHeight = document.body.scrollHeight;
    out.sectionCount = document.querySelectorAll("section").length;

    // testimonial section shape
    out.testimonials = [...document.querySelectorAll("section")]
      .find((s) => /trusted by/i.test(s.textContent || ""))?.className?.toString?.().slice(0, 200) ?? null;

    return out;
  });

  await page.screenshot({ path: `${OUT}/${tag}-home-full.png`, fullPage: true });
  await page.screenshot({ path: `${OUT}/${tag}-home-fold.png` });
  await ctx.close();
  return data;
}

const source = await analyze("https://modfii.com", "source");
const clone = await analyze(process.env.CLONE_BASE ?? "https://modfii.jesspete.shop", "clone");

writeFileSync(`${OUT}/source.json`, JSON.stringify(source, null, 2));
writeFileSync(`${OUT}/clone.json`, JSON.stringify(clone, null, 2));

const lines: string[] = [];
lines.push(`pageHeight: src=${source.pageHeight} clone=${clone.pageHeight}`);
lines.push(`sectionCount: src=${source.sectionCount} clone=${clone.sectionCount}`);
lines.push("");
lines.push("== SOURCE headings ==");
for (const h of source.headings) lines.push(`${h.level} [${h.size}/${h.weight}] ${h.text}`);
lines.push("");
lines.push("== CLONE headings ==");
for (const h of clone.headings) lines.push(`${h.level} [${h.size}/${h.weight}] ${h.text}`);
lines.push("");
lines.push("== SOURCE hero candidates ==");
for (const h of source.heroes) lines.push(JSON.stringify(h).slice(0, 500));
lines.push("");
lines.push("== CLONE hero candidates ==");
for (const h of clone.heroes) lines.push(JSON.stringify(h).slice(0, 500));
lines.push("");
lines.push("== SOURCE buttons ==");
for (const b of source.buttons) lines.push(JSON.stringify(b).slice(0, 300));
lines.push("");
lines.push("== CLONE buttons ==");
for (const b of clone.buttons) lines.push(JSON.stringify(b).slice(0, 300));
lines.push("");
lines.push(`SOURCE logos: ${JSON.stringify(source.logos).slice(0, 400)}`);
lines.push(`CLONE logos: ${JSON.stringify(clone.logos).slice(0, 400)}`);
lines.push(`SOURCE avatars: ${JSON.stringify(source.avatars)}`);
lines.push(`CLONE avatars: ${JSON.stringify(clone.avatars)}`);
lines.push(`SOURCE footer cols: ${JSON.stringify(source.footerColumns)}`);
lines.push(`CLONE footer cols: ${JSON.stringify(clone.footerColumns)}`);

writeFileSync(`${OUT}/report.txt`, lines.join("\n"));
console.log(lines.join("\n"));
await browser.close();
