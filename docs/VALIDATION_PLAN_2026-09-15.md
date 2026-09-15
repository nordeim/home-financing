# Deep Codebase Alignment Validation Plan — 2026-09-15

> Follows the **Meticulous 6-Phase Workflow** (ANALYZE → PLAN → VALIDATE → IMPLEMENT → VERIFY → DELIVER).
> Goal: prove that `AGENTS.md` + `CLAUDE.md` + `README.md` + `Project_Architecture_Document.md` are truthful against the live codebase, surface drift, and certify project status.

---

## Executive Summary

The four documents together claim a ~600-line agent spec, a compact cheat-sheet, an operator guide, and a definitive PAD locking every architectural decision. Before trusting them for future work, we will run a **read-only evidence-gathering pass** that checks every checkable claim against the file tree, configs, code, and live gates — no code edits, no DB writes beyond `db:setup` idempotency.

**Deliverables after execution:**
- `docs/VALIDATION_REPORT_2026-09-15.md` — table of every claim → verdict (PASS/FAIL/DRIFT) → evidence path + command.
- `docs/ALIGNMENT_MATRIX_2026-09-15.csv` — machine-readable claim matrix for CI.
- Hygiene patch (if needed) — doc-count typos only; no feature code.

---

## What We Learned (Deep Understanding Snapshot)

### Identity
Content + transaction hybrid for prefab financing. Brand **ModFii** (npm name `nextjs-postgresql-template` legacy). One-way projection: `src/data/*.json` (23/40/50/59) + `src/lib/lenders.ts` (8/5) → `catalog.ts` typing → `ensureSeeded()` (global promise + `count()>0` + `onConflictDoNothing`) → Postgres 17 (8 tables) → App Router RSC.

### Stack (pinned)
Next 16.3 + React 19.3 + TS 5.9 strict + Tailwind 4.3 CSS-first `@theme` (sole `globals.css`) + Drizzle 0.45 + `pg` 8.23 Pool singleton (`globalThis.__arenaNextJsPostgresqlPool`) + Vitest 4.1.11 + Playwright 1.63 + axe-core 4.13. `target ES2017`, `jsx react-jsx`, `moduleResolution bundler`, alias `@/*`.

### Architecture Contract
- Visual parity with `modfii.com` is locked: light `bg-background/80 backdrop-blur-lg border-border/50 h-16 md:h-20` header always-light, `PageHero` centered photo+forest overlay + star pill + amber highlight + glass chips, rotated-square badge + two-tone wordmark, `gap-8` md-nav, `px-4` container, radius `md 10px / xl 12px / 2xl 16px`.
- Server Components by default; `"use client"` only for `site-header`, `prequal-form`, `calculator-app`, `learn-explorer`, `reveal`, `error.tsx`.
- `force-dynamic` only on DB-touching routes; Pool singleton only via `@/db`; `next.config.ts:images.unoptimized:true` intentional; redirects in `next.config.ts:redirects()` (11 claimed).
- Rate limiter is in-memory `Map` 8/10 min (multi-instance → Redis caveat).
- `skills/` + `infrastructure/` excluded from lint/typecheck; no `tailwind.config.*`.

### Docs Claim Divergence to Watch
- Test counts drift between docs: PAD still cites **37 unit / 82 E2E (53 decl)** in §8 but footer says 41/82; AGENTS+CLAUDE claim **41 unit (11+13+9+8) / 121 per project (103 decl)** post-pass-7/8. Must pin which is authoritative.
- Build routes claim: PAD says 43/43 (36 static+7 dynamic); AGENTS says 43/43 (42 static+8 dynamic). One is stale.
- `vitest` in README badges still `3.2` vs `package.json` `^4.1.11` pass-8 bump.

---

## Validation Plan — 7 Phases (read-only)

Each phase has: **Claims to check** → **Evidence command / file read** → **Pass criterion**. Phases run in order; phase 1 blocks the rest if version pins fail.

### Phase 1 — Inventory & Version Pinning (ground truth)

| # | Claim | Check | Pass |
|---|-------|-------|------|
| 1.1 | `package.json:name`, scripts, deps match docs table | `read package.json` + `rg "scripts\.(dev|build|test|e2e|db:)" package.json` | Exact script list `dev/build/start/lint/lint:fix/typecheck/test/test:watch/test:coverage/e2e/e2e:all/db:*` present; deps `next ^16.3.4 react ^19.3.0 drizzle-orm ^0.45.2 pg ^8.23 tailwindcss ^4.3.3 vitest ^4.1.11` |
| 1.2 | `tsconfig.json` strict + `isolatedModules` + `@/*` + `exclude skills` | `read tsconfig.json` | `strict:true, allowJs:false, isolatedModules:true, target ES2017, jsx react-jsx, moduleResolution bundler, exclude [node_modules, skills]` |
| 1.3 | `eslint.config.mjs` flat + `core-web-vitals` + ignores | `read eslint.config.mjs` | `defineConfig([...nextCoreWebVitals, globalIgnores([".next/**","out/**","build/**","next-env.d.ts","skills/**","infrastructure/**"])])` |
| 1.4 | Single app, no monorepo | `ls turbo.json pnpm-workspace.yaml` expect ENOENT; `fd turborepo` | Neither exists |
| 1.5 | Docs list `docker-compose.yml` host 5434 `home_financing_*` | `read docker-compose.yml` + `read .env.example` | Port `5434`, db `home_financing_dev`, user `home_financing_user`, volume `home_financing_data`, init `00-create-extensions.sql` |

### Phase 2 — Architecture Layer Model & Code Boundaries

| # | Claim | Check | Pass |
|---|-------|-------|------|
| 2.1 | File corpus → catalog → ensureSeeded → PG projection (only write path) | `read src/data/articles.json | jq length` etc.; `read src/lib/catalog.ts`; `read src/lib/ensure-seeded.ts`; `read src/lib/lenders.ts` | Corpus 23/40/50/59 + LENDER_SEEDS 8 + LOAN_PRODUCT_SEEDS 5; `catalog.ts` re-exports typed; `ensure-seeded.ts` has `globalThis.__modfiiSeedPromise` + `count(lenders)>0` + `onConflictDoNothing` per table; `pool` not `new Pool()` in this file |
| 2.2 | Pool singleton only via `src/db/index.ts` (no second Pool) | `rg "new Pool" src/` | Exactly 1 hit in `src/db/index.ts` |
| 2.3 | Server Components by default, `"use client"` allow-list | `rg '"use client"' src/` | Exactly 6 files: `site-header.tsx`, `prequal-form.tsx`, `calculator-app.tsx`, `learn-explorer.tsx`, `reveal.tsx`, `app/error.tsx` — no other |
| 2.4 | `force-dynamic` only where DB touched | `rg "force-dynamic" src/app/` | Only `api/health`, `api/applications`, `api/calculator` (and any DB-backed `page.tsx` that seeds) — no content leaf pages |
| 2.5 | Drizzle lifecycle guarded (local only) | `read src/scripts/local-db.ts`; `read src/scripts/migrate.ts/seed.ts/reset.ts`; `read drizzle.config.ts/.json`; `ls drizzle/*.sql` | `assertLocalDatabase()` checks `localhost/127.0.0.1/::1`; migrations `0000_amusing_thena.sql` + `0001_sharp_stick.sql` + `_journal.json`; `drizzle.config.ts` + `.json` both `out ./drizzle strict/verbose url …@5434` |
| 2.6 | Playwright on prod build 3002 + reuseExistingServer | `read playwright.config.ts` | `webServer: npx next start --port 3002`, `reuseExistingServer:true`, `timeout 90s`, `chromium+webkit`, `expect timeout`, `x-forwarded-for` isolation comment/tests |
| 2.7 | No `tailwind.config.*` exists | `ls tailwind.config.* 2>&1` | ENOENT |
| 2.8 | Route & data conventions kebab-cased | `fd --type f src/app | head`; `ls src/data/` | Folders `modular-home-financing`, `construction-loans`, files `kebab-case.json` as claimed |
| 2.9 | Undocumented shipped routes as claimed | `ls src/app/debug-error-probe/page.tsx src/app/editorial-policy/page.tsx src/app/corrections/page.tsx`; `read src/app/sitemap.ts` | `debug-error-probe` exists and throws `probe-error-boundary`, not in sitemap; `editorial-policy` + `corrections` in sitemap |

### Phase 3 — Design System & Visual-Parity Contract

| # | Claim | Check | Pass |
|---|-------|-------|------|
| 3.1 | Tokens only in `globals.css:@theme` (no tailwind config) | `read src/app/globals.css` | `@import "tailwindcss"` + `@theme { --color-forest/primary/accent/cream/moss/border/ring --radius-sm..2xl --shadow-lift --ease-brand }` + no `@tailwind` elsewhere |
| 3.2 | Header bar metrics always-light frosted | `read src/components/site-header.tsx` | Contains `bg-background/80` + `backdrop-blur-lg` + `border-border/50` + `h-16 md:h-20` + `gap-8` + never `bg-forest` conditional on scroll (pass-3 removal of `overDarkHero`) |
| 3.3 | Brand badge = 3-div rotated-square + two-tone wordmark | `rg "rotate-3.*rounded-lg|Mod.*Fii" src/components/site-header.tsx src/components/site-footer.tsx` | 3-div nesting + `Mod` + `Fii` split-tone present; favicon `brand/modfii-logo-icon.svg` still a circle glyph only |
| 3.4 | More dropdown exactly 2 items | `rg "MORE\s*=" src/components/site-header.tsx -A 8` | `ADU Financing` + `Tiny Home Financing` only |
| 3.5 | PageHero contract (forest overlay + star pill + highlight + glass chips + titleSize) | `read src/components/page-shell.tsx` | `bg-forest`, `Image fill opacity-35`, `from-forest/80…to-forest/90`, `radial-gradient(…hsl(38…/0.16))`, `border-white/35 bg-white/10` star pill, `highlight` amber span, `Breadcrumbs light center`, CTA pair + `border-white/15 bg-white/10 backdrop-blur-sm` chips |
| 3.6 | Primitives via `src/components/ui.tsx` (cn/Button/Container) | `read src/components/ui.tsx` | `cn`, `Button` variants `primary|secondary|accent|outline|ghost|onPrimary`, sizes `sm|md|lg`, `Container` `max-w-[1400px] mx-auto px-4` |
| 3.7 | Radius & button chrome match source probe | `rg "--radius" src/app/globals.css`; `rg "h-11.*px-8|rounded-md" src/components/ui.tsx` | `--radius-xl ~0.75rem (12px)`, `md 10px / 2xl 16px`, `font-medium`, `h-11 px-8` at lg |
| 3.8 | `next.config.ts:images.unoptimized:true` intentional | `read next.config.ts` | `images: { unoptimized: true }` with comment |
| 3.9 | `Container` flat `px-4` (no `md:px-8`) | `rg "Container|px-4" src/components/ui.tsx -n` | `px-4` flat, `max-w-[1400px]` |

### Phase 4 — Data & Seeding Lifecycle

| # | Claim | Check | Pass |
|---|-------|-------|------|
| 4.1 | Schema 8 tables, founded varchar 32, indices | `read src/db/schema.ts` | 8 `pgTable`: lenders, applications, application_matches, manufacturers, states, articles, glossaryTerms, loanProducts; `manufacturers.founded varchar(32)`; `lenders.slug` unique, `lenders_green_idx`, indices as pad §4.1 |
| 4.2 | Calculator invariants `PMI 0.65%` + site-built `1.15×` | `rg "PMI_ANNUAL_RATE|0.0065|1.15" src/lib/calculator.ts -n` | `PMI_ANNUAL_RATE = 0.0065`, `siteBuilt* 1.15` |
| 4.3 | Matching invariants `+20/+18/+12`, floor `5.4%`, ZIP regex, EMAIL_RE | `read src/lib/matching.ts` | Scoring weights exact; `EMAIL_RE`, ZIP `^\d{5}$`, phone `replace(/\D/g).length >=10` |
| 4.4 | Extensions pgcrypto + pg_trgm init | `read infrastructure/postgres/init/00-create-extensions.sql` | Both `CREATE EXTENSION IF NOT EXISTS` |
| 4.5 | Seed idempotency path reuse | `rg "ensureSeeded" src/app/api -n` + `read src/scripts/seed.ts` | Called in `api/health` + `api/applications` + `scripts/seed.ts` wrapper; nowhere else duplicates seeding |

### Phase 5 — Routing, SEO & Env

| # | Claim | Check | Pass |
|---|-------|-------|------|
| 5.1 | Redirects 11 in `next.config.ts:redirects()` | `read next.config.ts` + count entries | Exactly: `/loans/*`→`/modular-home-financing/loan-options/*` (4), `/manufacturers*`, `/states/:state`, `/get-started-v2`→`/get-started`, `/playbook`→`/learn`, two `/compare/*` aliases |
| 5.2 | Drizzle dual config in sync | `diff <(jq -S . drizzle.config.json) <(node -e "…drizzle.config.ts")` or manual compare | Both `out ./drizzle strict verbose url …@5434` |
| 5.3 | Sitemap/robots/metadataBase derived from `NEXT_PUBLIC_SITE_URL` | `read src/app/sitemap.ts` + `read src/app/layout.tsx` + `read src/app/robots.ts` + `read .env.example` | `metadataBase` from `NEXT_PUBLIC_SITE_URL`, sitemap 40 `STATIC_PATHS` + articles/states/manufacturers expansion, robots `Sitemap: ${base}/sitemap.xml` |
| 5.4 | Env table completeness | `read .env.example` + cross with `CLAUDE.md` §9.2 table | Contains `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `STRIPE_*`, `RESEND_*`, `FEATURE_*`, `DISABLE_IMAGE_OPTIMIZER` guard |
| 5.5 | Security headers contract (post pass-5) | `read next.config.ts` `headers()` | `content-security-policy`, `permissions-policy`, `referrer-policy strict-origin-when-cross-origin`, `strict-transport-security max-age=63072000; includeSubDomains; preload`, `x-content-type-options nosniff`, `x-frame-options DENY`, `x-request-id <uuid>` |
| 5.6 | Rate-limit bucket 8/10min wired to `POST /api/applications` + `60/min /api/calculator` | `read src/app/api/applications/route.ts` + `read src/lib/rate-limit.ts` | `rateLimit(…8, 10*60*1000)` + `clientKey` via `x-forwarded-for→x-real-ip→local` |

### Phase 6 — Test Harness & Quality Gates

| # | Claim | Check | Pass |
|---|-------|-------|------|
| 6.1 | Unit suite 41 (11+13+9+8) co-located | `ls src/lib/*.test.ts` + `cat vitest.config.ts` + `npm run test 2>&1` | 4 files `calculator/matching/rate-limit/markdown.test.ts` totaling 41 passing (vitest ^4.1.11) |
| 6.2 | E2E harness shape | `read playwright.config.ts`; `ls e2e/*.spec.ts`; `rg "describe|test\(" e2e/ -c` | 5 specs: `smoke/seo/funnel/assets/parity`; harness prod 3002 `reuseExistingServer:true`; docs must agree on totals — we will record actual `npx playwright test --list` count |
| 6.3 | Markdown H4 loop-guard regression | `read src/lib/markdown.tsx` | Renders `#### ` as `h4` and paragraph branch always consumes ≥1 line |
| 6.4 | Repo hygiene guard | `ls scripts/verify-repo-hygiene.sh` + `cat .gitignore` + `bash scripts/verify-repo-hygiene.sh` | Script exists + `.gitignore` covers `.env`, `*.env.bak`, `docs/bak.env`, `ssh-key.txt` |
| 6.5 | Live gate smoke (DB-less fallback tolerated) | `npm run lint`; `npm run typecheck`; `npm run build`; `curl /api/health` (if DB up) | `lint 0/0`, `typecheck` clean, `build` 43/43, health `{ok:true}` or documented 500 if no DB |

### Phase 7 — Cross-Doc Consistency Audit

| # | Check | Pass |
|---|-------|------|
| 7.1 | AGENTS vs CLAUDE vs README vs PAD version pins agree | All version cells match `package.json`/`docker-compose.yml` |
| 7.2 | Test-count + route-count convergence | Single canonical count chosen; stale doc sections flagged and patch proposed |
| 7.3 | Security-history disclosure (`d572d73`, `f8e99ab` rotate warning) present in all operator-facing docs | Each doc warns to rotate `BETTER_AUTH_SECRET`+`CRON_SECRET` |
| 7.4 | `skills` exclusion consistently documented | `tsconfig.json` + `eslint.config.mjs` + prose all agree `skills/` + `infrastructure/` excluded |

---

## Execution Protocol (IMPLEMENT → VERIFY)

1. **Run state:** no files created yet beyond this plan. Execution will be **read-first**: `read`/`rg`/`fd`/`bash -n` before any `npm` invocation.
2. **Live probes (only if DB reachable):** `docker compose ps`; `npm run db:setup` (idempotent, guarded); then `curl /api/health` + `curl /api/applications` probes — otherwise record `DB-less run: cluster unreachable` and keep e2e DB-less lane (120/121).
3. **Gate sequence:** `db:setup? → lint → typecheck → test → build → e2e --project=chromium --reporter=list` (prod). Each gate's raw output is archived under `docs/audit-evidence/2026-09-15/` as proof.
4. **No fixes without evidence:** Any doc patch proposed later must cite the exact file:line that makes the doc false.

---

## Success Criteria

- Every table above has a `PASS` or `DRIFT(recorded + patch proposed)` with a file:line citation — zero `UNCHECKED`.
- Gate results `lint 0/0`, `typecheck`, `test 41/41`, `build 43/43` match claimed; e2e count pins actual runtime total (and isolates DB-less vs DB-full).
- Cross-doc version/count discrepancies are enumerated and a convergence patch is drafted.
- Final report committed as `docs/VALIDATION_REPORT_2026-09-15.md`.

---

## Effort & Timeline

| Phase | Wall-clock | What runs |
|-------|-----------|-----------|
| 1–2 | ~15 min | File reads, `rg` scans, version-pin audit |
| 3–4 | ~15 min | Design-system + schema + calc/matching invariant reads |
| 5 | ~10 min | Redirects/sitemap/headers/env reads |
| 6 | ~25 min (dominant) | `lint` + `typecheck` + `test` + `build` + `e2e chromium` (prod 3002) + hygiene script |
| 7 + report | ~15 min | Cross-doc delta table + report write |

Total **~80 min** unattended (e2e is the long pole). Can split into slices if needed.

---

## VALIDATE — Awaiting Approval

> **Please confirm:** Shall I proceed to execute this plan exactly as scoped (read-only validation + gate run + `docs/VALIDATION_REPORT_2026-09-15.md`)?

Options:
- **Approve as-is** — I start Phase 1 immediately.
- **Approve with edits** — tell me what to add/remove/skip (e.g., "skip e2e" or "also check modfii.com live-probe drift").
- **Reject / de-scope** — I will pause and revise.
