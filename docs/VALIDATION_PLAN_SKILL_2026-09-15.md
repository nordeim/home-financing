# Validation Plan — home-financing_SKILL.md vs Codebase (Distillation Audit)

> **Meta-source:** `to-distill-project-into-skill` (20 sections + appendices, Six-Phase Distillation) + `distill-codebase-skill` (reference template / 10-check verification).
> **Target:** `home-financing_SKILL.md` v1.3.0 (2026-09-13) — claims 1,595 lines, 20 sections + A–E, produced via Six-Phase distillation.
> **Context:** Main docs (`AGENTS.md`, `CLAUDE.md`, `README.md`, `PAD` v1.6) were just patched D-01→D-07 to 41 unit / 121 E2E (103 decl), build `35+8`, sitemap `39→152`, vitest `4.1.11`. The SKILL still reports stale counts (`61 per project — 53 decl, 82/82`, `37 unit` in footer, `36+7` routes, `40 STATIC_PATHS`). This plan proves every SKILL claim against the live codebase before remediating.

---

## Executive Summary

The SKILL is the **negative-space companion** to `PAD` — it must be *more* detailed on what-not-to-do, how-to-debug, and how-to-avoid-repeating 2026-09-11 incidents. A drifted SKILL misleads agents worse than no SKILL. This audit will check **every verifiable claim** (versions, file paths, line counts, hex tokens, interface shapes, anti-pattern guards, test counts, route counts) and every **completeness rule** (20 sections present, TOC matches headings, no TODO/placeholder, no speculative future work).

**Deliverable after execution:** `docs/VALIDATION_REPORT_SKILL_2026-09-15.md` — PASS/FAIL/DRIFT per section + per-checklist item + remediation patch list (file:line citations).

---

## What We Already Know (Phase 1 Archaeology — done)

| Fact | SKILL Claim (v1.3.0) | Live Codebase (2026-09-15) | Drift? |
|------|----------------------|----------------------------|--------|
| **Identity** | 13-field funnel (12 req + `manufacturerSlug`) → content+transaction hybrid | `src/lib/matching.ts:ApplicationInput` 12 req + optional `manufacturerSlug` — matches | ✅ |
| **Stack** | Next `^16.3.4`, React `^19.3.0`, TS `^5.9.3`, Tailwind `^4.3.3`, Drizzle `^0.45.2`, pg `^8.23.0`, Vitest `^4.1.11`, Playwright `^1.63.0` | `package.json` pins match (Vitest `^4.1.11` pass-8 bump) — but SKILL §2 E2E row says `61 per project — 53 decl, 82/82` | **FAIL** — counts stale |
| **Unit tests** | §2 says `41 (11+13+9+8)` correct in some places, but §11 footer says `61 per project` / `81/82 DB-less` / `53 decl` | `npm run test → 41/41`, `npm run e2e --project=chromium → 121/121 (120/121 DB-less, 103 decl; --list 122)` | **FAIL** |
| **Build routes** | §5 says `43 pages: 39 static + 4 dynamic + 3 API + …` and §11 says `○ 36 static + ƒ 7 dynamic` | `npm run build → 43/43 (35 static + 8 dynamic)` | **FAIL** — arithmetic drift |
| **Sitemap** | `STATIC_PATHS 40 → 152`, later `39 exact /* see file */` (contradiction inside SKILL) | `src/app/sitemap.ts` `STATIC_PATHS.length === 39` → `152 = 39+23+50+40` | **DRIFT** — 40 stale |
| **Design tokens** | §4 verbatim `@theme` block with 14 tokens + radii | `src/app/globals.css` is sole source — needs hex-by-hex diff | **UNVERIFIED** |
| **Components** | §5 `src/components/ (7 files, 3 islands)` / `src/app/** (43 pages)` | Actual `find src/components -name "*.tsx" | wc -l` → 9? (incl. `reveal.tsx`, `learn-explorer.tsx`) — SKILL says 7 | **DRIFT** |
| **Hooks** | §6 `no src/hooks/`, inlined in `site-header.tsx` (4 patterns) | `grep -r "'use client'" src/` → 6 files (header, prequal, calculator, learn-explorer, reveal, error) — SKILL says 5+error | **DRIFT** |
| **Content** | §7 `8/40/50/23/59/5` + `NAV 4 + MORE 4` | `jq length` → 23/40/50/59 correct, but `MORE` is 2 (ADU+Tiny) not 4 | **FAIL** |
| **A11y** | §8 contrast table, focus ring, `prefers-reduced-motion`, axe `critical: []` | `e2e/smoke` axe includes `main` — needs re-probe | UNVERIFIED |
| **Pre-ship** | §11 gate `db:setup → lint → typecheck → test 41/41 → build 43/43 → e2e 82/82 (81/82 DB-less)` | Current gate `121/121 (120/121 DB-less)` | **FAIL** |

**Single biggest risk:** An agent following §11 or §2 would expect `81/82` E2E and `61 per project` — it would mis-triage a green `121/121` run as "too many tests" or miss the `6 vs 5` client-island discrepancy.

---

## Validation Plan — 7 Phases (read-only, no code edits)

Each phase lists **claims to check → evidence command / file read → pass criterion**. Phases run sequentially; Phase 1 blocks the rest if SKILL file is unreadable.

### Phase 1 — Inventory & Structure (does the SKILL exist as a distillation?)

| # | Check (from `to-distill` §3) | Evidence | Pass |
|---|------------------------------|----------|------|
| 1.1 | SKILL file exists, 1,500–2,500 lines, 20 sections + appendices A–E, TOC matches `^## ` headings | `wc -l home-financing_SKILL.md` + `awk '/^## /{print}'` vs TOC | `1,595` lines, 20 sections present, TOC entries === `## ` headings, no broken anchor |
| 1.2 | No `TODO`/`FIXME`/`placeholder`/`example.com` (except allowed `orders@modfii.example`, `team@modfii.com`) | `rg -n "TODO\|FIXME\|placeholder" home-financing_SKILL.md` | `0` (or only allowed) |
| 1.3 | No speculative future work ("We might switch to X") without rationale | `rg -n "might|maybe|future|planned" home-financing_SKILL.md -i` | `0` or each has `when adding` + ADR note |
| 1.4 | Header metadata present (Classification, Status, Companion Docs, Last Updated, Project State, Audience, Rule) | `head -n 30 home-financing_SKILL.md` | All 7 fields, `Last Updated` date matches latest validation (currently 2026-09-13 → should be 2026-09-15) |
| 1.5 | Validation Checklist at bottom is complete (9 checks) | `grep -A 12 "Validation Checklist" home-financing_SKILL.md` | Exists and matches `to-distill` §4 |

### Phase 2 — Tech Stack & Versions (§2) — Accuracy

| # | Claim | Evidence | Pass |
|---|-------|----------|------|
| 2.1 | Every version in §2 table matches `package.json` exactly (no `^16.x` ranges without lock) | `read package.json` vs `read §2` row-by-row | Next `^16.3.4`, React `^19.3.0`, TS `^5.9.3`, Tailwind `^4.3.3`, Drizzle `^0.45.2`, pg `^8.23.0`, Vitest `^4.1.11` (not `^3.2.7`), Drizzle Kit `^0.31.10`, etc. |
| 2.2 | E2E row counts | `npx playwright test --list --project=chromium` + `npm run e2e -- --reporter=list` | `121 per project (103 decl; 122 listed→121 executed; 242 with webkit)`, not `61 per project — 53 decl, 82/82` |
| 2.3 | Unit row counts | `npm run test 2>&1 | grep Tests` | `41 (11+13+9+8)`, not `37` |
| 2.4 | No generic framework tutorial — only project-specific notes (e.g., `images.unoptimized:true intentional`) | `rg -n "images.unoptimized" home-financing_SKILL.md` | Present with rationale |

### Phase 3 — Bootstrapping & Config (§3) — Completeness

| # | Claim | Evidence | Pass |
|---|-------|----------|------|
| 3.1 | `tsconfig.json` / `next.config.ts` / `eslint.config.mjs` / `vitest.config.ts` / `playwright.config.ts` / `drizzle.config.*` / `postcss.config.mjs` / `docker-compose.yml` lines & non-obvious rules | `read` each config vs SKILL §3.3 table | `tsconfig strict:true isolatedModules:true @/* exclude:skills`, `next.config 11 redirects images.unoptimized:true`, `eslint globalIgnores(.next,skills,infrastructure)`, `vitest node env include src/**/*.test.ts`, `playwright PORT 3002 reuseExistingServer`, `drizzle out:./drizzle strict verbose url …@5434`, `postcss tailwindcss via @tailwindcss/postcss` |
| 3.2 | Env vars count & `FEATURE_*` fail-fast | `read .env.example` vs `§3.4` table | 14 tracked (`DATABASE_URL`, `BETTER_AUTH_*`×3, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `STRIPE_*`×3, `RESEND_API_KEY`, `EMAIL_FROM`, `AUTH_*`×4, `FEATURE_*`, `DISABLE_IMAGE_OPTIMIZER`) |
| 3.3 | `.env is gitignored after d572d73` | `rg "d572d73" .gitignore` + `git ls-files | grep .env` | No tracked `.env` |
| 3.4 | Instructions enable `clone → install → db:setup → dev → verify` | Mental walkthrough of `§3.5` | Reproducible in order |

### Phase 4 — Design System (§4) — Token-by-Token

| # | Claim | Evidence | Pass |
|---|-------|----------|------|
| 4.1 | `@theme` block verbatim — every hex/HSL matches `src/app/globals.css` | `grep -A 60 "@theme" src/app/globals.css` vs `§4.1` code block | Exact HSL: `background 40 33% 99%`, `primary 155 45% 28%`, `accent 38 92% 50%`, etc.; hex in §19 must also match |
| 4.2 | Radii scale `sm 0.5rem → 2xl 1.5rem` + `shadow-lift` + `ease-brand` | `read globals.css` | Values literal |
| 4.3 | Typography hierarchy (`Outfit` display + `DM Sans` body, `tracking -0.03em`) | `read src/app/layout.tsx` (`next/font` `variable+swap`) vs `§4.2` | Match |

### Phase 5 — Architecture & Components (§5–§6) — Boundaries

| # | Claim | Evidence | Pass |
|---|-------|----------|------|
| 5.1 | 5-layer model + Golden Rule (§5.1) | `read §5.1` vs `AGENTS.md` / `PAD` Layer 0–5 | Layers file-backed → catalog → projection → persistence → application → edge; import boundaries correct |
| 5.2 | Directory map counts (§5.2) | `find src/app -type f | wc -l` + `find src/components -name "*.tsx" | wc -l` + `find src -name "*.test.ts" | wc -l` + `wc -l src/data/*` + `grep -r "'use client'" src/ --include="*.tsx" | wc -l` | `src/app/** 43 pages (35 static + 8 dynamic incl. _not-found/robots/sitemap)`, `src/components 9 files (5 client leaves + ui + footer + page-shell + guide-screen)`, `src/lib/*.test.ts 4 files`, `src/data 2771 lines` |
| 5.3 | Client vs Server decision tree (§5.3) | `read §5.3` vs code | Correct `useState/useEffect/onClick → use client`, else Server; `db` only in Route Handlers with `force-dynamic` |
| 5.4 | Hooks inlined (§6) — 4 patterns in `site-header.tsx` | `read src/components/site-header.tsx` | `useId`, adjust-during-render, `passive:true` scroll, `body overflow` cleanup with correct `return () => {}` |
| 5.5 | No `src/hooks/` folder (intentional) | `ls src/hooks 2>&1` | ENOENT — documented |

### Phase 6 — Content, A11y, Anti-Patterns, Debugging, Pre-Ship (§7–§11)

| # | Claim | Evidence | Pass |
|---|-------|----------|------|
| 6.1 | Content tables (§7.1) + pipeline (§7.2) + add-procedure (§7.3) + locked arrays (§7.4) | `jq length src/data/*.json` + `read src/lib/catalog.ts` + `read src/lib/ensure-seeded.ts` + `read src/lib/lenders.ts` | `23/40/50/59 + 8/5`, `ensureSeeded` global promise + `count>0` + `onConflictDoNothing`, `NAV 4 + MORE 2` (not 4) |
| 6.2 | A11y (§8) — contrast ratios, focus ring, `prefers-reduced-motion`, touch targets, ARIA per component, axe `critical: []` | `read globals.css :focus-visible` + `e2e/smoke axe` run | Focus `outline 2px solid var(--color-ring) offset 3px`, ratios AAA except muted AA-large, `axe-critical: []` on `main` |
| 6.3 | Anti-patterns (§9) — 14 entries #01–#14 with symptom→root→fix→guard, severity, test guard | `read §9` vs `e2e/*.spec.ts` + `src/lib/*.test.ts` | Each anti-pattern has a test that would fail if reintroduced (e.g., missing 6 images → `assets.spec.ts 6×200`, second Pool → `rg new Pool` single hit, H4 OOM → `markdown.test.ts` 6) |
| 6.4 | Debugging guide (§10) — symptom→root→fix table | `read §10` vs `PAD`/`README` Troubleshooting | Every entry encountered at least once (see §12 lessons) |
| 6.5 | Pre-ship checklist (§11) — 7 bash steps + 2 bash + 6 security items + 152 locs + 6×200 | `read §11` vs live `npm run db:setup && lint && typecheck && test && build && e2e` + `curl /sitemap.xml | grep -c "<loc>"` + `for p in /images/*.jpg ...` | `db:setup 8/40/50/23/59/5`, `lint 0/0`, `typecheck`, `test 41/41`, `build 43/43 (35+8)`, `e2e 121/121 (120/121 DB-less)`, sitemap `152 = 39+23+50+40`, images `6×200` |

### Phase 7 — Lessons, Pitfalls, Best Practices, Patterns, Anti-Patterns, Responsive, Z-Index, Colors, Interfaces (§12–§20 + Appendices)

| # | Claim | Evidence | Pass |
|---|-------|----------|------|
| 7.1 | Lessons (§12) — LL-01…LL-17 grouped by sprint, each traces to a file/test | `read §12` vs `git log --oneline` + `e2e/*` + `src/lib/*.test.ts` | Each lesson has a `Ref:` to a file or commit (e.g., LL-17 H4/OOM → `c74dd7e` + `markdown.test.ts` 6) |
| 7.2 | Pitfalls (§13) — 13 don't→do with guard | `read §13` | Each guard is a command (`rg new Pool`, `ls tailwind.config*`, `grep -rn "as any" src`) |
| 7.3 | Best practices (§14) — TypeScript strict matrix, RSC by default, TDD, Drizzle generate not push | `read tsconfig.json` + `eslint.config.mjs` + `vitest.config.ts` | `strict:true`, `isolatedModules:true`, etc. |
| 7.4 | Coding patterns (§15) — 6 patterns with code that compiles | Copy each snippet into `tmp.ts` + `npx tsc --noEmit --skipLibCheck` | `POST /api/applications` (rateLimit→json→validate→seed→match→persist), `GET /api/health`, `ensureSeeded`, `calculatePayment/matchLenders`, `env fallback`, `sitemap` — all compile |
| 7.5 | Anti-patterns (§16) — inverse of §15 | `read §16` | Each don't→do has a test that fails if violated |
| 7.6 | Breakpoints (§17) — Tailwind defaults, no custom `screens` | `rg "screens" src/app/globals.css` + `read §17` | No custom screens |
| 7.7 | Z-index map (§18) — `z-0` base, `z-10` PageHero, `z-50` header, `z-20` dropdown | `rg "z-\d|z-\[" src/components --include="*.tsx"` | Map matches code |
| 7.8 | Colors (§19) — 19 tokens with hex/HSL/RGB/class/usage; forbidden colors; singular exception `::selection` | `grep -A 50 "@theme" src/app/globals.css` vs `§19` table | Every hex exact (e.g., `background #FFFBF5 40 33% 99%`) |
| 7.9 | Interfaces (§20) — 8 domains (catalog, lenders, calculator, matching, rate-limit, guides, db, env) | Copy each `interface` into source file + `typecheck` | All compile |
| 7.10 | Appendices A–D referenced from body, no orphan | `rg "Appendix [A-D]" home-financing_SKILL.md` + `rg "see §"` | Each appendix referenced at least once |
| 7.11 | Line count 1,500–2,500 (plus PAD) | `wc -l home-financing_SKILL.md` | `1,800–2,800` for mid-size (PAD `1,140` + SKILL `~1,400` = `~2,540`) — currently `1,595` with stale counts; after patch expect `~1,600` |

### Meta-Checklist (distill `§4` + SKILL's own bottom checklist — 9 items)

| # | Check | Evidence | Pass |
|---|-------|----------|------|
| M-1 | Every version matches `package.json` | `npm list --depth=0` vs §2 | — |
| M-2 | Every env var count matches `.env.example` | `grep -c "^[A-Z_]*=" .env.example` vs §3.4 | 14 tracked |
| M-3 | Test counts match `npm test` + `npx playwright test --list` | `npm run test | grep Tests` + `playwright --list | wc -l` | `41` + `121` |
| M-4 | Component counts match `find src/components -type f | wc -l` | 9 files vs SKILL §5.2 `7` | FAIL |
| M-5 | Every file path exists (spot-check 10) | `ls src/app/globals.css src/lib/catalog.ts src/db/schema.ts src/components/page-shell.tsx ...` | 10/10 |
| M-6 | Every code snippet compiles | `tsc --noEmit` on each §15 pattern | — |
| M-7 | Every hex matches `@theme` | `grep hex` vs `globals.css` | — |
| M-8 | No TODO/placeholder | `rg TODO home-financing_SKILL.md` | `0` |
| M-9 | TOC matches headings, appendices referenced, line count reasonable | `awk '/^## /'` vs TOC | — |

---

## Execution Protocol (Validating → Remediating)

1. **Read-only first:** All checks are `read` / `rg` / `bash -n` / `jq length` / `grep hex` before any `npm` invocation.
2. **Live probes only if DB reachable:** `npm run db:setup` (idempotent) then `curl /api/health` + `curl /sitemap.xml | grep -c "<loc>"` + `npx playwright test --project=chromium --reporter=list` (prod `3002`). Otherwise record `DB-less run`.
3. **Gate sequence:** `lint → typecheck → test → build` (doc edits must not break gates). E2E is the long pole (~60s).
4. **Report first, patch second:** Write `docs/VALIDATION_REPORT_SKILL_2026-09-15.md` with PASS/FAIL/DRIFT per row + file:line citation. Only then draft `docs/REMEDIATION_PLAN_SKILL_2026-09-15.md` for the FAIL rows.
5. **No fixes without evidence:** Every remediation must cite the exact file:line that makes the SKILL false — same rule as `VALIDATION_REPORT_2026-09-15.md`.

---

## Success Criteria

- Zero `UNCHECKED` rows — every numbered check above has a verdict + citation.
- SKILL drifts are enumerated with file:line (e.g., `SKILL.md:§2 E2E row: 61→121`, `§5.2 components 7→9`, `§11 build 36+7→35+8`).
- Gate results `lint 0/0`, `typecheck`, `test 41/41`, `build 43/43`, `e2e 121/121` match claim or are flagged as DRIFT.
- A remediation patch list is ready (but not yet applied) — one PR per drift cluster.

---

## Effort & Timeline

| Phase | Wall-clock | What runs |
|-------|------------|-----------|
| 1 Inventory + Structure | ~5 min | `wc -l`, `awk headings`, `rg TODO`, header read |
| 2–3 Stack & Boot | ~10 min | `read package.json`, `read` 8 configs, `read .env.example` |
| 4–5 Design + Arch | ~15 min | `@theme` hex diff, `find` + `grep -r use client`, `read site-header.tsx` |
| 6 Content/A11y/Anti/Debug/Pre-Ship | ~20 min | `jq length` 4 corpora, `curl` sitemap, `e2e` list, `rg` anti-pattern guards |
| 7 Lessons…Interfaces | ~20 min | `git log` cross-check, `tsc --noEmit` on snippets, color hex audit |
| Report + Remediation Plan | ~15 min | Write 2 markdown files |

Total **~85 min** unattended (E2E is the long pole; can slice if needed).

---

## VALIDATE — Awaiting Approval

> **Please confirm:** Shall I execute this plan exactly as scoped (read-only validation of `home-financing_SKILL.md` against the codebase → `docs/VALIDATION_REPORT_SKILL_2026-09-15.md` + `docs/REMEDIATION_PLAN_SKILL_2026-09-15.md` draft)?

Options:
- **Approve as-is** — I start Phase 1 immediately.
- **Approve light** — skip live E2E (just files + `lint/typecheck/test/build`).
- **Edit scope** — tell me what to add/remove/skip (e.g., "also validate against PAD" or "skip color hex audit").
- **Reject / de-scope** — I will pause and revise.
