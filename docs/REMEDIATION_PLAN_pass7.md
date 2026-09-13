# REMEDIATION PLAN — PASS 7 (Live-Site E2E Parity Audit)

**Date:** 2026-09-13 · **Input:** live browser audit of `https://modfii.jesspete.shop/` (deployed clone of HEAD `f8e99ab`) vs `https://modfii.com/` (source).
**Method:** clone-app-pat-pro computed-style recon (CSSOM values as ground truth; screenshots + VLM pass as visual reference) via `scripts/live-parity-*.mts` probes at 1440/1280/390 viewports; full-page HTML dumps + heading-outline diffs + VLM gestalt comparison. TDD: new E2E parity pins written RED first, then implementation GREEN, then full gate.
**Baseline at audit time:** `lint 0/0` · `typecheck` clean · `41/41` unit · `build 43/43` · `81/82` E2E chromium DB-less. Home page height 7280 vs 7355 (−1.0%), hero 719 vs 738, header 81px = source. Content pages materially shallower than source (hub 6631 vs 19058 px).

## Findings

### F-1 Header chrome (site-wide, HIGH)
Source header renders `container mx-auto px-4` → `flex items-center justify-between h-16 md:h-20`, nav `hidden md:flex items-center gap-8`, CTA group `hidden md:flex gap-4`, burger `md:hidden`. Clone renders `h-20` at every width, nav `hidden lg:flex gap-1`, CTA `hidden lg:flex`, burger `lg:hidden`, container `max-w-[1400px] px-4 md:px-8`.
→ Mobile header is 80px on the clone vs 64px on the source; between 768–1023px the clone hides the desktop nav the source shows; desktop nav item spacing is 4px vs 32px; horizontal container inset is 32px vs 16px.

### F-2 Home intro section (HIGH)
Source wraps the whole section content in `max-w-5xl` (1024px): heading block `text-center mb-10 md:mb-12`, eyebrow pill with a `House` icon, H1 `text-3xl md:text-4xl lg:text-5xl font-bold mb-6`, paragraph `text-lg md:text-xl max-w-3xl mx-auto leading-relaxed`, card grid `grid md:grid-cols-2 gap-4 lg:gap-6 mb-8`, cards `group bg-card rounded-xl p-5 md:p-6 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300` with icon chip `w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5` (title row `gap-3 mb-3`, body `text-sm`), chips grid `grid grid-cols-2 gap-2`. Clone splits columns (H1 block `max-w-3xl`, cards `max-w-5xl`), renders H1 `text-3xl md:text-5xl` (skips `md:text-4xl`), no eyebrow icon, cards `rounded-2xl border-border bg-card p-8` (16px radius vs 12px, 32px padding vs 20/24px, full border, no shadow/hover), icon chip `h-11 w-11 rounded-xl bg-secondary`, body `text-base`, chips `grid-cols-1 sm:grid-cols-2 gap-3`.
→ Intro column is 768px vs 1024px; cards are visually heavier/taller (mobile intro 2062 vs 1589 px).

### F-3 Home problem/solution cards (MEDIUM)
Source: card `flex gap-4 p-5 rounded-xl border border-destructive/20 bg-destructive/5` (solution: `border-primary/20 bg-primary/5`), icon `w-10 h-10 rounded-lg bg-destructive/10`/`bg-primary/10`, H3 `font-semibold text-foreground mb-1` (non-display), body `text-sm`, section `py-20 md:py-28`, grid `lg:grid-cols-2 gap-8 max-w-5xl mx-auto`. Clone: `p-6`, `border-destructive/15` (solution `border-primary/15 bg-secondary/60` — wrong tint), icon `h-11 w-11 rounded-xl`, H3 `font-display text-base`, body `text-base`, section `py-20 md:py-24`, grid `gap-x-8 gap-y-10`.

### F-4 Home steps cards (MEDIUM)
Source: grid `md:grid-cols-3 gap-8 max-w-5xl mx-auto`, card `relative bg-background rounded-2xl p-8 border border-border hover:border-primary/50 hover:shadow-lg transition-all group`, numeral `text-6xl font-display font-bold text-primary/10 absolute top-4 right-4`, icon chip `w-14 h-14 rounded-2xl bg-primary/10` with `w-7 h-7` icon and `group-hover:scale-110`, connector `hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent`, H3 `mb-3`. Clone: numeral `text-7xl text-secondary absolute right-6 top-4`, icon chip `h-12 w-12 rounded-xl` with `h-6 w-6`, connector `-right-6 top-16 w-6 bg-border`, no hover states, no grid max-w.

### F-5 Home testimonials + standards sections (MEDIUM)
Testimonials — source section `py-20 md:py-32 bg-gradient-to-b from-card to-background`, H2 `text-3xl md:text-4xl lg:text-5xl … mt-4 mb-6`, stars row `mb-4`. Clone: section `py-20 md:py-28` (no gradient), H2 `text-3xl md:text-5xl` (skips md:text-4xl), stars no mb.
Standards — source section `py-16 bg-muted/30 border-y border-border` with `max-w-4xl` header (`text-2xl md:text-3xl … mb-3`, block `mb-10`), cards `bg-card border border-border rounded-xl p-6 text-center`, icon `w-12 h-12 rounded-full bg-primary/10`, H3 `font-semibold mb-2` (non-display), grid `gap-6 mb-8`. Clone: section `bg-muted/50` (wrong tint, no border-y), H2 `text-3xl` only, cards `rounded-2xl p-8`, icon `h-14 w-14`, H3 `font-display text-base`, grid `gap-6`, no mb-8.

### F-6 Home hero + closing CTA details (MEDIUM)
Hero — source H2 `mb-6`, paragraph `mb-8 leading-relaxed` (no `max-w-xl`), CTA wrapper `flex flex-col sm:flex-row gap-4 mb-10` with button `h-11 px-8 text-base` (clone `size="lg"` renders h-12; wrapper bare `mt-8`), checks `flex flex-wrap items-center gap-5` with `CircleCheck` icons `w-5 h-5 text-accent` (clone `gap-x-8 gap-y-3` with a custom ring+Check icon), stats card header `text-center mb-6` (H3 `mb-2`), stats grid `mb-6`, badge rendered after the card. Closing CTA — source paragraph `mb-10 leading-relaxed`, wrapper `flex flex-col sm:flex-row gap-4 justify-center mb-10`, button `bg-secondary h-11 rounded-md px-8 text-lg` (clone `size="xl"` renders h-14), arrow `ml-2 w-5 h-5 group-hover:translate-x-1` (clone `h-4 w-4`, no hover), trust line `gap-3` Shield `w-5` text 16px (clone `h-4` text-sm).
Wordmark strip — source `gap-8 md:gap-12` (clone `gap-x-12 gap-y-4`).

### F-7 FAQ item chrome (site-wide, MEDIUM)
Source FAQ trigger renders `font-semibold` (600) with answer `text-sm`; clone renders questions at 400 with base-size answers. Source chevron `duration-200`.

### F-8 Heading hierarchy bugs (HIGH, semantics/SEO)
- `/get-started` wizard renders each step question as `<h1>` (4 extra H1s; source uses form labels — zero extra H1s).
- Source footer column headings are `<h4>`; clone renders non-semantic `<p>`.
- Glossary: source renders terms as H3 (63) with 2 H2 sections (`Related Resources`, `Have Questions About Financing?`); clone renders 59 terms as H2 with no trailing sections.
- get-started is missing the source's hero trust chips (3 H3s), the `Why Choose ModFii?` H2 (4 benefit H3s) and `Common Questions` H3 block.

### F-9 SEO title drift (MEDIUM)
Eleven pages use different `<title>` patterns than the source (measured 2026-09-13):
home `ModFii | Modular & Prefab Home Loans` · get-started uses the site default `ModFii - Prefab Home Mortgage Marketplace | Get Approved in 7 Days` · fha `FHA Modular Home Loans | 3.5% Down Payment | ModFii` · mortgage `Modular Home Mortgage | Compare Rates from 50+ Lenders | ModFii` · financing `Modular Home Financing | Pre-Qualify in 2 Minutes | ModFii` · about `About ModFii | Prefab Home Mortgage Marketplace` (no trailing brand) · manufacturers `Prefab Home Manufacturers | Approved Lenders for Modular Homes | ModFii` · states `Modular Home Financing by State | All 50 States | ModFii` · rates `Modular Home Mortgage Rates | Current Prefab Home Loan Rates September 2026` · cost `Modular Home Cost Guide | Prefab Home Prices 2026 | ModFii` · down-payment `Modular Home Down Payment Options | 0% Down Available | ModFii`.

### F-10 Content-depth gaps (HIGH, visual mass)
Guide/interior pages are shallower than the source (heading counts h1/h2/h3 measured):
- hub 15/62 vs 8/18 — missing sections: *Modular vs. Manufactured Home Financing; What You'll Need to Apply; Modular Home Financing Costs; Modular Home Financing by Situation; Why Choose ModFii…; Explore Loan Options; Get Pre-Approved…; 20-question FAQ; Sources; Ready to Finance Your Modular Home?*
- mortgage 4/12 vs 4/0 — source outline: *Modular Home Mortgage Options (15/30yr fixed, FHA, VA); How to Get a Modular Home Mortgage (4 steps); 4-question FAQ; Get Your Modular Home Mortgage Today*.
- financing 4/5 vs 4/0 — source outline: *Pre-Qualify…; Financing Options; Why Modular Homes Need Specialized Lenders; Ready to Finance…*.
- about 6/10 vs 3/0 — missing *How We Make Money; Our Editorial Standards; Our Team; Contact Us*.
- resources 11/6 vs 9/0 — missing *Most Popular Guides; Not Sure Where to Start?*
- calculator 5/21 vs 5/11 — missing 4-question FAQ + related-resources trio (Current Rates/Down Payment Guide/Cost Breakdown) + Get Pre-Approved + Popular Resources sections.
- FHA guide: missing *FHA Modular Home Loan FAQ, Sources, Related Financing Guides, Ready for FHA Pre-Approval?* closers.
- states 3/4 vs 0/0 · rates 4/4 vs 3/0 · cost 14/43 vs 4/0 · down-payment 14/30 vs 2/0 · manufacturers 5/85 vs 5/40 (source renders 2 H3s per manufacturer card).

### F-11 Footer chrome (LOW)
Source: `grid-cols-2 md:grid-cols-8 gap-8 mb-12` with `col-span-2` brand column, social buttons `w-10 h-10 rounded-full bg-muted` + `hover:bg-primary hover:text-primary-foreground`, column headings `<h4>`. Clone: custom `1.4fr` grid, bordered `h-9 w-9` social buttons, `<p>` headings, Legal rendered as a separate full-width block.

### F-12 Non-findings (verified clean, no action)
Header bar metrics (81px / `bg-background/80` / blur 16px / 1px border) ✓ · logo badge + two-tone wordmark ✓ · hero photo/overlay recipe + paddings + `max-w-xl` text column ✓ · eyebrow pill translucency ✓ · hero H2/intro H1 hierarchy ✓ · CTA colors/radius/weight/px-8 ✓ · wordmark strip chrome + all 5 images identical dimensions ✓ · FAQ exclusive accordions ✓ · container max-width 1400px at ≥1440 ✓ · testimonial avatars present ✓ · learn hub parity (5542 vs 5589 px) ✓ · mobile hero/strip/steps/testimonials/FAQ/closing heights within ~5% ✓ · no console errors or failed image requests on any probed route ✓ (learn `_rsc` prefetch aborts are benign Next.js navigation cancels).

## Tasks (TDD)

### Task 1 — Header parity (F-1)
- **RED:** `e2e/parity.spec.ts` (pass-7 describe): header inner bar renders 64px at 390px viewport and 80px at 1440px; desktop nav becomes visible at 768px; nav container `gap` computes to 32px; container horizontal padding is 16px at 1440px.
- **GREEN:** `site-header.tsx` — inner bar `h-16 md:h-20`; nav `hidden md:flex … gap-8`; CTA group `hidden md:flex … gap-4`; burger `md:hidden`; container `mx-auto max-w-[1400px] px-4`; `Container` in `ui.tsx` drops `md:px-8` (source uses `container px-4`).
- **Verify:** full gate (`e2e` re-run; mobile screenshots).

### Task 2 — Home intro parity (F-2)
- **RED:** parity pass-7: intro content column ≤1024px; H1 font-size 36px at 768px (`md:text-4xl`); eyebrow contains a house icon; card grid `gap-4`; intro card computes radius 12px, padding 20px, `box-shadow` non-none; card body `text-sm`; chips grid 2 columns at 390px.
- **GREEN:** `page.tsx` — restructure intro into `max-w-5xl` wrapper; heading block `mb-10 md:mb-12`; eyebrow + `House` icon; H1 `text-3xl md:text-4xl lg:text-5xl … mb-6`; paragraph `text-lg md:text-xl max-w-3xl mx-auto leading-relaxed`; grid `md:grid-cols-2 gap-4 lg:gap-6 mb-8`; card chrome `group bg-card rounded-xl p-5 md:p-6 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300`; icon chip `w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5` (+`group-hover:scale-110`); title row `gap-3 mb-3`; body `text-sm`; chips `grid grid-cols-2 gap-2`.

### Task 3 — Problem/solution + steps parity (F-3, F-4)
- **RED:** parity pass-7: problem card padding 20px, border `rgba(…,0.2)` red tint, solution card bg primary/5 (not secondary); H3 font-family DM Sans (non-display); body `text-sm`; section vertical padding 112px at 1440 (`md:py-28`); steps numeral color `rgba(39,104,77,0.1)`; icon chip 56px; connector gradient.
- **GREEN:** `page.tsx` — apply source chrome listed in F-3/F-4.

### Task 4 — Testimonials + standards + hero/closing details (F-5, F-6)
- **RED:** parity pass-7: testimonials section background-image contains `linear-gradient`; H2 36px at 1024; standards section bg `rgba(…,0.3)` + border-y; standards card padding 24px radius 12px; icon 48px; hero H2 margin-bottom 24px; hero CTA height 44px; closing CTA height 44px; hero checks use `circle-check` SVGs; strip `gap-8` at 390.
- **GREEN:** `page.tsx` — apply source chrome; add `h-11` CTA sizing (extend `Button` sizes: source renders `h-11 px-8 text-base` hero CTA and `h-11 px-8 text-lg` closing CTA — adjust `lg`/`xl` or pass className overrides); replace ring-check icons with `CircleCheck`; arrow `ml-2 w-5 h-5 group-hover:translate-x-1` on closing CTA.

### Task 5 — FAQ chrome (F-7)
- **RED:** parity pass-7: home FAQ summary font-weight 600; answer font-size 14px; chevron transition 200ms.
- **GREEN:** `page.tsx` FAQ summary `font-semibold`; answer `text-sm`; chevron `duration-200`. (Note: pass-5 pinned 400 — the source now renders 600; pin flips with fresh evidence, documented here.)

### Task 6 — Heading semantics (F-8)
- **RED:** parity pass-7: `/get-started` renders exactly 1 H1 at every wizard step (drive step 0→1); footer column headings are H4; glossary terms are H3 + page has `Related Resources` and `Have Questions About Financing?` H2s.
- **GREEN:** `prequal-form.tsx` step titles → `<h2>` visually unchanged? No — source uses form **labels**: render step question as `<legend>`/`<label class="font-display text-2xl…">` (keep classes, drop the h1 tag). `site-footer.tsx` column titles → `<h4>` (same classes). `glossary/page.tsx` term heading → `h3`; add `Related Resources` + `Have Questions About Financing?` closing sections (source pattern); get-started page: add 3 trust-chip H3s + `Why Choose ModFii?` section (4 benefit H3s) + `Common Questions` block per source outline.

### Task 7 — SEO titles (F-9)
- **RED:** extend `e2e/seo.spec.ts` (or parity pass-7): exact `<title>` match for the 11 routes listed in F-9.
- **GREEN:** update `metadata.title` in the corresponding `page.tsx` files (incl. `layout.tsx` default → get-started uses site default title).

### Task 8 — Content depth (F-10, largest)
- **RED:** extend the pass-5 guide-outline parity tests: hub outline includes the 7 missing H2 titles + a 20-item FAQ; mortgage/financing/about/resources/calculator outlines match the source lists above; FHA carries the 4 closing sections; glossary counts.
- **GREEN:** author content in `src/lib/guides.ts` (hub FAQ ×20 + missing sections), `mortgage/page.tsx`, `financing/page.tsx`, `about/page.tsx`, `resources/page.tsx`, `calculator/page.tsx` (FAQ ×4 + related trio + CTA + popular resources), FHA guide closers. Keep the existing `GuideSection.subsections` schema; FAQ items reuse the `faq` field; sources lists reuse the existing pattern.
- **Scope note:** cost/down-payment/states/rates/manufacturers depth (43/30/4/4/85 H3s) is scheduled as follow-up — the home + hub + mortgage + financing + about + resources + calculator + glossary pages carry the majority of visual mass. (Documented in the backlog below.)

### Task 9 — Footer chrome (F-11)
- **RED:** parity pass-7: footer grid computes 8 columns at ≥768; social buttons are 40px with filled `bg-muted`; column headings are H4 (Task 6).
- **GREEN:** `site-footer.tsx` — `grid grid-cols-2 md:grid-cols-8 gap-8`, brand column `col-span-2`, social `w-10 h-10 rounded-full bg-muted` + `hover:bg-primary hover:text-primary-foreground`, fold Legal into the grid's 7th/8th column pattern per source.

### Task 10 — Docs alignment (round 1)
- Update AGENTS/CLAUDE/README/SKILL parity descriptions + counts (new parity test count), the FAQ-chrome pin note (400→600, evidence), heading-semantics conventions (wizard labels, footer H4, glossary H3), SEO title list, and this plan's completion status.

## Validation against the codebase (pre-execution)
- `site-header.tsx:54-55` renders `h-20 … px-4 md:px-8` + nav `gap-1 lg:flex` → Task 1 localized. ✓
- `page.tsx:301-348` intro structure matches F-2 description → Task 2 localized. ✓
- `page.tsx:352-407` problem/solution and `410-443` steps match F-3/F-4 → Task 3 localized. ✓
- `page.tsx:448-525` testimonials/standards + `550-577` closing CTA + `234-253` hero checks match F-5/F-6. ✓
- `page.tsx:536-544` FAQ `font-normal` + `text-muted-foreground` answer → Task 5 confirmed. ✓
- `prequal-form.tsx:239,304,349,418` render 4 `<h1>` step titles → Task 6 confirmed (source uses labels). ✓
- `site-footer.tsx:100,162,176` custom grid + `<p>` headings + Legal block → Task 9 confirmed. ✓
- Title pins: 11 route `metadata` objects present in `page.tsx` files (`rg "title:" src/app | wc`) → Task 7 is string-only edits. ✓
- `guides.ts` (1307 lines) has hub FHA/ADU/tiny/construction outlines; hub FAQ currently 8 items vs source 20 → Task 8 additive within existing schema. ✓
- Glossary page renders terms via `h2` (`rg -n "<h2" src/app/glossary/page.tsx`) → Task 6 confirmed. ✓

## Backlog (not this pass)
- Deep content parity for cost (43 H3s), down-payment (30), states (4), rates (4), manufacturers (85 — 2 H3s/card), learn author pages.
- Radix-style accordion keyframe animation parity (current `<details>` + `::details-content` is behaviorally equivalent: exclusive + animated).
- Mobile intro/problems/standards residual height delta after Task 2/3/4 (should drop from +1204px to <300px; content copy length differences account for the rest).

## Gate (per repo contract)
`db:setup → lint → typecheck → test → build → e2e` — full green required before commit. Post-implementation: re-run `scripts/live-parity-audit.mts` + probes against a fresh local prod server (port 3002) to confirm measured deltas (NOT against the live deploy — the deploy lags local by design until the user redeploys).
