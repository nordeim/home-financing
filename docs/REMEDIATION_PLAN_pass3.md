# Remediation Plan — Pass 3 (2026-09-12)

**Scope:** code hygiene + modfii.com live-visual parity + regression tests + docs alignment.
**Method:** evidence-first audit (live DOM/text extraction of both sites at 1440px and 390px), TDD for every behavior change (RED → GREEN), full gate after each slice.
**Excluded from checks/tests/compilation per repo contract:** `skills/` and `infrastructure/`.

## A. Audit evidence (verified 2026-09-12)

| Check | Result | Evidence |
|-------|--------|----------|
| `npm run lint` | 0 errors / 0 warnings | eslint flat config run |
| `npm run typecheck` | pass | tsc --noEmit |
| `npm run test` | 37/37 (11+13+7+6) | vitest run |
| `npm run build` | 43/43 pages, redirects validated | next build |
| `npm run e2e` (local, DB-less) | 42/44 — funnel-valid-payload needs DB (documented); **parity PMI test flaky (bug B1)** | playwright chromium |
| Live clone (14 routes) | all 200, 0 console errors, 0 broken `<img>`, 0 real failed requests | Playwright probe |
| Live API | `/api/health` ok:true/db:true · funnel POST → 4 matches · sitemap 152 locs · robots host correct | curl |
| Mobile 390px | no horizontal overflow on either site | scrollWidth probe |

## B. Bugs

- **B1 [HIGH] `e2e/parity.spec.ts` "calculator PMI alert disappears at 20% down" is flaky.**
  Root cause (reproduced): the test dispatches a synthetic `input` event immediately after `goto`, racing React hydration; when the dispatch lands before hydration the state change is lost (2/5 immediate runs failed; 3/3 passed after a 1500 ms settle). App math is correct (25% down ⇒ PMI 0 ⇒ "No PMI.").
  Fix: wrap dispatch+assert in `expect(...).toPass()` so the dispatch retries until React is live. No fixed sleeps.

## C. Visual parity gaps vs modfii.com (fix)

| # | Severity | Gap | Fix |
|---|----------|-----|-----|
| P1 | HIGH | Logo mark: source = green **circle ring + center dot**; clone = rotated square. Wordmark: source = two-tone "Mod"(foreground)+"Fii"(primary); clone = single tone. Header + footer. | Replace `public/brand/modfii-logo-icon.svg` with circle mark; render two-tone wordmark in header/footer. (Corrects CLAUDE.md's "rotated-square canonical" claim — live site is the design contract.) |
| P2 | HIGH | Homepage missing eyebrow **"Your Prefab Financing Partner"** above "Modular & Prefab Home Loans". | Add uppercase eyebrow label. |
| P3 | HIGH | Homepage closing CTA missing trust line **"No credit impact • 15-minute application • Cancel anytime"** under "Get Pre-Approved Free". | Add line. |
| P4 | HIGH | `/get-started` missing **"Get Financing in 3 Easy Steps"** section (Share Your Project / Get Matched / Choose Your Lender). | Add section below hero (cream bg, numbered green badges, icons FileText/Handshake/Home). |
| P5 | MED | Homepage has **extra green band** ("Your sustainability should lower the rate.") — not on source homepage. | Remove section (assets stay, used by PageHero pages). |
| P6 | MED | Homepage has **extra "See Your Options" CTA after the 3-steps section** — source has CTA only after problem/solution. | Remove steps-section CTA. |
| P7 | MED | Mobile header: source = **light header below desktop**, transparent-over-dark only on desktop; clone = transparent at all widths. | **Upgraded during execution** — computed-style probe showed the source header is light in EVERY state (top, scrolled, desktop, mobile: `rgba(253,253,252,0.8)` + blur). Removed the transparent-over-dark treatment entirely (`overDarkHero` + scroll listener deleted); header statically `bg-background/90` + blur. |
| P8 | MED | Calculator page: source lower sections sit on a **warm amber wash**; clone neutral. | Wrapped How-to-Use / Explore / FAQ / Related Resources in a continuous `bg-accent/15` band (implemented value; `/10` was too subtle against the source's peach wash). |
| P9 | LOW | "How it works" eyebrow lowercase on clone; source is "How It Works". | Case fix. |
| P10 | LOW | More dropdown: source = 2 items (ADU Financing, Tiny Home Financing); clone = 4 (+ Calculator, Learn). | Match source — MORE array trimmed to 2 items; the mobile drawer renders NAV + MORE, so it also shows the 2-item list (Calculator/Learn stay reachable via footer). |
| P11 | LOW | Footer: clone copyright adds "NMLS #2537136" (source plain); clone legal line missing trailing **"NMLS Consumer Access"** link (source has it). | Match source. |
| P12 | LOW | Get-started eyebrow icon: clone uses Leaf; source uses a sparkle glyph. | `Sparkles` icon. |

**Accepted deviations (documented, not fixed):** clone FAQ answers are richer (questions match; answers only visible on expand — content depth, not visual parity). Source's own calculator has a term-button/summary mismatch ("10 years" while "30 yr" highlighted) — a source-side bug; the clone is correct and must not replicate it. Source calculator uses numeric $-input boxes beside sliders; clone uses sliders only — control-style difference deferred (functional parity intact).

## D. Regression tests (added/updated in `e2e/parity.spec.ts` + `e2e/assets.spec.ts`)

1. PMI hydration-race fix (B1) — 10 consecutive stable runs required.
2. Logo: two-tone wordmark (Mod + Fii spans) in header; circle-mark svg loaded.
3. Homepage: eyebrow present; closing trust line present; green band absent; exactly one "See Your Options"; "How It Works" case.
4. Get-started: "Get Financing in 3 Easy Steps" + 3 card titles visible.
5. Mobile (390px): header background opaque light (not transparent) on `/`.
6. Desktop dropdown: exactly 2 MORE items, Calculator/Learn absent.
7. Footer: copyright text without NMLS number; legal line includes NMLS Consumer Access.
8. Calculator: amber band present on lower sections.

## E. Sequencing

1. RED: add/adjust specs, confirm new ones fail on current code.
2. GREEN: implement B1 + P1–P12 (smallest diffs, existing primitives only).
3. Gates: lint → typecheck → test → build → e2e (chromium), repeat PMI spec ×10.
4. Local serve + text-diff re-run vs modfii.com → confirm only accepted deviations remain.
5. Docs: AGENTS.md, CLAUDE.md, README.md, home-financing_SKILL.md, Project_Architecture_Document.md — pass 3 alignment (section lists, logo facts, counts, evidence).
6. Cleanup scratch scripts; atomic commits to `main` only; push via SSH wrapper.
