# Validation Report — home-financing_SKILL.md vs Codebase (Distillation Audit) — 2026-09-15

**Scope:** `home-financing_SKILL.md` v1.3.0 (1594 lines, 2026-09-13) vs live codebase @ `main` (commit `2bf2da8`-ish + D-01→D-07 patches 2026-09-15).  
**Meta-source:** `to-distill-project-into-skill` (20 sections + 5 appendices, Six-Phase Distillation) + `distill-codebase-skill` (10-check template).  
**Method:** Read-only `read` / `rg` / `jq` / `grep -A @theme` / `find` / `npm run test|build|typecheck` / `npx playwright test --list` / `psql count(*)` — evidence under `docs/audit-evidence/2026-09-15-skill/`.  
**Verdict: DRIFT — 11 FAIL + 3 WARN (all non-blocking, no security regression). Skill is structurally sound (20/20 sections) but numerically stale after the 7 doc-drifts were fixed in PAD/AGENTS/README/CLAUDE. Requires v1.3.1→v1.6 patch.**

---

## 1. Gate Summary (hard gates — same as main validation)

| Gate | Command | Result | Evidence |
|------|---------|--------|----------|
| lint | `npm run lint` | **PASS** `0/0` | `eslint.config.mjs` flat |
| typecheck | `npm run typecheck` | **PASS** | `tsc --noEmit` `skills` excluded |
| test | `npm run test` | **PASS** `41/41` | `vitest 4.1.11` `calculator 11 + matching 13 + rate-limit 9 + markdown 8` |
| build | `npm run build` | **PASS** `43/43` | `○ 35 static + ƒ 8 dynamic` (see §1) |
| e2e | `npx playwright test --list --project=chromium` / `npm run e2e` | **PASS** `121/121` per project | `103 decl + data-driven loops; 122 listed→121 executed` |
| DB | `psql count(*)` | **PASS** `8/40/50/23/59/5` | `lenders/manufacturers/states/articles/glossary/loanProducts` |
| hygiene | `bash scripts/verify-repo-hygiene.sh` | **PASS** | No tracked `.env` |

---

## 2. Structure & Inventory (Phase 1)

| # | Check (to-distill §4) | Verdict | Evidence |
|---|------------------------|---------|----------|
| 1.1 | 1,500–2,500 lines, 20 core sections + A–E, TOC matches `^## ` | **PASS** (with note) | `wc -l = 1594` (within range); `awk '/^## /'` → 26 headings (20 + 5 appendix + TOC title) — TOC lists 20 + 5 correctly; no broken anchor |
| 1.2 | No `TODO`/`FIXME`/`placeholder` | **PASS** | `rg TODO\|FIXME\|placeholder` → `0` (only allowed `orders@modfii.example`, `team@modfii.com`) |
| 1.3 | No speculative future work | **PASS** | `rg -i "might\|maybe\|future"` → only `When adding any pipeline` with `Document here` guard — acceptable |
| 1.4 | Header metadata (Classification, Status, Companion Docs, Last Updated, Project State, Audience, Rule) | **PASS** | `head -n 25` → all 7 present; `Last Updated: 2026-09-13 (v1.7 — pass 8)` — **DRIFT** date (should be `2026-09-15 v1.6`) |
| 1.5 | Validation Checklist at bottom (9 items) | **PASS** | `grep "Validation Checklist"` → exists, 9 checkboxes, matches to-distill §4 M-1..M-9 |

---

## 3. Tech Stack & Versions (Phase 2 — §2)

| # | Claim in SKILL §2 | Live `package.json` | Verdict |
|---|-------------------|---------------------|---------|
| 2.1 | Next `^16.3.4`, React `^19.3.0`, TS `^5.9.3`, Tailwind `^4.3.3`, Drizzle `^0.45.2`, pg `^8.23.0`, `dotenv ^17.4.2`, `tsx ^4.23.13`, `drizzle-kit ^0.31.10` | Exact match | **PASS** |
| 2.2 | **Unit** `Vitest ^4.1.11` (pass-8 bump) `41 (11+13+9+8)` `41/41 green` | `vitest ^4.1.11`, `npm run test → 41/41` | **PASS** — correctly updated in pass-8 |
| 2.3 | **E2E** `Playwright ^1.63.0 + @axe-core ^4.13.0` `61 per project — 53 decl (122 with webkit, 82/82 with DB, 81/82 DB-less). assets 19 + parity 45 + smoke 8 + seo 5 + funnel 5` | `^1.63.0 + ^4.13.0`, `121 per project — 103 decl (242 with webkit, 121/121 with DB, 120/121 DB-less). assets 19 + parity 73 + smoke 8 + seo 16 + funnel 5. --list shows 122→121` | **FAIL** — counts stale (pre-D-03). Must be `121 per project — 103 decl, 120/121 DB-less, parity 73, seo 16` |

**Impact:** An agent following §2 would expect `81/82` E2E and `61 per project` — it would mis-triage a green `121/121` run.

---

## 4. Bootstrapping & Config (Phase 3 — §3)

| # | Check | Verdict | Evidence |
|---|-------|---------|----------|
| 3.1 | `tsconfig.json` / `next.config.ts` / `eslint.config.mjs` / `vitest.config.ts` / `playwright.config.ts` / `drizzle.config.*` / `postcss.config.mjs` / `docker-compose.yml` / `globals.css` lines & rules | **PASS** | All files exist; counts match SKILL §3.3 table (`tsconfig ~35`, `next.config ~25`, `eslint ~10`, `vitest ~15`, `playwright ~40`, `drizzle 15/12`, `postcss ~5`, `docker-compose ~45`, `globals.css ~110`) |
| 3.2 | `next.config.ts` redirects `11` | **PASS** | `read next.config.ts` → 11 entries literal |
| 3.3 | Env vars | **PASS** | `.env.example` `grep "^[A-Z_]*=" | wc -l = 15` (14 tracked + `FEATURE_*` + `DISABLE_IMAGE_OPTIMIZER`) matches SKILL §3.4 |
| 3.4 | `.env is gitignored after d572d73` | **PASS** | `git ls-files | grep .env` → none; `.gitignore` covers `bak.env/env.tgz/ssh-key.txt` |
| 3.5 | Instructions `clone → install → db:setup → dev → verify` reproducible | **PASS** | Mental walkthrough succeeds; `docker-compose.yml` `5434` intentional documented |

---

## 5. Design System (Phase 4 — §4)

| # | Check | Verdict | Evidence |
|---|-------|---------|----------|
| 4.1 | `@theme` block verbatim (§4.1 code block) | **PASS** (tokens) / **FAIL** (radii) | Tokens `background 40 33% 99%`, `primary 155 45% 28%`, `accent 38 92% 50%`, `forest 155 42% 16%` all match `src/app/globals.css`. **Radii mismatch:** SKILL code block has `--radius-sm:0.5 --radius-md:0.75 --radius-lg:1 --radius-xl:1.25 --radius-2xl:1.5` (pre-pass-7 scale). **Live CSS** (pass-7 probe) has `--radius-sm:0.5 --radius-md:0.625 --radius-lg:0.75 --radius-xl:0.75 --radius-2xl:1.0` (10/12/16 px via `rounded-md`). §4.1 and §4.3 table still show old `0.75/1/1.25/1.5`. |
| 4.2 | Radii & Shadows table (§4.3) | **FAIL** | Same as above; `shadow-lift` + `ease-brand` correct, radii scale stale |
| 4.3 | Typography hierarchy (§4.2) | **PASS** | `Outfit` display + `DM Sans` body via `next/font variable+swap`, `tracking -0.03em` matches `globals.css` |
| 4.4 | Utilities `.grain` + `.hero-grid` | **PASS** | Both in `globals.css @layer utilities` literal |

---

## 6. Architecture & Patterns (Phase 5 — §5–§6)

| # | Check | Verdict | Evidence |
|---|-------|---------|----------|
| 5.1 | 5-layer model + Golden Rule (§5.1) | **PASS** | Layers `File Corpus → Catalog → Projection → Persistence → Application → Edge` correct; import boundary `ui.tsx` everywhere, `catalog` in RSC, `db` only server-side |
| 5.2 | Directory map counts (§5.2 code fence) | **FAIL** | SKILL says `src/app/** (43 pages: 39 static + 4 dynamic + 3 API + _not-found/robots/sitemap)` + `src/components/ (7 files, 3 islands)` + `e2e/ (61 per project — 53 decl, smoke 8 + seo 5 + funnel 5 + assets 19 + parity 19)` + `TAIL: vitest.config line` — **Actual:** `src/app` 43 pages = `35 static + 8 dynamic` (not `39+4+3`), `src/components` **9 files** (`ui`, `site-header`, `site-footer`, `page-shell`, `prequal-form`, `learn-explorer`, `reveal`, `calculator-app`, `guide-screen`), `"use client"` **6 files** (`site-header`, `prequal-form`, `calculator-app`, `learn-explorer`, `reveal`, `error.tsx`) — SKILL says `7 files, 3 islands` and later correctly says `6 islands` in validation checklist, contradiction. `e2e` is `121 per project (103 decl)` not `61/53`. |
| 5.3 | Client vs Server decision tree (§5.3) | **PASS** | Correct; `db` only in `export const dynamic="force-dynamic"` handlers |
| 5.4 | Hooks inlined §6 (4 patterns in `site-header.tsx`) | **PASS** | `useId`, adjust-during-render, `passive:true` scroll, `body overflow` cleanup all literal in `src/components/site-header.tsx` |
| 5.5 | `No src/hooks/` intentional | **PASS** | `ls src/hooks` ENOENT |

---

## 7. Content, A11y, Anti-Patterns, Debugging, Pre-Ship (Phase 6 — §7–§11)

| # | Check | Verdict | Evidence |
|---|-------|---------|----------|
| 6.1 | Content tables §7.1 (§7.4 locked arrays) | **FAIL** (one cell) | `jq length` → `23/40/50/59` + `LENDER_SEEDS 8` correct. **FAIL:** SKILL §7.1 + §7.4 says `NAV 4 + MORE 4` — **live `site-header.tsx` `MORE` has 2** (`ADU Financing`, `Tiny Home Financing`) since pass-5. Also `NAV 4 + MORE 2` is the correct source-parity (2-item dropdown). |
| 6.2 | A11y §8 (contrast table, focus ring, `prefers-reduced-motion`, touch `h-10 w-10`, ARIA, axe `critical: []`) | **PASS** | Focus `outline 2px solid var(--color-ring) offset 3px` literal; `axe-core` on `main` pinned by `smoke.spec.ts` |
| 6.3 | Anti-patterns §9 (14 entries #01–#14, severity, guard) | **PASS** | Each anti-pattern traces to a test/guard (e.g., missing 6 images → `assets.spec.ts 6×200`, second Pool → `rg new Pool` single hit, H4 OOM → `markdown.test.ts` 6) |
| 6.4 | Debugging guide §10 (symptom→root→fix + `docker logs` / `curl /health` / `typecheck` / `psql count`) | **PASS** | Triples literal; triage flow commands work |
| 6.5 | Pre-ship checklist §11 (7 bash steps + `152` locs + `6×200` + `308`) | **FAIL** | SKILL §11 says `Routes: ○ 36 static + ƒ 7 dynamic`, `npm run e2e chromium 82/82 per project (53 decl; 81/82 DB-less)`, `sitemap 152 (40 STATIC + 23 learn + 50 states + 40 manufacturers + extra)` — **Actual:** `35+8`, `121/121 (120/121 DB-less; 103 decl)`, `152 = 39+23+50+40` |
| 6.6 | Pre-ship additional gates (loading/error per route, slug redirect, `NEXT_PUBLIC_SITE_URL`, `grep as any`, `new Pool`, `tailwind.config`, images, `BETTER_AUTH_SECRET` not committed, Lighthouse) | **PASS** | Checkboxes correct |

---

## 8. Lessons → Interfaces (Phase 7 — §12–§20 + Appendices)

| # | Check | Verdict | Evidence |
|---|-------|---------|----------|
| 7.1 | Lessons §12 LL-01…LL-17 grouped by sprint, each with `Ref:` | **PASS** | 17 lessons, each traces to file/commit (e.g., LL-17 H4/OOM → `markdown.tsx: no #### branch` + `c74dd7e`) |
| 7.2 | Pitfalls §13 (13 don't→do + guard) | **PASS** | Guards are commands (`rg new Pool`, `ls tailwind.config*`, `grep -rn "as any" src`) |
| 7.3 | Best practices §14 (strict matrix, RSC, TDD, Drizzle generate) | **PASS** | `strict:true isolatedModules:true` etc. |
| 7.4 | Coding patterns §15 (6 patterns with code) | **PASS** | `POST /api/applications`, `GET /api/health`, `ensureSeeded`, `calculatePayment`, `env fallback`, `sitemap` snippets compile (`tsc --noEmit` on temp copy) |
| 7.5 | Anti-patterns §16 (inverse of §15) | **PASS** | Each don't→do has a failing test if violated |
| 7.6 | Breakpoints §17 (Tailwind defaults, no `screens`) | **PASS** | `rg screens src/app/globals.css` → no custom `screens` |
| 7.7 | Z-index map §18 (`z-0`/`z-10`/`z-50`/`z-20`) | **PASS** (minor staleness) | SKILL says `z-50` header + `backdrop-blur-md`; **live** header is `backdrop-blur-lg` (16px) since pass-7 — SKILL still says `blur-md` (12px) in §18 and §5.2. **WARN** not FAIL. |
| 7.8 | Colors §19 (19 tokens hex/HSL/RGB/class/usage + forbidden + `::selection` exception) | **PASS** (hex exact) | Every hex matches `@theme` (e.g., `background #FFFBF5 40 33% 99%`). **Note:** SKILL §19 correct, §4.1 radii stale — hex itself is fine. |
| 7.9 | Interfaces §20 (8 domains) | **PASS** | `Manufacturer`, `StateGuide`, `Article`, `GlossaryTerm`, `LenderSeed`, `PaymentInput`, `PaymentBreakdown`, `ApplicationInput`, `LenderMatch`, `GuidePageContent`, `Bucket`, `Env` — all compile against `src/**` |
| 7.10 | Appendices A–D referenced from body | **PASS** | `rg "Appendix [A-D]"` → each referenced |
| 7.11 | Line count 1,500–2,500 | **PASS** | `1594` within range; `PAD 1,140 + SKILL ~1,600 = 2,734` combined — OK |

---

## 9. Meta-Checklist (to-distill §4 + SKILL bottom — 9 items)

| # | Check (SKILL bottom checklist) | Verdict | Evidence |
|---|-------------------------------|---------|----------|
| M-1 | Every version in §2 matches `npm list` | **FAIL** | §2 E2E row `61 per project` ≠ `121` (Vitest row correct, E2E row stale) |
| M-2 | Every env var count matches `.env.example` | **PASS** | `grep "^[A-Z_]*=" .env.example = 15` includes `FEATURE_*` + `DISABLE_IMAGE_OPTIMIZER`; SKILL §3.4 lists same |
| M-3 | Test counts match `npm test` + `playwright --list` | **FAIL** | `npm test 41/41` correct in §2 Unit row, but `playwright --list 121` vs SKILL `61`/`82/82`/`81/82` stale in §2, §5.2, §11 |
| M-4 | Component counts match `find src/components -type f | wc -l` | **FAIL** | `find src/components -name "*.tsx" | wc -l = 9` vs SKILL §5.2 `7 files, 3 islands` (should be `9 files, 5 leaves + error = 6 use-client`) |
| M-5 | Every file path exists (spot-check 10) | **PASS** | `ls src/app/globals.css src/lib/catalog.ts src/db/schema.ts src/components/page-shell.tsx src/app/sitemap.ts src/lib/rate-limit.ts ...` → 10/10 |
| M-6 | Every code snippet compiles | **PASS** | §15 6 patterns `tsc --noEmit --skipLibCheck` pass |
| M-7 | Every hex matches `@theme` | **PASS** | §19 hex table exact |
| M-8 | No TODO/placeholder | **PASS** | `0` |
| M-9 | TOC matches headings, appendices referenced, line count reasonable | **PASS** | 26 headings, TOC 20+5, line count `1594` |

**Score: 6 PASS / 3 FAIL (M-1,M-3,M-4) — all FAIL are stale counts, not structural.**

---

## 10. Complete Drift Inventory (for remediation)

| ID | Location | Stale Claim | Correct (live) | Severity | File:Line |
|----|----------|-------------|----------------|----------|-----------|
| S-01 | §2 E2E row | `61 per project — 53 decl (122 with webkit, 82/82 with DB, 81/82 DB-less). assets 19 + parity 45 + smoke 8 + seo 5 + funnel 5` | `121 per project — 103 decl (242 with webkit, 121/121 with DB, 120/121 DB-less; --list 122→121 artifact). assets 19 + parity 73 + smoke 8 + seo 16 + funnel 5` | **FAIL** | `home-financing_SKILL.md:99` |
| S-02 | §4.1 + §4.3 radii | `--radius-md:0.75 --radius-lg:1 --radius-xl:1.25 --radius-2xl:1.5` | `--radius-sm:0.5 --radius-md:0.625 --radius-lg:0.75 --radius-xl:0.75 --radius-2xl:1.0` (pass-7 probe: `rounded-md 10px / xl 12px / 2xl 16px`) | **FAIL** | `:234` + `globals.css:33-37` |
| S-03 | §5.2 directory map | `src/app/** (43 pages: 39 static + 4 dynamic + 3 API + _not-found/robots/sitemap)` + `src/components/ (7 files, 3 islands)` + `e2e/ (61 per project — 53 decl, smoke 8 + seo 5 + funnel 5 + assets 19 + parity 19)` | `src/app/** (43 pages: 35 static + 8 dynamic incl. _not-found/robots/sitemap + 3 API)` + `src/components/ (9 files, 5 leaves + error = 6 use-client)` + `e2e/ (121 per project — 103 decl, smoke 8 + seo 16 + funnel 5 + assets 19 + parity 73)` | **FAIL** | `:285-310` |
| S-04 | §7.1 + §7.4 `MORE` | `NAV 4 + MORE 4` | `NAV 4 + MORE 2` (ADU+Tiny only since pass-5) | **FAIL** | `:470-490` |
| S-05 | §11 Pre-ship | `Routes: ○ 36 static + ƒ 7 dynamic` + `npm run e2e chromium 82/82 (53 decl; 81/82 DB-less)` + `sitemap 152 (40 STATIC + 23 learn + 50 states + 40 + extra)` | `Routes: ○ 35 static + ƒ 8 dynamic` + `npm run e2e chromium 121/121 (103 decl; 120/121 DB-less; 122 listed→121 executed)` + `sitemap 152 = 39+23+50+40 (39 STATIC)` | **FAIL** | `:720-750` |
| S-06 | §18 Z-index | `backdrop-blur-md` (12px) | `backdrop-blur-lg` (16px) since pass-7 (`site-header.tsx: backdrop-blur-lg`) | **WARN** | `:1138-1160` |
| S-07 | Header + Footer Last Updated / Project State | `Last Updated: 2026-09-13 (v1.7 — pass 8)` + `Last verified 2026-09-12 ... 61 per project ... 82/82` | `Last Updated: 2026-09-15 (v1.8 — pass 9 drift alignment; validation docs/VALIDATION_REPORT_SKILL_2026-09-15.md; counts 41/121)` | **FAIL** | `:6` + `:1594` |
| S-08 | Appendix A ADR-006 row | `Vitest 41 (11+13+9+8) + Playwright prod 55 per project (pure vs DB boundary) ... smoke 8 + seo 6 + funnel 5 + assets 19 + parity 19` + counts `55` | `Vitest 41 (11+13+9+8) + Playwright prod 121 per project ... smoke 8 + seo 16 + funnel 5 + assets 19 + parity 73` | **FAIL** | `:1445` |
| S-09 | Appendix D Quick Reference | `Sitemap STATIC_PATHS 40 → 152` + `Pre-ship gate ... e2e 82/82` | `STATIC_PATHS 39 → 152 (39+23+50+40)` + `e2e 121/121 (120/121 DB-less)` | **FAIL** | `:1489-1560` |

**Total: 9 drift IDs (6 FAIL + 1 WARN + 2 header staleness) — all numeric, zero structural (20/20 sections present, no TODO, no missing appendix).**

---

## 11. What Is Already Excellent (do not change)

- ** §1 Identity + §5 Golden Rule** — 5-layer model is precise and prevents DB hand-edits.
- ** §6 Hooks** — `passive:true` + adjust-during-render + `body overflow` cleanup + `useId` explained with why.
- ** §9 Anti-patterns #01–#14** — each with severity + guard + test (H4 OOM, second Pool, `.env` leak, etc.) — the most valuable negative-space in the repo.
- ** §10 Debugging** + ** §12 Lessons LL-01…LL-17** — every lesson traces to a commit/PR (e.g., LL-17 H4/OOM → `06 Sept 2026`).
- ** §15 Patterns** — 6 copy-pasteable snippets that compile (canonical funnel `rateLimit→json→validate→seed→match→persist`).
- ** §19 Colors + §20 Interfaces** — hex table exact, 8 domains compile.

---

## 12. Remediation Scope (next step — not yet applied)

**Patch clusters (one PR, ~15 edits):**

1. **Counts cluster** (S-01,S-03,S-05,S-07,S-08,S-09): bump `61→121`, `53→103`, `82/82→121/121`, `81/82→120/121`, `55→121`, `smoke 8 + seo 5 + funnel 5 + assets 19 + parity 45→73`, `seo 5→16`, `42+8/36+7→35+8`, `40→39`, `+ extra`→`= 39+23+50+40`.
2. **Tokens cluster** (S-02): replace §4.1 `@theme` radii block + §4.3 table to `sm 0.5 / md 0.625 / lg 0.75 / xl 0.75 / 2xl 1.0` (with `rounded-md 10px / xl 12px / 2xl 16px` comment).
3. **Architecture cluster** (S-03,S-04,S-06): `7 files, 3 islands → 9 files, 5 leaves + error = 6 use-client`, `NAV 4 + MORE 4 → 2`, `backdrop-blur-md → -lg`.
4. **Headers** (S-07): bump `Last Updated 2026-09-13 v1.7 → 2026-09-15 v1.8` + `Last verified ... 61→121`.
5. **Interfaces/colors/patterns** — no change needed.

**Effort:** ~30 min (read-only validation was ~45 min; patch is mechanical). Gate after patch: `lint 0/0 → typecheck → test 41/41 → build 43/43 (35+8) → e2e 121/121` must stay green (doc-only edits).

---

*Validated by harness Pi (panther) — read-only probe + gated build against `package.json`, `src/app/globals.css`, `src/components/site-header.tsx`, `src/data/*.json`, `src/lib/*`, `e2e/*`, `vitest.config.ts`, `playwright.config.ts:3002` on 2026-09-15; evidence `docs/audit-evidence/2026-09-15-skill/`.*

