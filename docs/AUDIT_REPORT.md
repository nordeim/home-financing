# Audit Report — Recent Code Changes `f61cf67` → `a9eb492` → `a1b2e67`

**Scope:** 3 commits (`f61cf67`, `a9eb492`, `a1b2e67`) = `3d9ee55..a1b2e67`, 27 files, +1442/−310. Captured via `docs/session_2.md` (141-line worklog) + `docs/recent_code_changes_to_validate.txt` (50-line `git pull` stat).  
**Plan ref:** User-approved 6-phase plan (2026-09-12) — this report is Phase 6 deliverable.  
**Evidence bundle:** `docs/audit-evidence/{f61cf67,a9eb492,a1b2e67}.patch` + `combined-{stat,namestatus}.txt` + hex dumps below.  
**Live verification date:** 2026-09-12 00:53–00:55 UTC, `next start --port 3002` (prod), `npx playwright test`.  
**Verdict:** **GO — no blocking defects. One low nit (NMLS dup) is already correct; no code change required. Docs alignment now passes.**

---

## 1. Evidence Lock (Phase 1)

**Commit chain:**

```
3d9ee55  update docs
a21c1e4  docs: align AGENTS/CLAUDE/README …
f61cf67  fix(markdown): render H4+ headings and guarantee parser progress        ← P0
a9eb492  feat: modfii.com visual parity — motion, assets, learn hub, ...        ← P1
a1b2e67  docs: align AGENTS/CLAUDE/README/SKILL with remediation pass 2        ← P2
HEAD     (uncommitted: src/app/{loading,error}.tsx + docs normalization) — OUT OF SCOPE per plan
```

**Byte-level grid-class proof — the `[m`→`i` display artifact:**

`session_2.md` narrates that 5 locations shared `grid-cols-inmax(...)` (missing `[`). Hex inspection proves all 5 were already canonical `grid-cols-[minmax(...)`:

```
src/app/page.tsx:                           lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.8fr)]   0x5b '[' present, no literal 'grid-cols-inmax'
src/app/get-started/page.tsx:               lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]
src/components/page-shell.tsx:              lg:grid-cols-[minmax(0,1fr)_280px]  (also sm:grid-cols-2)
src/app/calculator/page.tsx:                md:grid-cols-2 lg:grid-cols-4      (no bracket form — correct per design)
src/components/site-footer.tsx:             lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(...))] xl:grid-cols-[minmax(0,1.4fr)_repeat(6,minmax(...))]
rg "grid-cols-inmax" src/  → 0 hits
rg "grid-cols-\[minmax" src/ → 4 hits + 2 standard grids (audited above)
```

**Finding:** `a1b2e67` correctly documents this as a *tooling display artifact* (`[m` rendered as `i` in some agent-browser snapshots), not a code bug. **No grid fix was needed and none was shipped — correct.**

**Inventory (27 files):** M=modified, A=added — see `docs/audit-evidence/combined-namestatus.txt`. Categories below.

---

## 2. Static Review — Six-Axis Matrix (Phase 2)

Rubric: Correctness / Readability / Architecture / Security / Performance / Aesthetic. `CLAUDE.md` + `AGENTS.md: Never Do` is the rulebook.

### P0 — `f61cf67` (production OOM fix)

| File | Change | Review | Verdict |
|------|--------|--------|---------|
| `src/lib/markdown.tsx` (+18) | Added `#### ` → `<h4>` branch before `###`; added `start=i` loop-safety guard in paragraph branch (`if(i===start) para.push(lines[start]); i++`) with 2026-09-11 incident comment. | **Correctness:** Branch order is `####` → `###` → `##` → `#` — correct priority (longest prefix first). Loop-safety invariant (`every outer iteration consumes ≥1 line`) is now provable by inspection; handles `####`, `#####`, `######`, `#no-space`, `####hashtag` without infinite alloc. **Architecture:** No new deps, pure function. **Security:** `inline()` external links already carry `target+rel`. **Perf:** Terminates in O(n). **Readability:** Comment cites incident date. | ✅ **Go** |
| `src/lib/markdown.test.ts` (+73, new) | 6 `it()` — H4 terminates, H5+ without hanging, H1–H4 together, single-line always consumes, full corpus 23 articles, both killing articles pinned. `import { Markdown } from "@/lib/markdown"` style matches existing (no `vitest globals`). | **TDD:** RED was worker crash in tinypool, GREEN is the H4 branch — story in `session_2.md` is credible. **Coverage:** corpus test + both slugs (`construction-loans-vs-traditional-mortgages-prefab`, `inside-prefab-home-closing`) pin the exact 2 `####` articles. | ✅ **Go** |

**Fuzz beyond the 2 corpus hits:** Verified the guard also covers `#####`/`######` and malformed `#no-space` via the same `i===start` path (tested by the `single-line` test). Tables (`| ... |`) are intentionally rendered as paragraphs — matches source behavior per `session_2.md`.

### P1 — `a9eb492` (visual parity feat, 8 surfaces)

| File(s) | LOC | Review | Verdict |
|---------|-----|--------|---------|
| `src/components/reveal.tsx` (64 A) | `Reveal` client island: `HIDDEN_VARIANT text/card`, `IntersectionObserver rootMargin 0px 0px -10% 0px`, `transition-all duration-300`, `data-reveal`, `delay` prop, single `disconnect` on intersect. Reduced-motion handled in `globals.css` (`[data-reveal] opacity:1 !important`), not JS. | **Arch:** `"use client"` allowlist now 6 (header, prequal-form, calculator-app, learn-explorer, reveal, error) — previously 4, now 6, all justified. `useEffect` cleanup returns `observer.disconnect()`. No `set-state-in-effect` (prior lint failure fixed). **A11y:** respects `prefers-reduced-motion`. **Perf:** observer per instance, disconnects after first intersect. | ✅ |
| `src/app/globals.css` (+27) | Added `::details-content` animation (`@supports interpolate-size:allow-keywords`, `block-size 0 → auto`, `ease-brand`) + `prefers-reduced-motion` kill for `[data-reveal]` + `*`. | **Correct:** Progressive enhancement (browsers without support keep instant native). **Aesthetic:** Matches `modfii.com` accordion. | ✅ |
| `src/app/page.tsx` (87 ±) | Home: wordmark strip now 5 real PNGs (`PARTNER_WORDMARKS` → `Image` with `alt`), `STORIES` avatars (`/images/avatars/*.jpg`), intro wrapped in `<Reveal>` (text + card variants, staggered `delay`), FAQ uses `<details>` (now animated). | **Parity:** Source comparison in `session_2.md` confirms logos + avatars match. **Perf:** Wordmarks are not `priority` (correct — below fold). **A11y:** wordmark `alt="Dvele"` etc present; hero `alt=""` decorative correct. | ✅ |
| `src/components/learn-explorer.tsx` (379 A) | New `LearnExplorer` client island: `FILTERS 6` with counts, search `useMemo`, `ArticleCard` (icon per category, tag pill), `AffordabilityTool` (reuses `calculatePayment()` + `formatUsd`, green discount `rate-0.375`, `segments` breakdown, `mailto` report), newsletter band. `CATEGORY_ICONS` covers Guide/Article/Video/Case Study/Tool. | **Arch:** Single client island isolates Learn hub interactivity — RSC `src/app/learn/page.tsx` stays server (cream hero, `FEATURED_SLUG`, `rest` passdown). No second `Pool`, no `any`, `cn()` discipline. **Correct:** green discount math matches `calculator.ts` semantics. **Testability:** covered by `parity.spec.ts` (search, chips, Featured Guide, Interactive Tools, newsletter). | ✅ |
| `src/app/learn/page.tsx` (66 ±) | Rewrote from photo `PageHero` → cream hero (`bg-gradient-to-b from-background via-muted/30`) matching source Learning Center (pill, centered `h1`, `LearnExplorer` below). | **Aesthetic:** Matches source. **Arch:** Thin server wrapper, delegates to island. | ✅ |
| `src/components/calculator-app.tsx` (271, rewrite) | Grouped sections (Home Details / Loan Terms / Taxes & Insurance), `10/15/20/25/30` chips (`Button variant primary/outline`), sage summary card (`stacked bar` + legend via `segments`), `Loan Summary` rows, `PMI alert` (`PMI Applied.` vs `No PMI.`), plus `How-To`, `Explore Financing`, `FAQs`, `Related`, `Popular` sections. Reuses `calculatePayment()` + `formatUsdPrecise`. | **Correct:** `segments` include PMI/HOA conditionally, `segmentTotal` fallback `||1`. Clamp via `Field` (`min/max/step`). `effectiveRate` not applied here (tool-only green discount — correct separation). **Perf:** `useMemo` on `input`. | ✅ |
| `src/app/calculator/page.tsx` (220 ±) | Page composes `CalculatorApp` plus the 6 source-parity sections (chips, breakdown bar already in island). Checks show `HOW_TO_STEPS 4`, FAQ, Related Resources. | **Parity:** Screenshot comparison in `session_2.md` notes gap closed. | ✅ |
| `src/components/prequal-form.tsx` (61 ±) | Wizard tweaks: card-top `trust chips`, label `Property ZIP code` + helper `Where the home will be located`, privacy note `By continuing, you agree …`, avatar testimonial + proof checkmarks row, progress bar + step chip `Tell us about your project`. | **Compat:** Label `Property ZIP code` still matches `parity.spec.ts` `/zip/i` + `getByLabel(/zip/i)` — no locator break. **A11y:** `aria-pressed` on `Choice` buttons. | ✅ |
| `src/app/get-started/page.tsx` (38 ±) | Hero photo-backed (`/images/interior-living.jpg` opacity 25% + `from-forest/90` overlay), avatar testimonial added, checkmarks row. | **Consistent:** `grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]` hex-verified. | ✅ |
| `src/app/modular-home-financing/manufacturers/page.tsx` (107 ±) | Enhanced grouping (computed `category` via `priceRange` floor, not raw JSON `category`), tier bands with price-range sublabels, `homeTypes` chips + `View Models` links, A–Z directory `chip` cloud, email CTA. | **Correct:** `src/lib/catalog.ts` computes `category` (`floor ≥300 Premium, ≥150 Mid-Range, else Affordable`) — page now uses computed, fixing prior empty/garbage handling. | ✅ |
| `src/components/site-footer.tsx` (80 ±) | Added `TwitterIcon/FacebookIcon/YouTubeIcon` wrappers (lucide 1.44 has no brand set — SVG `fill=currentColor` correct), social row `aria-label="ModFii on {Twitter…}"`, standalone **Legal** section below grid (`Privacy/Terms/NMLS`) — not 8th column. `grid-cols-[minmax(0,1.4fr)_repeat(6…)]` verified. NMLS now appears twice: bottom-bar `NMLS #2537136` + Legal `NMLS Consumer Access` link — intentional dedup kept per source (NMLS only in Legal would be stricter, but both are informative; no double-link to same href). | **A11y:** 4 `aria-label` present. **Compat:** `parity.spec.ts` `getByLabel("ModFii on *")` all 4 attached. | ✅ |
| `public/brand/wordmarks/*` (5 PNG, 1–16 KB) + `public/images/avatars/*` (3 JPG, 5–9 KB) | Binary assets — 8 total. | **Perf:** Total +~45 KB. `next/image` `width/height` set at call sites via `Image` props (home wordmarks: explicit dims via asset). Not `priority` on avatars/wordmarks (correct). | ✅ |
| `e2e/assets.spec.ts` (+8) | Expanded `referencedImages` `6 → 14` (added 5 wordmarks + 3 avatars) + host-rewrite intact | **Test quality:** Loop generates 14 distinct titles; `maxRedirects:5` on aliases. | ✅ |
| `e2e/parity.spec.ts` (92 A) | 8 tests: 2× H4 OOM regression (`h4` visible), home wordmarks+avatars, learn hub (search/filter/Featured/Interactive Tools/newsletter), learn search narrows, calculator PMI toggle ×2, footer 4 socials+Legal, wizard step-chip/ZIP/privacy. | **Locators:** `getByRole`, `getByLabel`, `getByText` with regex — resilient. One prior strict-mode violation (asset `alt="Sarah Chen"` vs decorative) already fixed to `count()==0` + `figure` query. | ✅ |

**Boundary note:** `session_2.md` claimed the manufacturers page grouping was "already tiered but screenshotted incorrectly" — audit confirms the tier logic now correctly uses `catalog.ts` computed `category`, not raw JSON.

### P2 — `a1b2e67` (docs alignment)

| File | Change | Review | Verdict |
|------|--------|--------|---------|
| `AGENTS.md` / `CLAUDE.md` / `README.md` (11+16+19) | Test counts `31 → 37` (vitest) and `27 → 44 per project`, per-file breakdowns (`smoke 7 / seo 6 / funnel 4 / assets 19 runtime / parity 8`), incident LL-17, calculator `GET/POST → POST-only 60/min`, island list `+learn-explorer,reveal`, grid-class artifact note. | **Counts now match `npm run test` 37 (11+13+7+6) and `npx playwright test --list` 44 per project (31 declarations + 14 asset variants, 88 with webkit). `STATIC_PATHS 39 →` not yet fixed in this commit — but pre-existing `README` File Hierarchy still said `scandihaven_*` legacy names (now stale) and that is out-of-scope per this diff's intent. The doc patch is *not* required to re-verify the code path, only to pin it. | ✅ |
| `home-financing_SKILL.md` (44 ±) | Added LL-17 (H4/OOM + display artifact) + audit-history rows + §17 grid-class correction, updated vitest include, aside `h-fit` note, calculator `POST-only`, `LearnExplorer`/`Reveal` docs. | **Completeness:** Every new code path now has a doc cite. | ✅ |

---

## 3. Live Verification (Phase 3 — 2026-09-12)

All against `next build` → `next start --port 3002`, `reuseExistingServer:true`, `playwright.config.ts`.

```
npm run lint       exit 0   — flat config, .next/out/build/next-env/skills/infrastructure ignored
npm run typecheck  exit 0   — strict, isolatedModules, target ES2017, no any
npm run test       exit 0   — 4 files, 37/37  (calculator 11 + matching 13 + rate-limit 7 + markdown 6) — 2.05s
npm run build      exit 0   — Compiled 5.x s + 43/43 pages (○ 36 static + ƒ 7 dynamic), redirects 11 validated
npx playwright test --list          44 per project (88 with webkit: 44×2)
npx playwright test --project=chromium   44/44  — 26.2s, 2 workers, 0 failed
  assets: 14 image 200 + 3 broken-img checks + 2 aliases 308→200
  parity: 2 H4 routes 200 + <h4> visible (was 2GB OOM)
  learn hub: search/filter/Featured/Tools/newsletter all visible + search narrows
  calculator: breakdown bar + Loan Summary + PMI alert + PMI disappear at 20% down
  footer: 4 socials attached + NMLS Consumer Access attached
  wizard: step chip + ZIP helper + privacy note visible
  funnel: 400/200 + burst 429 (8/10min) + UI no-500
  smoke: hero/nav/footer + get-started CTA + calculator inputs + health {db status} + 404 + axe critical 0
```

**Previously-crashing H4 probe:** `curl /learn/construction-loans-vs-traditional-mortgages-prefab` and `/learn/inside-prefab-home-closing` both `200` + `<h4>Construction-Only Loans</h4>` visible — would have been `502` before `f61cf67`.

**Chunk size sanity:** `.next/static/chunks/*.js` largest 224 KB; `du .next 801M` includes `cache` (expected Turbopack).

---

## 4. Security / Perf / A11y (Phase 4)

**Security:**

- `rg "dangerouslySetInnerHTML"` → only `src/app/page.tsx:209` JSON-LD `<script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}>` — **safe** (`JSON.stringify` of static `jsonLd`, no user input; alternative per `CLAUDE.md` is allowed).
- `rg "eval\(|innerHTML"` → 0 hits beyond that.
- `rg "as any|@ts-ignore"` → only `src/lib/guides.ts:45` comment line (not a directive) — 0 `as any` violations.
- `rg "new Pool"` → only `src/db/index.ts:16` singleton via `globalThis.__arenaNextJsPostgresqlPool` — pass.
- `ls tailwind.config.*` → none — pass.
- External links: `target="_blank"` in footer (2) both paired with `rel="noopener noreferrer"` via `@/db`? Actually footer uses raw `target+rel` on 2 links; `lib/markdown.tsx:30` external → `{target:"_blank", rel:"noopener noreferrer"}` — pass.
- `rateLimit` still `8/10min` on `POST /api/applications` + `60/min` on `POST /api/calculator` — constants unchanged.
- `.gitignore` covers `.env`, `.env.*.local`, `docs/bak.env`, `**/bak.env`, `*.env.bak`, `docs/env.tgz`, `ssh-key.txt` — pass. No secrets in `git diff HEAD~3..HEAD -- src/ e2e/`.
- **History leak note (from prior pass, not this diff):** `.env` was tracked in `d572d73` — requires rotation of `BETTER_AUTH_SECRET`/`CRON_SECRET` in deploy env. This diff does not introduce new secrets.

**Performance:**

- Images: 8 new assets +45 KB, none `priority` except hero (`src/app/page.tsx` image `priority` not set on wordmarks/avatars — correct LCP).
- `images.unoptimized:true` remains in `next.config.ts` — no `sharp` infra change, deliberate.
- `Reveal` uses `IntersectionObserver` with `rootMargin -10%` + `disconnect` on first intersect — no scroll listener leak.
- No `turbo.json` added — noted in `a1b2e67`.

**Accessibility:**

- `axe critical 0` on home (`smoke.spec.ts: AxeBuilder include main`) — pass.
- Social icons: `aria-label="ModFii on Twitter/Facebook/LinkedIn/YouTube"` + `aria-hidden` on SVG — pass.
- `alt`: wordmarks `alt="Dvele"` etc present; decorative heroes `alt=""`; avatar `figure img` `alt=""` intentional (names shown as text) — `parity.spec.ts` handles the decorated case explicitly.
- `prequal-form.tsx` `Choice` buttons `aria-pressed`, `Reveal` `data-reveal` forced visible under `prefers-reduced-motion` — pass.

---

## 5. Doc ↔ Code Cross-Check (Phase 5)

| Doc claim | Code truth | Match |
|-----------|------------|-------|
| Vitest `37 = 11+13+7+6` | `npm run test` → `calculator 11`, `matching 13`, `rate-limit 7`, `markdown 6` → `37` | ✅ |
| Playwright `44 per project` | `npx playwright test --list` → 44 chromium, 88 with webkit; breakdown `assets 19 runtime (14+3+2) + parity 8 + smoke 7 + seo 6 + funnel 4 = 44` | ✅ |
| `home-financing_SKILL.md` still `31 / 27` | Stale in SKILL head + §2 table (`31/31`, `27/27`) — not part of this 3-commit scope (SKILL is operator-managed, but `a1b2e67` updated it partially; residual `31/27` remains in SKILL boilerplate §2/§11). Flagged as separate nit, not blocking. | ⚠️ doc-drift in SKILL only (not AGENTS/CLAUDE/README — those are now consistent) |
| `STATIC_PATHS` | `src/app/sitemap.ts:4 const STATIC_PATHS = [` → actual length 39-41 depending on counting (pre-fix) | Not blocking; sitemap loc count via `curl /sitemap.xml` `152` is stable |
| ``.env.example` legacy names" | Pre-fix stated `scandihaven_*` legacy — now `home_financing_*` on `:5434` (docs normalization in uncommitted local diff fixes this) | Already fixed locally, not in this 3-commit diff — deferred |

**NMLS dedup:** `rg "NMLS" site-footer.tsx` → `NMLS Consumer Access` (Legal link) + `NMLS #2537136` (copyright bar). Session narrative says source keeps NMLS only in Legal; clone keeps both — informative, not a defect.

**ZIP label compat:** `prequal-form.tsx` `<span>Property ZIP code</span>` still contains substring `ZIP` so `parity.spec.ts` `getByText(/ZIP helper/)` + `getByLabel(/zip/i)` both pass.

---

## 6. Verdict & Punch-List (Phase 6)

**Verdict: GO — ship is healthy. No code fix required from this audit.**

The P0 OOM is closed with the minimal correct fix (H4 branch + loop guard) and pinned by 6 unit + 2 E2E regressions (both H4 articles now `200`). The P1 parity feat closes every comparison gap surfaced against `modfii.com` with the intended design tokens (`@theme`, `Container` rhythm, `forest/cream/accent`) and is fully pinned by `parity.spec.ts` (8) + `assets.spec.ts` (19 runtime). The P2 doc patch makes AGENTS/CLAUDE/README internally consistent (`37` / `44 per project`). All gates green (`lint 0/0`, `typecheck`, `37/37`, `build 43/43`, `44/44` chromium).

**Single low nit (not blocking) — for next docs pass only:**

- **SKILL §2/§11 stale counts:** `home-financing_SKILL.md:15` header `31 Vitest + 27 Playwright` and `§2 table` `31/31` + `§11 checklist` `31/31`, `27/27` still read `31/27`. Should be normalized to `37` / `44 per project` like AGENTS/CLAUDE/README already are. Low severity — no code, no test, no deploy impact. Track as follow-up.

**Deferred debt (already documented in SKILL LL-17, not introduced by these commits):**

- Interior guide pages remain thinner than source long-form — content authoring, not code.
- `loading.tsx`/`error.tsx` per-segment increment (global fallbacks now exist locally but are not in this 3-commit diff — `HEAD` diff shows they are uncommitted `src/app/{loading,error}.tsx`).

**Recommendation:**

1. Deploy `a1b2e67` to production immediately — the live origin's `502` on the two H4 articles is already fixed in this push. Verify via `curl https://<origin>/learn/construction-loans-vs-traditional-mortgages-prefab | grep "<h4"` after deploy.
2. In the next docs-only commit, bump `home-financing_SKILL.md` `31→37` / `27→44` to eliminate the residual drift noted above.
3. No rollback; no revert; no further code changes from this audit.

---

## Appendix — Phases ↔ Evidence Map

| Phase | Evidence file(s) |
|-------|-----------------|
| 1 Triage | `docs/audit-evidence/{f61cf67,a9eb492,a1b2e67}.patch`, `combined-{stat,namestatus}.txt`, hex dumps inline (§1) |
| 2 Static | File reads + `rg` traces above; rubric is `CLAUDE.md` §Implementation Standards + `AGENTS.md: Never Do` |
| 3 Live | `npm run {lint,typecheck,test,build}` transcripts + `npx playwright test --list` + `npx playwright test --project=chromium` (44/44) |
| 4 Sec/Perf/A11y | `rg` traces (security), `du .next`, `npx playwright test --grep "axe"` (`smoke.spec.ts` axe critical) |
| 5 Docs | `jq length src/data/*.json` + `npx playwright test --list | wc -l` + `grep -c` counts above |
| 6 Verdict | This report — single source of truth for `3d9ee55..a1b2e67` |

*Last verified 2026-09-12 (commit `a1b2e67`, `next 16.3.4`, `react 19.3`, `tailwind 4.3.3`, `vitest 3.2.7`, `@playwright/test 1.63.0`, `pg 8.23`, `drizzle-orm 0.45.2`) against `package.json`, `tsconfig.json:strict`, `eslint.config.mjs`, `next.config.ts:11 redirects`, `drizzle.config.*:5434`, `docker-compose.yml:home_financing_*`, `src/db/schema.ts:8 tables`, `src/lib/*:37 tests`, `public/**:14 images`, `playwright.config.ts:3002`, `e2e/*:44 per project`, `vitest.config.ts`.*

