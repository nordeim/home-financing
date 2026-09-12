/**
 * Focused section diff — wordmark strip, testimonials, FAQ, footer, header
 * on source vs clone. Run: node --experimental-strip-types scripts/section-diff.mts
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";

const OUT = "/home/z/my-project/audit/sections";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function analyze(base: string, tag: string) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const out: Record<string, unknown> = {};

    // Header internals
    const header = document.querySelector("header");
    if (header) {
      const cs = getComputedStyle(header);
      const inner = header.firstElementChild;
      out.header = {
        classes: header.className?.toString?.().slice(0, 300),
        height: cs.height,
        paddingY: cs.padding,
        bg: cs.backgroundColor,
        blur: cs.backdropFilter,
        border: cs.borderBottom,
        innerHeight: inner ? getComputedStyle(inner).height : null,
        innerPadding: inner ? getComputedStyle(inner).padding : null,
        ctaText: [...header.querySelectorAll("a, button")].map((b) => b.textContent?.trim()).slice(0, 10),
      };
    }

    // Wordmark strip — all imgs in the section containing "Trusted by buyers"
    const strip = [...document.querySelectorAll("section")].find((s) => /trusted by buyers/i.test(s.textContent || ""));
    if (strip) {
      out.strip = {
        classes: strip.className?.toString?.().slice(0, 200),
        imgs: [...strip.querySelectorAll("img")].map((i) => ({ src: i.src.split("/").pop(), w: i.clientWidth, h: i.clientHeight, filter: getComputedStyle(i).filter, opacity: getComputedStyle(i).opacity })),
        eyebrow: strip.querySelector("p, .text-sm, [class*=uppercase]")?.textContent?.trim().slice(0, 60),
        eyebrowClasses: strip.querySelector("p")?.className?.toString?.().slice(0, 150),
      };
    }

    // Testimonials — avatars vs initials
    const testi = [...document.querySelectorAll("section")].find((s) => /trusted by 2,000/i.test(s.textContent || ""));
    if (testi) {
      const cards = [...testi.querySelectorAll("article, [class*=card], li")].slice(0, 6);
      out.testimonials = {
        classes: testi.className?.toString?.().slice(0, 200),
        imgs: [...testi.querySelectorAll("img")].map((i) => i.src.split("/").pop()),
        cardCount: cards.length,
        firstCardHTML: cards[0]?.outerHTML?.slice(0, 700),
        starIcons: [...testi.querySelectorAll("svg")].length,
        savingsLedger: /average savings|saved/i.test(testi.textContent || ""),
      };
    }

    // FAQ structure
    const faq = [...document.querySelectorAll("section")].find((s) => /questions\? we'?ve got answers/i.test(s.textContent || ""));
    if (faq) {
      const items = [...faq.querySelectorAll("details, [data-state], [class*=accordion] > div, button")].slice(0, 14);
      out.faq = {
        classes: faq.className?.toString?.().slice(0, 200),
        itemCount: faq.querySelectorAll("details").length,
        questionTags: [...faq.querySelectorAll("h3, h4, button, summary, [class*=question], [class*=trigger]")].slice(0, 8).map((q) => q.tagName + ":" + q.className?.toString?.().slice(0, 60)),
        firstItemHTML: faq.querySelector("details, [class*=accordion] > div")?.outerHTML?.slice(0, 500),
      };
    }

    // Footer full structure
    const footer = document.querySelector("footer");
    if (footer) {
      const cols = [...footer.querySelectorAll("nav, div > div")].filter((d) => d.querySelector("a"));
      out.footer = {
        classes: footer.className?.toString?.().slice(0, 250),
        topHTML: footer.innerHTML.slice(0, 1600),
        socialIcons: [...footer.querySelectorAll("svg")].length,
        socialAriaLabels: [...footer.querySelectorAll("a[aria-label]")].map((a) => a.getAttribute("aria-label")),
      };
    }
    return out;
  });
  await ctx.close();
  return { tag, data };
}

const source = await analyze("https://modfii.com", "source");
const clone = await analyze(process.env.CLONE_BASE ?? "https://modfii.jesspete.shop", "clone");
writeFileSync(`${OUT}/source.json`, JSON.stringify(source, null, 2));
writeFileSync(`${OUT}/clone.json`, JSON.stringify(clone, null, 2));
console.log("saved. inspect the JSON files.");
await browser.close();
