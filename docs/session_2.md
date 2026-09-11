AGENTS.md and README.md reviewed — both dated "last verified 2026-09-11 (post-remediation)". The git log shows prior remediation work. Now let me examine the codebase structure and read CLAUDE.md, while delegating the deep review of the two largest docs (Project_Architecture_Document.md ~95KB, home-financing_SKILL.md ~110KB) to parallel explore agents.
Both agents returned detailed alignment reports and found **real code bugs** (malformed Tailwind classes `grid-cols-inmax(...)` in page.tsx and site-footer.tsx). Now let me read CLAUDE.md myself and check the skills catalog.
CLAUDE.md fully reviewed. Now let me check the skills catalog as the user requested, to find applicable skills for the planning phase.
已确定相关技能：**tdd**、**agent-browser**、**playwright-cli**、**browser-testing-with-devtools**、**web-design-guidelines**、**frontend-design**，以及确切的 stack 参考。让我先阅读其中最适用的两个（TDD + browser automation）以指导后续计划。
Skills reviewed. Now let me establish a local verification baseline (install → lint → typecheck → test → build) per the documented pre-push gate.
Lint and typecheck pass. Now unit tests and production build.
Build passes — 43 static + 7 dynamic routes. Now let me try running the local Playwright E2E suite. First check if Docker/Postgres is available for the DB-dependent funnel test.
**Local baseline: all gates pass** (lint 0/0, typecheck ✓, unit 31/31, build ✓, E2E 26/27 — the only failure is the documented DB-dependent funnel test since no Docker/Postgres is available in this sandbox, which matches the docs' stated expectation).

Now let me review the e2e specs and then run browser-based E2E against the live site + capture screenshots for the visual comparison with modfii.com.
Both specs reviewed. Now let me write a live-site E2E probe script that checks all routes, console errors, broken assets, the funnel API, and captures screenshots of both the clone and the source site for visual comparison.
The script can't resolve modules from outside the repo. Let me symlink node_modules into the scripts dir.
Findings so far: live site mostly works (health/calculator/funnel API all 200, funnel returns 4 matches), but **several `/learn/*` sitemap URLs return 502 errors on the live deployment** and `/authors` is 404. Let me fix the script bug and re-run the source-site capture.
The first probe crashed before writing its report (source phase bug). Let me re-run both separately.
The source site serves the same page structure (same h1s) — confirming it's the reference deployment. Now re-run the full clone probe with the fixed script.
The entire site now returns 502 — either temporarily down or rate-limited by the rapid probing. Let me verify with curl after a pause.
The clone's origin server is down (Cloudflare 502 — origin unreachable). It was up during the first probe. Let me set up a background retry loop while I analyze the code defects found by the explore agents in parallel.
Confirmed the homepage hero bug: `lg:grid-cols-inmax(0,1.1fr)_minmax(320px,0.8fr)]` is malformed (missing `[`, `inmax` typo) so Tailwind generates no CSS — the hero renders single-column stacked instead of the intended two-column layout on desktop. Let me check the footer bug and the screenshots from the first probe.
**Critical finding: 5 locations** share the malformed `grid-cols-inmax(...)` class — homepage hero, get-started funnel, PageHero (affects ALL interior pages), calculator, and footer. All break their desktop two-column layouts. Let me view the screenshots captured during the first probe to see the visual impact.
Key insight: the `clone-*.png` screenshots were overwritten by 502 pages during the second run (site went down mid-first-probe at 15:30 UTC — the `/learn/*` 502s appeared first, then the whole origin died). The source screenshots are valid.

The source home shows: no glass hero card (text-left hero), real manufacturer **logo images** (DVELE/SKYLINE) vs the clone's text wordmarks. Let me start the clone locally to (a) test whether the `/learn/*` pages crash locally, and (b) take full-page screenshots for visual comparison against the source.
The local server crashed after the first request! Let me check the log — this could be the same bug that killed the live origin.
**根因找到！** Node server 因 **JavaScript 堆内存溢出 (2GB)** 而崩溃——这几乎可以肯定导致生产环境源站停机（在探针扫描期间 `/learn/*` 页面首先出现 502 错误，随后彻底崩溃）。在没有 DB 的情况下，堆在约 30 秒内从 0 增长到 2GB，且仅有约 2 次请求。让我检查一下怀疑对象：`ensure-seeded.ts`、`db/index.ts` 和健康检查路由。
这些文件看起来没问题。在生产环境中（`next start`），pool 没有被缓存到 `globalThis` 中，但模块加载时只会对它进行一次实例化——这是没问题的。崩溃显示有约 2GB 的后台分配。让我通过实验来进行二分排查：启动 server，不做任何请求，观察内存；然后一个一个地发送单个请求。
Server is idle-stable at 137MB RSS (process name is `next-server`, that's why `ps -C node` missed it). Now bisect by request.
**已隔离！** `/learn/construction-loans-vs-traditional-mortgages-prefab` **导致服务器崩溃**（请求过程中内存耗尽）——而且它是生产环境中最早出现 502 错误的 URL 之一。让我确认并检查该文章的 markdown 内容和解析器。
Markdown parser looks bounded and content is only 3KB. The problem must be in the page or guide helpers. Let me inspect them and reproduce in isolation.
Page logic looks bounded. Let me reproduce outside Next.js: render all 23 articles through the same Markdown component via react-dom/server to find the pathological one.
**Reproduced in isolation!** The 7th article OOMs the renderer. Let me identify it and find the pathological markdown pattern.
**ROOT CAUSE FOUND — production-killing bug identified:**

The article contains `#### Construction-Only Loans` — an **H4 heading**. The `Markdown` component only handles `#`/`##`/`###`. An `####` line falls through to the paragraph branch, where `current.startsWith("#")` breaks the inner loop **without consuming the line** — `i` never advances → **infinite React-element allocation loop → 2GB heap → OOM → Node process dies → Cloudflare 502**.

This exactly matches the live-site failure sequence. Let me scan the corpus for all affected content.
Found: **2 articles** with `####` headings (both would OOM the server), and 5 with tables (render as plain paragraphs — cosmetic, matches source behavior). The other live 502s were collateral (server already dead).

Let me check if the live site recovered, then capture full-page screenshots of the local clone for the visual comparison.
Live origin is still down (502). The local server is up. Let me capture **full-page** screenshots of the local clone and the source site for a thorough visual comparison.
All full-page screenshots captured. Now the side-by-side visual comparison, starting with the homepage.
Now comparing the source. Key observations so far: source has **real manufacturer logos** (DVELE/plant/rest/SKYLINE/bucht) vs clone's text wordmarks, and the source shows a **large blank area** after the wordmark strip — suggesting scroll-reveal animations (sections start invisible). Let me examine the remaining page comparisons.
get-started 页面显示出显著的 UI 差异（源页面：支持图片的 hero、卡片内 step-chip、顶部 trust chips、“Property ZIP code” + 辅助文本、sage 按钮、隐私声明、头像推荐、4 个社交媒体图标、Legal 页脚列）。但在修复网格之前，我必须验证这个损坏的类是否真的破坏了渲染 —— 本地 hero 看起来是并排的。让我检查一下计算样式。
Unexpected: the malformed classes **do produce working grid columns** (correct proportions). Let me see the actual generated CSS rule to understand why.
The layer dump swallowed the specific rule. Let me grep the built CSS file directly.
"max" is in the CSS but my regex missed it. Simpler extraction:
Those are just built-in utilities. Let me search all CSS chunks for the actual emitted rule:
**Mystery solved:** Tailwind v4's lenient bare-value parser actually **normalizes these classes to valid CSS** (`inmax(` → `minmax(`, trailing `]` stripped) — the layouts render correctly. So the "inmax" typo is a LOW-severity robustness cleanup, **not** a visual bug (and SKILL.md's "silently don't compile" claim is wrong). Let me now review the remaining page comparisons.
The calculator pages differ **massively** — the source has a sage summary card with stacked payment-breakdown bar, Loan Summary rows, PMI alert box, "How to Use" icon band, Explore Financing Options cards, FAQs, Related Resources, Popular chips, and a closing CTA band. The clone is a simple 2-column slider+result layout. Let me review the remaining pairs.
/learn hub 存在巨大差异（源码：搜索 + 筛选标签 + 精选横幅 + 图标卡片 + 嵌入式 affordability calculator + 通讯订阅 vs 克隆版：普通卡片）。让我检查剩余的配对。
The hub page gap is consistent (source = rich long-form with tables/process steps/FAQs; clone = thin 3-section guide). Let me quickly scan the remaining pairs to complete the audit.
模式已确认——源指南页面内容丰富，而克隆页面则较为单薄。现在让我验证一下源网站的滚动展示动画，检查 `/authors`，并从源 HTML 中提取文字标识图片 URL。
Major findings confirmed: **scroll-reveal animations** (opacity 0 + translateY 40px + scale 0.95 → 1), **3 wordmark logo images**, **4 footer social icons**, **source /authors = 200** (clone 404s), and **animated FAQ accordions** on source. Let me get all source-home images and the exact reveal animation CSS.
Comprehensive data collected. Source uses: 5 real logos (Dvele, Plant Prefab, Excel Homes, Skyline, Dutch Housing), Unsplash testimonial avatars, inline-style scroll reveals (`translateY(40px) scale(0.95)` + 0.3s ease), and Radix-style accordion animations. Let me check the clone's corresponding markup.
Let me quickly verify the manufacturers pair, then compile the full audit + remediation plan.
The audit is nearly complete. Let me capture the source `/authors` page (which I need to build) and then write the worklog + remediation plan.
The source `/authors` actually renders a **soft-404** (h1="404" with HTTP 200) — so the clone's hard 404 is equivalent-or-better. No fix needed there; document instead. Let me confirm the local pages render fine and write the worklog + remediation plan.
Now let me set up the detailed remediation TODO list and validate it against the codebase before executing.
Assumptions validated (vitest include is `.test.ts` — my test will avoid JSX by calling `Markdown({content})` directly; footer structure and sitemap confirmed). Starting **P0 with TDD — RED first**: write the failing regression test for the OOM bug.
The test failed at collection — let me see the full error.
Vitest globals aren't enabled — let me match the existing tests' import style.
**RED confirmed** — the worker died running the pathological input (the OOM reproduced inside vitest's tinypool). Now **GREEN**: fix `markdown.tsx` with the H4 branch + a loop-safety guarantee that every iteration consumes at least one line.
Now the loop-safety net — the paragraph branch must always consume at least one line:
**GREEN — 37/37 tests pass** (31 existing + 6 new markdown regression tests). Let me rebuild and verify the previously-crashing page now renders.
**P0 complete and verified end-to-end** — all four previously-crashing URLs now return 200 with proper `<h4>` rendering. Now P1: download the source wordmark logos and testimonial avatars.
All assets downloaded. Now let me update the homepage: wordmark strip → real logos, testimonials → avatars, plus the Reveal animation component. First, let me see the STORIES data and strip markup.
Now let me implement the homepage fixes. First, the new Reveal component:
Now update the homepage — wordmark strip, testimonial avatars, and Reveal application:
Now update the wordmark strip markup, testimonial figcaption, and wrap the intro section in Reveal:
Now wrap the intro section elements in Reveal (matching the source's animation targets):
Now the accordion animation in globals.css:
Now the footer — read it fully, then add social icons + Legal column:
Wait — the footer now shows canonical `grid-cols-[minmax(...)]` but my earlier grep found `grid-cols-inmax(...)`. Let me re-verify all 5 locations:
Conflicting tool outputs — let me get definitive raw bytes:
Confirmed via raw bytes — the `inmax` typo is real in all 5 files (the Read tool display had normalized it). Let me fix the footer first (social icons + Legal column), then canonicalize all 5 grid classes.
Footer done. Now canonicalize all 5 `grid-cols-inmax` classes:
The Edit tool can't match — the actual bytes must differ from both displays. Let me inspect exact codepoints:
Conflicting outputs — decisive test with fixed strings and hexdump:
Hexdump is definitive: the typo `inmax` IS in the files. The Edit tool's matcher seems affected by the same display anomaly, so I'll do the canonicalization via a deterministic Python script:
Script found 0 matches though hexdump showed the typo at 7939 — the prefix must differ. Let me print wider context:
**Critical discovery — the "inmax typo" NEVER EXISTED.** Byte 7949 is `0x5b` ('[') — the files already have canonical `grid-cols-[minmax(...)]`. The tool-output display pipeline mangles the character sequence `[m` into `i`, which fooled me, both Explore agents, and the SKILL.md §17 claim. Evidence hierarchy: codepoint/hexdump probe > displayed text. **r11 is void** — no code change needed; instead this is a doc correction (SKILL.md's "malformed class" claim is false).

Also, the source footer has "Legal" as a **standalone section below the grid** (not an 8th column). Let me fix my footer edit accordingly:
Footer fixed. Now the /learn hub rebuild — let me study the source's learn page structure in detail first:
Source details captured. Let me check the clone's Article catalog shape and current learn page:
Catalog matches source exactly (Guide 13/Article 8/Video 1/Case Study 1). Let me check the ui.tsx primitives API, then build the learn hub:
Now I'll write the learn hub client island:
Now rewrite the learn page (cream hero matching source instead of the photo PageHero):
Now the calculator rebuild — let me review the current calculator-app:
Let me see the calculator page, then rebuild both it and the app:
Now rebuilding the calculator-app with the source's sage summary card + breakdown bar + loan summary + PMI alert:
Now the calculator page with the source's additional sections:
Quick consistency fix — use ChevronDown (like home FAQ) instead of Zap in calculator FAQ:
Build passes. Quick gate check, then continue with get-started + manufacturers:
Lint caught a `set-state-in-effect` in reveal.tsx (the synchronous reduced-motion path). Better fix: handle reduced-motion purely in CSS (already has a global block) and keep only the async observer:
Lint clean. Now get-started parity — read the prequal form:
Let me check the funnel UI E2E spec to avoid breaking it, then apply the form tweaks:
Safe — the spec's `/zip/i` regex still matches "Property ZIP code". Now apply the form parity tweaks:
Now the get-started page hero — photo background, avatar testimonial, and checkmarks row:
The `[m`→`i` display artifact strikes again — using Python for the grid-class line:
Now manufacturers index grouping (r10):
The page already groups by tier — the screenshot scale misled me. Let me enhance it to match the source's band styling, card links, chip directory, and check the Manufacturer type:
The JSON `category` field is empty/garbage — but the explore agent said catalog.ts *computes* category. Let me verify:
分组正常工作（类别根据价格下限计算）。现在根据源一致性增强页面——band 样式、卡片链接、芯片目录：
Now add E2E regression guards for today's incident + new features:
Now the full verification gate — lint, typecheck, unit, build, then E2E:
39 个测试通过（包括两个 OOM 回归测试 —— 文章正常渲染！），但我的新 spec 中有 4 个失败。根据调试规范：先重现 → 再隔离。让我检查一下是否存在过期的服务器，并阅读失败上下文：
**Strict-mode violations** — the new UI renders correctly; my test locators are ambiguous. Let me check the other 3:
All 4 are test-side issues (strict-mode ambiguity, range-input fill not supported) plus one real dedupe issue: the footer now has TWO "NMLS Consumer Access" links (Legal column + old bottom-bar link). Source keeps NMLS only in Legal — fix the app, then the spec:
**43/44 个 E2E 测试通过**（唯一失败的是已记录的 DB 依赖测试 —— 在沙盒中属于预期情况）。现在进行最终的视觉验证 —— 截取修复后的克隆页面并进行对比：
Home looks great (logos, avatars, footer socials all present), but the intro cards area appears blank — let me verify the Reveal state in the DOM:
The Reveal works exactly like the source — cards animate in on scroll (all at opacity 1). Even the full-page screenshot blank-area artifact now **matches the source's own behavior**. Let me verify the learn + calculator rebuilds:
Learn hub is now a close match. Checking the calculator:
Calculator parity achieved. Now r13 — documentation alignment. Let me locate the exact stale claims in SKILL.md first:
I have all locations. Writing the doc-fix scripts (with exact-match assertions so nothing silently fails). Note: strings containing `[minmax` must use the TRUE byte form:
The markdown.tsx line is mid-line in CLAUDE.md — adjusting the needle and re-running the remaining fixes:
CLAUDE.md complete. Now the SKILL.md surgical fixes:
The GuideView needle hit the display artifact — the true bytes have `[minmax`. Fix and re-run:
Now append the new lesson (LL-17) and audit-history row to SKILL.md:
Docs complete. Now let me check the SSH wrapper script and prepare the push:
paramiko 5.0.0 ready (no OpenSSH binary in sandbox — exactly why the wrapper exists). Final gate + worklog + commits:
Now the atomic commits to main:
All 3 atomic commits on main, tree clean. Now push via the SSH wrapper:
**Push succeeded**: `3d9ee55..a1b2e67 main -> main`. Final cleanup and verification:
All done. Here's the complete picture:

## Summary

**🔎 Audit** — Reviewed all 4 docs (delegated deep cross-checks of the 95KB architecture doc and 110KB SKILL.md against actual code), ran browser E2E against the live site, and captured full-page visual comparisons vs modfii.com.

**🚨 Critical find** — The live origin's 502s were **not** infra: `/learn/construction-loans-vs-traditional-mortgages-prefab` OOM-crashed the Node server (2GB heap). Root cause: the markdown parser had no `#### ` branch — H4 lines looped forever allocating React elements. Reproduced locally, fixed TDD-style (RED: worker crash → GREEN: H4 branch + loop-safety guard), pinned by 6 unit tests + 2 E2E regressions.

**🎨 Parity** — Real wordmark logos, testimonial avatars, scroll-reveal animations, animated accordions, 4 social icons + Legal section, full `/learn` hub rebuild (search/filters/featured/tools/newsletter), `/calculator` rebuild (breakdown bar, PMI alert, 6 new sections), get-started wizard tweaks, manufacturers tier bands + A–Z directory.

**✅ Verified** — lint 0/0 · typecheck ✓ · 37/37 unit · build ✓ · 43/44 E2E (the 1 failure is the documented DB-dependent test; no Postgres in this sandbox).

**📤 Pushed** — 3 atomic commits to `main` via the SSH wrapper: `f61cf67` (fix), `a9eb492` (feat), `a1b2e67` (docs).

**Next steps for you:**
1. **Redeploy** — the live site is still 502; it needs the pushed code deployed to recover.
2. **Deferred debt** (documented in SKILL.md LL-17 + audit table): the interior guide pages remain thinner than the source's long-form content — a content authoring project, not a code one.
3. One caution: tooling in this session displayed `[m` as `i`, which briefly framed canonical Tailwind classes as a "typo" — worth knowing if you audit with similar tools.
