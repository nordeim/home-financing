import { describe, expect, it } from "vitest";
import { articles } from "@/lib/catalog";
import { Markdown } from "@/lib/markdown";
import { renderToString } from "react-dom/server";

/**
 * Regression tests for the 2026-09-11 production OOM incident.
 *
 * `Markdown` had no branch for `#### ` (H4+) headings, so such a line fell
 * through to the paragraph block, whose inner loop breaks on any line
 * starting with "#" — without consuming it. The outer loop then re-examined
 * the same line forever, allocating React elements until the Node heap
 * (2 GB) was exhausted and the whole next-server process died
 * (Cloudflare 502 on the live deployment).
 */

function render(content: string): string {
  return renderToString(Markdown({ content }));
}

describe("Markdown heading levels", () => {
  it("renders #### as an h4 and terminates", () => {
    const html = render("#### Construction-Only Loans");
    expect(html).toContain("<h4");
    expect(html).toContain("Construction-Only Loans");
  });

  it("renders ##### and deeper hashes without hanging", () => {
    const html = render("##### Deep Heading");
    expect(html).toContain("Deep Heading");
  });

  it("renders every heading level h1-h4", () => {
    const html = render("# A\n\n## B\n\n### C\n\n#### D");
    expect(html).toContain("<h1");
    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).toContain("<h4");
  });
});

describe("Markdown loop safety", () => {
  it("always consumes the line: any single-line input terminates", () => {
    // Inputs that previously triggered the non-consuming break in the
    // paragraph branch must terminate and emit at least one block.
    for (const line of ["#### X", "##### X", "###### X", "#no-space", "####hashtag"]) {
      const html = render(line);
      expect(html.length).toBeGreaterThan(0);
    }
  });
});

describe("Markdown full corpus", () => {
  it("renders every seeded article without hanging", () => {
    expect(articles.length).toBeGreaterThan(0);
    for (const article of articles) {
      const html = render(article.content);
      expect(html.length).toBeGreaterThan(0);
    }
  });

  it("renders the two articles that killed production", () => {
    const slugs = [
      "construction-loans-vs-traditional-mortgages-prefab",
      "inside-prefab-home-closing",
    ];
    for (const slug of slugs) {
      const article = articles.find((a) => a.slug === slug);
      expect(article, `article ${slug} must exist in the corpus`).toBeTruthy();
      expect(render(article!.content)).toContain("h4");
    }
  });
});

describe("Markdown link href allow-list (pass-6 A-02)", () => {
  it("renders http, https, mailto, and relative hrefs as anchors", () => {
    const html = render("See [site](https://example.com/a) and [rel](/guide) and [mail](mailto:x@example.com).");
    expect(html).toContain('href="https://example.com/a"');
    expect(html).toContain('href="/guide"');
    expect(html).toContain('href="mailto:x@example.com"');
  });

  it("strips javascript: and data: hrefs down to plain text", () => {
    const html = render("Click [here](javascript:alert(1)) or [that](data:text/html,hi).");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("data:text/html");
    // label text survives, rendered as plain text (escaped)
    expect(html).toContain("here");
    expect(html).toContain("that");
  });
});
