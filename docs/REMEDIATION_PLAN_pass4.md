# Remediation Plan — Pass 4 (2026-09-13): live-source visual parity refinements + doc alignment

**Mode:** Audit (C) → Debugging/Generation (B/A) per `coding_agent_prompt.md`
**Evidence base:** live probes of `https://modfii.jesspete.shop/` (clone) vs `https://modfii.com/` (source), 2026-09-12/13, Playwright chromium 1440×900 + 390×844, computed-style probes, source JS/CSS bundle extraction.
**Scope guard:** `skills/` + `infrastructure/` stay excluded from all checks/tests/compilation. No new branches — all work on `main`.

---

## 1. Audit summary (counts by severity)

Functional audit of the live clone: **39 PASS / 0 FAIL / 2 WARN** (both WARNs verified as audit-script heuristics, not bugs: calculator is reactive with no submit button; get-started is a 4-step wizard showing one field per step). All 25 probed routes 200; `/api/health` → `{ok:true,db:true}`; funnel API persists + returns 4 scored matches; calculator API returns full PITI; zero broken images; zero console errors; mobile nav OK.

Code gates at `5981cc9`: lint 0/0 · typecheck clean · 37/37 unit · build 43/43 · E2E 54/55 DB-less (the DB-less failure is exactly the documented funnel happy-path).

Visual-parity gaps found: **18** (1 HIGH block-level, 5 MEDIUM-HIGH, 8 MEDIUM/LOW, 4 NEGLIGIBLE).
Doc drift found: **3** (one acknowledged open in PAD §11, two new).

---

## 2. Visual parity findings (clone vs source)

| # | Sev | Finding (Location) | Evidence | Fix |
|---|-----|--------------------|----------|-----|
| V1 | HIGH | Hero photo differs: clone ships darker dusk 1344×768 `hero-prefab.jpg`; source uses daylight 1920×1080 `hero-prefab-home-LuPCETKv.jpg` | byte-compare, PIL sizes | Replace asset with source file |
| V2 | HIGH | Hero overlay recipe: clone `bg-gradient-to-r from-forest/95 via-forest/80 to-forest/35` + `hero-grid` texture, no bottom blend → hard edge into wordmark strip; source `from-primary/95 via-primary/90 to-primary/80` **plus** bottom fade `from-transparent via-transparent to-primary/95`, no grid texture | source JS bundle (de-minified hero JSX) | Adopt source recipe, drop grid, add bottom fade |
| V3 | MED | Hero height: clone `min-h-[92vh] flex items-center`; source content-driven `pt-24 pb-16 md:pt-28 md:pb-20 overflow-hidden` | source JS bundle | Match source |
| V4 | MED | Headline size: clone measured 72px/`-2.16px` tracking; source `text-4xl md:text-5xl lg:text-6xl leading-tight` | computed-style probe + bundle | Match source |
| V5 | MED | Intro eyebrow "YOUR PREFAB FINANCING PARTNER" — clone-only; source has none (only og: meta contains the phrase). parity.spec pins it as "source eyebrow" — wrong pin | source HTML grep + render | Remove; flip parity pin to absence assertion |
| V6 | LOW | Intro card "Why Prefab Financing Is Different" icon: source `HelpCircle` (circled ?), clone `BadgeCheck` | screenshot | Swap icon |
| V7 | MED | Hub hero missing "Last Updated: January 2026" (Calendar icon) — present on source hub **and** FHA page | screenshots | New PageHero `updated` prop + guide data |
| V8 | HIGH | Hub hero missing the source "Here's the truth / But most lenders don't understand that / ModFii exists to solve this" 3-paragraph glass callout | screenshot + source JS | New optional `callout` field + render |
| V9 | MED | Hub hero intro copy differs from source ("Get matched with lenders who finance…" vs source "Most banks don't understand prefab construction…") | screenshot | Replace description |
| V10 | MED | Hub hero: clone 1 CTA; source 2 ("Get Pre-Approved Now →" light + "Compare Loan Options" outline) | screenshot + bundle | `ctas` already supports N; add second |
| V11 | LOW | Hub stat chips: clone 3; source 4 (94% / 7 days / 0.5% / $12K) | screenshot | Add 4th chip |
| V12 | MED | Hub breadcrumb placement: source = left-aligned on cream **above** photo hero with `›` separators incl. Home; clone = centered inside hero, `/` separators. Source FHA page: crumbs centered **inside** hero, no Home crumb | screenshots | `crumbsOutside` option for hub; drop Home crumb inside heroes |
| V13 | LOW | Skyline wordmark: source inlines its own base64 PNG (365×110; the `/assets/skyline.png` URL 404s); clone ships its own PNG | bundle extraction | Swap to extracted source asset |
| V14 | MED | Calculator page: missing "Free Calculator" pill eyebrow; breadcrumb missing middle crumb; Property-Tax bar segment amber vs source blue; section headers amber-bar vs source icon-chip; trust chips Shield vs source CircleCheck; "read" fine | screenshots | Add pill + crumb, add `--color-chart-tax` token, icon swaps |
| V15 | LOW | Testimonial meta: source 2 lines (role, then location); clone 1 line with "·" | screenshot | Split lines |
| V16 | LOW | Closing CTA trust line: source prefixes a shield icon; clone plain text | screenshot | Add ShieldCheck |
| V17 | LOW | Get-started "Build on my land" icon: source Hammer, clone Landmark | screenshot | Swap icon |
| V18 | NEGLIGIBLE | Header blur 12px vs source 16px; hero headline semantic tag h1 vs source h2; hub 9 vs source 10 `<section>`s (source wraps wordmark strip in section) | probe | Align blur to `backdrop-blur-xl`; leave tag counts (SEO-equivalent, invisible) |

**Explicit divergence (kept, documented — not a defect):** source calculator omits PMI at 10% down (3-segment bar, $1,730 total); clone charges `PMI_ANNUAL_RATE=0.0065` at <20% down ($1,923). The PMI math is a documented load-bearing product decision (`CLAUDE.md`: "change only with product approval") and is pinned by unit + E2E tests. Kept accurate; noted in docs.

---

## 3. Doc drift findings

| # | Finding | Files |
|---|---------|-------|
| D1 | `turbo.json:globalEnv` claims but no `turbo.json` exists (PAD §11 open MEDIUM) | `CLAUDE.md:485`, `README.md:312`, `.env.example` comment |
| D2 | E2E per-file counts wrong: docs say `seo 6 / parity 19`; actual runtime is `seo 5 / parity 20`. "42 declarations + 14 asset variants" arithmetic is off (actual: 39 unique declarations + 16 loop-generated = 14 asset URLs + 2 H4 articles = 55) | `AGENTS.md`, `CLAUDE.md`, `README.md`, `home-financing_SKILL.md` |
| D3 | Stale host comment `home-financing.jesspete.shop` | `e2e/seo.spec.ts:24` (+29) |

---

## 4. Remediation ToDo (execution order, TDD)

| Step | Task | Type | Test-first artifact |
|------|------|------|---------------------|
| R1 | Update `e2e/parity.spec.ts`: flip intro-eyebrow pin to absence; add pins: hero bottom-fade overlay + no hero-grid, hub Last-Updated line, hub truth-callout, hub 2nd CTA + 4th chip, FHA highlight word + Last Updated, learn "no 'read read'", calculator Free-Calculator pill | RED | parity.spec.ts (new assertions fail) |
| R2 | Assets: replace `public/images/hero-prefab.jpg` with source daylight photo; replace `public/brand/wordmarks/skyline.png` with extracted source PNG | asset swap | assets.spec + parity wordmark pin stay green |
| R3 | Home hero (V1–V4): recipe, height, headline sizes, remove grid, add bottom fade | GREEN | R1 pins pass |
| R4 | Remove intro eyebrow (V5) | GREEN | flipped pin passes |
| R5 | Intro card icon BadgeCheck→HelpCircle (V6) | GREEN | visual |
| R6 | PageHero: `updated?`, `eyebrowIcon?`, `callout?`, `crumbsOutside?`, drop-Home-crumb in hero, brighter overlay | GREEN | R1 hub/FHA pins |
| R7 | guides.ts + GuideView: hub description/stats/ctas/callout/updated; FHA highlight/eyebrow/description/ctas/updated + author strip support | GREEN | R1 pins |
| R8 | calculator/page.tsx: Free-Calculator pill, middle crumb, CircleCheck chips; calculator-app.tsx: tax segment `--color-chart-tax` | GREEN | R1 calc pin |
| R9 | learn-explorer.tsx: fix "read read" (lines 70, 328) | GREEN | R1 learn pin |
| R10 | Header `backdrop-blur-md`→`backdrop-blur-xl`; testimonial meta 2-line; closing trust shield icon; get-started Hammer icon (V15–V17, V18) | GREEN | visual |
| R11 | D3: seo.spec.ts comment host fix | chore | — |
| R12 | Full gate: `lint → typecheck → test → build → e2e` (expect 55/55 chromium DB-less except funnel-persist: 54/55) | verify | — |
| R13 | Docs: fix D1+D2 across AGENTS/CLAUDE/README/SKILL; append pass-4 notes + timestamps; PAD §11 statuses | docs | — |

**Pre-mortem (top failure modes):**
- *Overlay change washes interior pages* → PageHero keeps its own overlay tuned per screenshot verification; verify hub+FHA+learn after change.
- *Parity pin flips break existing green suite* → run `npm run e2e` after R1 to confirm RED only on new/changed pins.
- *Asset swap 404s* → assets.spec.ts guards all 14 asset URLs (200).
- *Breadcrumbs a11y* → keep `<nav aria-label="Breadcrumb">` structure in both placements.
- *Smoke/axe regressions* → smoke.spec runs axe-critical on `/`; headline/tag changes keep semantics (h1 stays on home hero).

**Out of scope (explicit):** PMI math change; `skills/`+`infrastructure/`; `.env` git-history rewrite (needs owner-run BFG/filter-repo + rotation — documented HIGH in PAD §11); webkit project run (chromium is the documented gate).
