# REMEDIATION PLAN — PASS 5 (Live-Source Parity + Hardening)

**Date:** 2026-09-12 · **Mode:** Audit → Remediation (per `coding_agent_prompt.md` Mode C → Mode B/A)
**Inputs:** Browser E2E against `https://modfii.jesspete.shop/` (clone) and `https://modfii.com/` (source) — computed-style probes, DOM extraction, VLM screenshot comparison, `scripts/live-audit.mts` (39 PASS / 0 FAIL / 2 WARN), plus a clean-clone gate re-run (`lint 0/0`, `typecheck`, `37/37` unit, `build 43/43`, `61/61` E2E with PG / `60/61` DB-less).
**Method:** TDD at the E2E parity level (failing `parity.spec.ts` pins first, then implementation), unit tests where logic changes, full gate after each task group.
**Exclusions:** `skills/` and `infrastructure/` (operator-managed — out of code checks/tests/compilation per repo contract).

---

## A. Findings (severity-ranked)

| # | Severity | Finding | Evidence |
|---|----------|---------|----------|
| F-01 | **HIGH** | Header logo is wrong: clone renders the circle-ring SVG (`/brand/modfii-logo-icon.svg`, 36×36) but the live source renders a **CSS rotated-square gradient badge** (`w-8 h-8`, `rotate-3`, `rounded-lg`, inner `bg-background` square + `w-4 h-4` gradient center) in BOTH header and footer. The circle SVG is only the favicon on both sites. Pass-3 pin "brand mark is the circle glyph" is wrong. | `scripts/logo-probe2.mts`, `scripts/footer-logo-probe.mts` — source DOM captured 2026-09-12 |
| F-02 | **HIGH** | No security headers emitted by the app (`next.config.ts` has no `headers()`; live clone ships without CSP/HSTS/XFO/nosniff/referrer-policy; source emits HSTS + referrer-policy + nosniff). PAD §6.1 attributed reverse-proxy headers to the app. | `curl -sI https://modfii.jesspete.shop/api/health` (no security headers) vs `curl -sI https://modfii.com/` |
| F-03 | **HIGH** | Intro eyebrow was removed in pass 4 based on a wrong pin — the live source **does** render `Your Prefab Financing Partner` as a `bg-primary/10 text-primary` pill above the intro H1. | `scripts/resolve-conflicts.mts` (`eyebrowAbove: "Your Prefab Financing Partner"`), VLM intro comparison |
| F-04 | **HIGH** | Heading hierarchy inverted: source hero title = **H2** (60px) + intro title = document **H1** (48px); clone = hero H1 + intro H2. Mid-section titles ("How Financing Works" etc.) are H2 20px/600 on source vs H3 20px/700 on clone. SEO/semantics parity. | `scripts/home-deep-diff.mts` heading trees |
| F-05 | **HIGH** | Header bar metrics drift: source `bg-background/80` + `backdrop-blur-lg` (16px) + `border-border/50` + inner `h-20` (80px, 81px rendered); clone `bg-background/90` + `backdrop-blur-xl` (24px) + `border-border/80` + `h-16` (65px). | computed-style probes both sites |
| F-06 | **HIGH** | Hero height: source 738px (`pt-24 pb-16 md:pt-28 md:pb-20` + container **without** vertical padding); clone 895px (`pt-28 md:pt-32` + Container `py-16 md:py-20` — double padding). Overlay recipe itself matches (gradients identical). | `scripts/hero-overlay-probe.mts`, `scripts/home-deep-diff.mts` |
| F-07 | **HIGH** | Guide-page content depth: source pages are 4–10× longer — hub 19,058px/100 headings vs clone 3,099px; FHA 13,539px/54 vs 1,981px; ADU 13,456px/80 vs 2,055px; tiny 12,749px/77 vs 1,994px; construction 7,442px/36 vs 2,706px; about 4,437px vs 1,734px. | `scripts/interior-diff.mts`, `scripts/source-outline.mts` outlines saved to `/home/z/my-project/audit/outline/` |
| F-08 | **MEDIUM** | Button chrome: source buttons are radius **10px**, `font-medium` (500), lg `px-8` (32px), secondary CTA `text-sm` (14px), closing CTA `text-lg` (18px); clone `rounded-md`=12px, `font-semibold` (600), `px-7` (28px), all 16px. | computed-style button probes |
| F-09 | **MEDIUM** | Wordmark strip chrome: source `py-8 bg-muted/30 border-y border-border/50`; clone `border-b border-border bg-card py-10`. | `scripts/section-diff.mts` |
| F-10 | **MEDIUM** | Testimonial cards: source `bg-background rounded-2xl` (=**16px**) `p-8 border border-border hover:shadow-lg`; clone `bg-card rounded-2xl` (=**24px**). Radius scale drift: source md=10px/2xl=16px; clone md=12px/2xl=24px. | computed-style probes |
| F-11 | **MEDIUM** | Interior H1 sizes/text: get-started source H1 is 24px (compact hero) vs clone 48px; learn 60px vs 48px; glossary 48px vs 60px; adu/tiny/construction H1s carry long-form titles on source ("ADU Financing: How to Finance an Accessory Dwelling Unit" etc.) vs clone short titles. | `scripts/interior-diff.mts` |
| F-12 | **MEDIUM** | SEO titles: source uses long descriptive titles ("ADU Financing: How to Finance an Accessory Dwelling Unit (2026 Guide) \| ModFii"); clone uses short ones ("ADU Financing \| ModFii"). | `scripts/interior-diff.mts` title capture |
| F-13 | **MEDIUM** | `POST /api/applications` returns an empty, non-JSON 500 when DB is unreachable (unhandled throw) — violates documented S-10 JSON-error contract. | local probe: `DATABASE_URL` → dead port → `500` with empty body |
| F-14 | **LOW** | Section heading sizes: problem/fix + standards card H3s 16px (clone 18px); steps H3 20px (clone 24px); "Our Standards" H2 30px (clone 36px); "Why Homeowners Choose ModFii" is H3 on source (clone H2); FAQ questions are H3 16px/400 on source (clone `<summary>` non-heading). | `scripts/home-deep-diff.mts` |
| F-15 | **LOW** | `/debug-error-probe` shipped but undocumented and unpinned by any E2E test. | build route list; `e2e/` grep |
| F-16 | **LOW** | Hero eyebrow pill opacity: source `bg-white/15 border-white/30`; clone `bg-white/10 border-white/35`. Amber hero badge position: source `-right-4`, clone `-right-2`. | hero probes |

Not gaps (verified matching — do not "fix"): overlay gradients (`from-primary/95 via-primary/90 to-primary/80` + bottom fade), amber badge text incl. 🏆 emoji, stat glass card (`bg-white/10 backdrop-blur-md rounded-2xl p-8 border-white/20`), hero para text, testimonial avatars present on live clone (HTTP 200; earlier VLM "missing" claim was a full-page-capture artifact), savings ledger, footer text content + social aria labels, body background `rgb(253,253,252)`, nav labels, "See Your Options" CTA present in both.

---

## B. ToDo (execution order — TDD: red → green per task)

### Task 1 — Security headers [F-02] (HIGH, functional)
- **RED:** add `e2e/smoke.spec.ts` test: `/api/health` + `/` responses expose `x-frame-options: DENY`, `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy`, CSP `default-src 'self'`, HSTS (localhost exempt from HSTS assertion).
- **GREEN:** add `async headers()` to `next.config.ts` (source contract: CSP incl. stripe+cloudflareinsights allowances, permissions-policy `camera=(), microphone=(), geolocation=()`, referrer-policy, HSTS, nosniff, XFO DENY).
- **Gate:** `npm run build` (redirects+headers validated) + `npm run e2e`.

### Task 2 — Funnel API JSON 500 [F-13] (MEDIUM, functional)
- **RED:** `e2e/funnel.spec.ts` — every response from `POST /api/applications` has `content-type: application/json` (400/429 paths assertable; DB-down 500 verified via scripted probe `scripts/verify-db-outage.sh` — starts `next start` with dead DATABASE_URL, asserts JSON body).
- **GREEN:** wrap the `ensureSeeded()`→insert loop in try/catch → `Response.json({ error: "..." }, { status: 500 })` in `src/app/api/applications/route.ts`.
- **Unit:** none (route handler; repo convention keeps DB paths under E2E).

### Task 3 — Brand mark: rotated-square badge [F-01] (HIGH, visual)
- **RED:** flip `e2e/parity.spec.ts` "brand mark is the circle glyph" pin → assert header+footer logo container renders the `rotate-3` gradient badge (`div.relative.w-8.h-8` with two nested squares) and NO `<img src="/brand/modfii-logo-icon.svg">` in header/footer; favicon stays the SVG.
- **GREEN:** `src/components/site-header.tsx` + `site-footer.tsx` — replace `<Image>` logo with the source's 3-div CSS badge + keep two-tone wordmark (drop `tracking-tight` to match source).
- **Note:** `public/brand/modfii-logo-icon.svg` remains as favicon (`layout.tsx` icons).

### Task 4 — Header bar metrics [F-05] (HIGH, visual)
- **RED:** parity pin — computed `backdrop-filter` = `blur(16px)`, `background-color` alpha 0.8, inner bar height 80px, border `border-border/50`.
- **GREEN:** `site-header.tsx` — `bg-background/80 backdrop-blur-lg border-b border-border/50`, inner `h-20`; adjust dropdown offset `top-full` spacing + mobile drawer top spacing to the new bar height.

### Task 5 — Button chrome + radius scale [F-08, F-10] (MEDIUM, visual)
- **RED:** parity pins — hero secondary CTA computed radius 10px / weight 500 / px 32; testimonial card radius 16px.
- **GREEN:** `globals.css` `@theme` radius tokens → `--radius-md: 0.625rem` (10px), `--radius-lg: 0.75rem` (12px), `--radius-xl: 0.875rem` (14px), `--radius-2xl: 1rem` (16px); `ui.tsx` Button base `font-medium` (drop `font-semibold`), size lg `px-8 text-base`, size default `text-sm`; hero secondary CTA stays `text-base`, amber hero CTA `text-sm`; closing CTA `text-lg` (`page.tsx` class).
- **Sweep:** re-run full E2E (radius token change affects dropdowns/cards sitewide — verify no visual regressions via screenshots).

### Task 6 — Hero height + eyebrow pill [F-06, F-16] (HIGH, visual)
- **RED:** parity pin — hero section computed height ≈ 738px ± 40px at 1440×900 (content-driven; assert `pt` paddings `96px 0px 64px` and no container vertical padding).
- **GREEN:** `page.tsx` hero — section `pt-24 pb-16 md:pt-28 md:pb-20`, Container drops `py-16 md:py-20`; eyebrow pill `bg-white/15 border-white/30`; amber badge `-right-4`.

### Task 7 — Heading hierarchy + eyebrow re-add [F-03, F-04, F-14] (HIGH, visual/SEO)
- **RED:** parity pins — intro section renders eyebrow pill `Your Prefab Financing Partner` (bg-primary/10); hero title is `H2`, intro title is `H1` (48px); "How Financing Works"/"Loan Types Available"/"Who We Help"/"Why Prefab Financing Is Different" are `H2` (20px/600); "Why Homeowners Choose ModFii" is `H3`; problem/fix + standards card titles 16px; steps titles 20px; "Our Standards" H2 30px (`text-3xl`); FAQ questions inside `h3`.
- **GREEN:** `page.tsx` — swap hero `h1`→`h2`; intro `h2`→`h1` + add eyebrow pill (`inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6`); card titles `h3`→`h2 text-xl font-semibold` for the four intro cards; "Why Homeowners Choose ModFii" `h2`→`h3`; problem/fix/standards card titles `text-base` (16px); steps titles `text-xl` (20px); "Our Standards" `text-3xl` (30px); FAQ `<summary>` wraps content in `<h3 class="text-base font-normal">`.
- **Flip the wrong pass-4 pin** ("intro section has no eyebrow") in the same commit.

### Task 8 — Wordmark strip + testimonial cards [F-09, F-10] (MEDIUM, visual)
- **RED:** parity pins — strip section classes include `bg-muted/30` + `border-y` + `border-border/50` + `py-8`; testimonial cards `bg-background` + radius 16px + `hover:shadow-lg`.
- **GREEN:** `page.tsx` — strip `py-8 bg-muted/30 border-y border-border/50`; testimonial card `rounded-2xl border border-border bg-background p-8 transition-shadow hover:shadow-lg` (radius fixed by token in Task 5).

### Task 9 — Interior H1s + SEO titles [F-11, F-12] (MEDIUM, visual/SEO)
- **RED:** parity pins — get-started H1 24px; learn H1 60px; glossary H1 48px; adu/tiny/construction H1s contain the long-form titles; `<title>` patterns match source ("ADU Financing: How to Finance an Accessory Dwelling Unit (2026 Guide) | ModFii" etc.).
- **GREEN:** adjust `GuideScreen`/`PageHero` per-page heading sizes (add `titleSize` prop or per-guide config in `guides.ts`); update `metadata.title` in the 6 page files + `guides.ts` titles.

### Task 10 — Guide content depth [F-07] (HIGH, content)
- Expand `src/lib/guides.ts` sections for hub, FHA, ADU, tiny, construction (+ about page content in `src/app/about/page.tsx`) using the captured source outlines (`/home/z/my-project/audit/outline/*.txt`) — target ≥60% of source heading count per page, all content original paraphrase (no scraping of source prose; structure + facts only).
- **RED:** parity pins — hub renders ≥14 of the source's 19 section headings; FHA renders ≥12; FAQ count per page ≥ source's; comparison tables present where source has them.
- **GREEN:** write the sections; verify page heights roughly double+.
- **Scope note:** full 1:1 prose parity is out of scope for one pass; this task closes the structural gap (sections, tables, FAQs) and is the largest single work item.

### Task 11 — `/debug-error-probe` pin [F-15] (LOW)
- **RED:** new E2E test — `/debug-error-probe` renders the error-boundary recovery UI (heading + retry affordance), does not crash the server.
- **GREEN:** no code change expected (route already works; pin only). Documented in AGENTS/PAD (done in pre-remediation doc pass).

### Task 12 — Full gate + docs round 1
- `npm run lint && npm run typecheck && npm run test && npm run build && npm run e2e` (61+new pins with PG; 60+new−1 DB-less).
- Re-run `scripts/live-audit.mts` + spot re-probe of the local prod server for header metrics parity (styles only — deploy is out of scope).
- Update AGENTS.md / CLAUDE.md / README.md / PAD / SKILL.md to the remediated state (counts, pins, tokens, logo description, security headers now app-emitted, funnel JSON 500, guide content depth).

---

## C. Validation of this plan against the codebase (pre-execution)

- `next.config.ts` currently has no `headers()` → Task 1 additive, no conflicts. ✓
- `site-header.tsx:53` has the exact drift classes quoted in F-05 → Task 4 is a 3-string edit + spacing follow-ups. ✓
- `ui.tsx:21,38,68` (`px-7`, `font-semibold`, `rounded-md`) → Task 5 edits confirmed against source probes. ✓
- `page.tsx:213,224,226,256,284` contain the exact drift quoted in F-06/F-09/F-16. ✓
- `parity.spec.ts:112` "brand mark is the circle glyph" is the wrong pin to flip (Task 3 RED). ✓
- `parity.spec.ts:137` "intro section has no eyebrow label" is the wrong pin to flip (Task 7 RED). ✓
- `guides.ts` hub entry has 3 sections vs source 19 → Task 10 is additive content within the existing `GuideSection[]` shape (no schema change). ✓
- DB-down funnel probe requires a second server on 3003 (playwright owns 3002) — scripted, not part of `npm run e2e`. ✓
- No task touches `skills/**` or `infrastructure/**`. ✓

**Gate order:** Task 1–2 (functional) → 3–8 (home visual, single E2E cycle) → 9–10 (interior content) → 11–12 (pin + full gate + docs).
