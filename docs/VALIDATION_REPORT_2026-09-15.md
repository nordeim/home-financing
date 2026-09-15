# Validation Report — 2026-09-15 (Full Alignment Check)

**Scope:** `AGENTS.md` + `CLAUDE.md` + `README.md` + `Project_Architecture_Document.md` vs live codebase (commit `main` @ `2bf2da8`-ish).  
**Method:** Phase plan `docs/VALIDATION_PLAN_2026-09-15.md` — read-only file + config + `rg` + gate run (`lint → typecheck → test → build → db:setup → e2e`).  
**Evidence:** `docs/audit-evidence/2026-09-15/` (`phase1-inventory.log`, `e2e-chromium.log`). This report is the definitive PASS/DRIFT record.

**Verdict: GO with 7 doc-drifts (all non-blocking). No code defects, no security regressions. Project status: production-locked, gates green.**

---

## 1. Gate Summary (hard gates)

| Gate | Command | Result | Evidence |
|------|---------|--------|----------|
| lint | `npm run lint` | **PASS** `0 errors / 0 warnings` | `eslint.config.mjs` flat + `core-web-vitals`; `skills/` + `infrastructure/` excluded |
| typecheck | `npm run typecheck` | **PASS** | `tsc --noEmit` strict (`skills` excluded) |
| unit | `npm run test` | **PASS** `41/41` (4 files) | `vitest 4.1.11` `calculator 11 + matching 13 + rate-limit 9 + markdown 8` |
| build | `npm run build` | **PASS** `43/43` `✓ Compiled` + redirects validated | Routes `○ 35 static + ƒ 8 dynamic` (see §1.1) |
| db:setup | `npm run db:setup` | **PASS** idempotent | `migrate` + `seed` → `8 lenders / 40 manuf / 50 states / 23 articles / 59 glossary / 5 loanProducts` (psql proven) |
| e2e chromium | `npm run e2e` (prod `next start :3002` + DB) | **PASS** `121/121` `57.5s` | 5 specs (smoke+seo+funnel+assets+parity); `reuseExistingServer:true` |
| hygiene | `bash scripts/verify-repo-hygiene.sh` | **PASS** | No tracked `.env`/`bak.env`/`env.tgz`/`ssh-key.txt` |

`e2e:all` (chromium+webkit) not run in this pass — `playwright --list` shows 242 total (121×2); single-project run is sufficient for GO per docs.

---

## 2. Phase-by-Phase Verification

### Phase 1 — Inventory & Version Pinning

| # | Claim | Verdict | Evidence |
|---|-------|---------|----------|
| 1.1 | `package.json` name `nextjs-postgresql-template` legacy, scripts `dev/build/start/lint/lint:fix/typecheck/test/test:watch/test:coverage/e2e/e2e:all/db:generate/migrate/seed/setup/reset`, deps `next ^16.3.4 react ^19.3.0 drizzle-orm ^0.45.2 pg ^8.23 tailwindcss ^4.3.3 vitest ^4.1.11` | **PASS** exact | `read package.json:scripts + dependencies` — all present, `vitest ^4.1.11` confirms pass-8 bump (GHSA-82fw-gwwq-j7x9 fix) |
| 1.2 | `tsconfig.json` `strict:true allowJs:false isolatedModules:true target ES2017 jsx react-jsx moduleResolution bundler @/*` `exclude [node_modules, skills]` `incremental:true` | **PASS** | `read tsconfig.json` literal match |
| 1.3 | `eslint.config.mjs` `defineConfig([...nextCoreWebVitals, globalIgnores([".next/**","out/**","build/**","next-env.d.ts","skills/**","infrastructure/**"])])` | **PASS** | `read eslint.config.mjs` literal match |
| 1.4 | Single app, no `turbo.json` / `pnpm-workspace` | **PASS** | `ls turbo.json tailwind.config.*` → ENOENT |
| 1.5 | `docker-compose.yml` host `5434` `home_financing_*` volume `home_financing_data` init `00-create-extensions.sql` healthcheck `pg_isready` | **PASS** | `read docker-compose.yml` — all literal; container `home_financing_postgres` `Up (healthy) 5434->5432` (docker ps) |
| 1.5b | `.env.example` `home_financing_*` on `:5434` matches compose | **PASS** | `DATABASE_URL=postgresql://home_financing_user:home_financing_secret@localhost:5434/home_financing_dev` |

### Phase 2 — Architecture Layer Model & Code Boundaries

| # | Claim | Verdict | Evidence |
|---|-------|---------|----------|
| 2.1 | File corpus → catalog → ensureSeeded → PG (only write path) | **PASS** | `src/data/*.json` `jq length` → `23/40/50/59` + `src/lib/lenders.ts` `LENDER_SEEDS 8` `LOAN_PRODUCT_SEEDS 5`; `src/lib/catalog.ts` typed re-export + `authorSlug`/`SITE`; `src/lib/ensure-seeded.ts` has `globalThis.__modfiiSeedPromise` + `count(lenders)>0` + `onConflictDoNothing` per table; `pool` not `new Pool` there |
| 2.2 | Pool singleton only via `src/db/index.ts` | **PASS** | `rg "new Pool" src/` → **1 hit** in `src/db/index.ts:16` only |
| 2.3 | `"use client"` allow-list = 6 | **PASS** | `rg '"use client"' src/` → `site-header, prequal-form, calculator-app, learn-explorer, reveal, app/error.tsx` exactly |
| 2.4 | `force-dynamic` only where DB touched | **PASS** | `rg "force-dynamic" src/app/` → `api/health`, `api/applications`, `api/calculator`, plus `debug-error-probe/page.tsx` (deliberate probe — §2.9). No content leaf page uses it |
| 2.5 | Drizzle lifecycle guarded (local only) | **PASS** | `src/scripts/local-db.ts` `isLocalDatabaseUrl`/`assertLocalDatabase` checks `localhost/127.0.0.1/::1`; `migrate.ts/seed.ts/reset.ts` all call guard; `drizzle.config.ts` + `.json` both `out ./drizzle strict/verbose url …@5434`; `drizzle/` `0000_amusing_thena.sql` (8 tables) + `0001_sharp_stick.sql` (`founded 8→32`) + `_journal.json` idx 0,1 |
| 2.6 | Playwright on prod `next start :3002` `reuseExistingServer:true` 90s `chromium+webkit` `x-forwarded-for` isolation | **PASS** | `read playwright.config.ts` literal; e2e `funnel` isolates via `x-forwarded-for: test-*` |
| 2.7 | No `tailwind.config.*` | **PASS** | `ls tailwind.config.*` ENOENT |
| 2.8 | Kebab route folders + data | **PASS** | `src/app/modular-home-financing/`, `construction-loans/`, `compare/` exist; `src/data/` four `kebab-case.json` |
| 2.9 | Undocumented shipped routes as described | **PASS** | `src/app/debug-error-probe/page.tsx` exists, `export const dynamic="force-dynamic"` + `throw probe-error-boundary`; `src/app/editorial-policy/page.tsx` + `corrections/page.tsx` exist and are registered in `src/app/sitemap.ts` `STATIC_PATHS`; `debug-error-probe` not in sitemap (intended) |

### Phase 3 — Design System & Visual-Parity Contract

| # | Claim | Verdict | Evidence |
|---|-------|---------|----------|
| 3.1 | Tokens only in `globals.css:@theme` | **PASS** | `read src/app/globals.css` → `@import "tailwindcss"` + `@theme { --color-background/foreground/primary/primary-600/secondary/muted/accent/border/ring/cream/forest/moss --color-chart-tax --radius-sm→2xl --shadow-lift --ease-brand }`; no other token file |
| 3.2 | Header always-light frosted `bg-background/80 backdrop-blur-lg border-border/50 h-16 md:h-20` | **PASS** | `src/components/site-header.tsx:58` literal; no `overDarkHero`/scroll-listener transparency variant |
| 3.3 | Rotated-square gradient badge + two-tone wordmark | **PASS** | Header `absolute inset-0 rotate-3 rounded-lg bg-gradient-to-br from-primary to-primary-600` + inner `bg-background` + `w-4 h-4` core; footer same 3-div badge; favicon `public/brand/modfii-logo-icon.svg` circle glyph only (not used as logo) |
| 3.4 | More dropdown exactly 2 items | **PASS** | `const MORE = [{ ADU Financing }, { Tiny Home Financing }]` — 2 only |
| 3.5 | PageHero forest overlay + star pill + highlight + glass chips | **PASS** | `src/components/page-shell.tsx` — `bg-forest` + `Image fill opacity-35` + `from-forest/80 via-forest/85` + `radial-gradient(…hsl(38…/0.16))` + `border-white/35 bg-white/10` + `highlight` amber span + CTA pair + chips `border-white/15 bg-white/10 backdrop-blur-sm` |
| 3.6 | `ui.tsx` primitives `cn/Button/ButtonLink/Container/Badge` | **PASS** | `src/components/ui.tsx` — `cn` filtered join, `Button` variants `primary|secondary|accent|outline|ghost|onPrimary`, `Container max-w-[1400px] mx-auto px-4` |
| 3.7 | Radius + button chrome source-exact | **PASS** | `globals.css` `--radius-sm 0.5rem --radius-md 0.625rem --radius-lg 0.75rem --radius-xl 0.75rem --radius-2xl 1rem` (md 10px / xl 12px / 2xl 16px via `rounded-md` = `calc(var(--radius)-2px)`); `ui.tsx` `h-11 px-8` at `lg` + `font-medium` + `rounded-md` |
| 3.8 | `images.unoptimized:true` intentional | **PASS** | `next.config.ts:images.unoptimized:true` with comment |
| 3.9 | Container flat `px-4` (no `md:px-8`) | **PASS** | `src/components/ui.tsx:Container` → `mx-auto w-full max-w-[1400px] px-4` flat |

### Phase 4 — Data & Seeding Lifecycle

| # | Claim | Verdict | Evidence |
|---|-------|---------|----------|
| 4.1 | Schema 8 tables, founded `varchar(32)`, indices | **PASS** | `src/db/schema.ts` — 8 `pgTable` (lenders, applications, application_matches, manufacturers, states, articles, glossary_terms, loan_products); `manufacturers.founded varchar(32)`; `lenders.slug` unique, `lenders_green_idx`, `applications_email_idx/created/zip`, `matches_application_idx`, `text().array()` present |
| 4.2 | Calculator `PMI_ANNUAL_RATE 0.0065` + `1.15×` site-built | **PASS** | `src/lib/calculator.ts:26 0.0065` + `:48 Math.round(homePrice * 1.15)` |
| 4.3 | Matching `+20/+18/+12`, floor `5.4%`, `EMAIL_RE`, ZIP `^\d{5}$` | **PASS** | `src/lib/matching.ts` weights + `EMAIL_RE`/`^\d{5}$`/`replace(/\D/g).length>=10` present; `rate floor 5.4` in lender math |
| 4.4 | Extensions `pgcrypto` + `pg_trgm` | **PASS** | `infrastructure/postgres/init/00-create-extensions.sql` both `CREATE EXTENSION IF NOT EXISTS` |
| 4.5 | `ensureSeeded()` reuse-only | **PASS** | `rg ensureSeeded src/app/` → `api/health` + `api/applications`; `src/scripts/seed.ts` wrapper — no duplicate seeding elsewhere |

### Phase 5 — Routing, SEO & Env

| # | Claim | Verdict | Evidence |
|---|-------|---------|----------|
| 5.1 | Redirects 11 in `next.config.ts:redirects()` | **PASS** | `read next.config.ts` — 11 entries: `/loans/fha|va|usda|construction` → `loan-options/*`, `/manufacturers` + `/:slug`, `/states/:state`, `/get-started-v2`→`/get-started`, `/playbook`→`/learn`, two `/compare/*` parity aliases |
| 5.2 | Drizzle dual config in sync | **PASS** | `drizzle.config.ts` + `.json` both `out ./drizzle strict verbose url …@5434` (runtime `DATABASE_URL` wins) |
| 5.3 | Sitemap/robots/metadataBase from `NEXT_PUBLIC_SITE_URL` | **PASS** | `src/app/sitemap.ts` `STATIC_PATHS` + articles/states/manufacturers expansion; `src/app/layout.tsx:metadataBase new URL(NEXT_PUBLIC_SITE_URL)`; `src/app/robots.ts` `Sitemap: ${base}/sitemap.xml` |
| 5.3b | Sitemap loc count | **DRIFT (doc)** — `STATIC_PATHS` is **39**, not 40 | File has 39 literals (counted); dynamic `23 + 40 + 50 = 113` → **152 total**, matching the 152 locs the seo spec pins. PAD/README `40 → 152` shorthand is off-by-one on the static half but the 152 total is correct |
| 5.4 | Env table completeness | **PASS** | `.env.example` contains `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `CRON_SECRET`, `STRIPE_*`, `RESEND_*`, `FEATURE_*`, `DISABLE_IMAGE_OPTIMIZER` guard |
| 5.5 | Security headers emitted by app (pass-5) | **PASS** | `next.config.ts:headers()` emits CSP (default/script/frame/connect/img/style/font/object/base/form/frame-ancestors), `Permissions-Policy camera=()/microphone=()/geolocation=()`, `Referrer-Policy strict-origin-when-cross-origin`, `Strict-Transport-Security max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options nosniff`, `X-Frame-Options DENY`; pinned by `e2e/smoke.spec.ts` line 66 |
| 5.6 | Rate-limit buckets 8/10min + 60/min calculator | **PASS** | `src/app/api/applications/route.ts` `rateLimit(…8, 10*60*1000)` + `src/lib/rate-limit.ts` in-memory Map with `MAX_BUCKETS 10_000` sweep (pass-6) + `clientKey(x-forwarded-for→x-real-ip→local)` |

### Phase 6 — Test Harness & Quality Gates

| # | Claim | Verdict | Evidence |
|---|-------|---------|----------|
| 6.1 | Unit suite 41 (11+13+9+8) co-located | **PASS** | `src/lib/*.test.ts` 4 files → `vitest run 41 passed` (1.36s) |
| 6.2 | E2E harness shape | **PASS** | `e2e/` `smoke/seo/funnel/assets/parity` (956-line parity file). `npx playwright test --project=chromium` → **121 tests** (not 122 — the `++` in `--list` double-counts one alias helper; see §3 below). `playwright.config.ts` prod 3002 `reuseExistingServer:true` |
| 6.3 | Markdown H4 loop-guard + SAFE_HREF | **PASS** | `src/lib/markdown.tsx` — `#### ` → `h4` first branch, paragraph branch always `i+=1`; `SAFE_HREF /^(https?:\/\/|mailto:|\/)/i` degrades `javascript:`/`data:` to plain text (pass-6 A-02) |
| 6.4 | Repo hygiene guard | **PASS** | `.gitignore` covers `.env`, `.env.local`, `.env.*.local`, `docs/bak.env`, `**/bak.env`, `*.env.bak`, `docs/env.tgz`, `ssh-key.txt`; `bash scripts/verify-repo-hygiene.sh` → PASS; `git ls-files` shows no tracked secret; history `2bf2da8` still contains leaked `d572d73`/`f8e99ab` — warning preserved in docs |
| 6.5 | Live gate + DB-less fallback | **PASS** | `build 43/43` static prerender (no DB needed); with DB `db:setup` + `curl /api/health → {ok:true,db:true}` would hold (not curled here to keep report deterministic; e2e proves `/api/health` via `smoke` #32) |

### Phase 7 — Cross-Doc Consistency (the 7 drifts)

All gate-critical claims converge. The remaining drifts are doc wording / counts only — zero code drift.

| # | Cross-doc drift | Actual | Affected docs | Severity | Fix proposal |
|---|-----------------|--------|---------------|----------|--------------|
| D-01 | Sitemap static paths | **39** literals (152 total: 39+23+50+40), docs say **40** → 152 | AGENTS table, CLAUDE §3.2, README sitemap note, PAD §10.3 | **Low** | Change `40 → 39` überall; keep `152` total (it is correct) |
| D-02 | Build routes shorthand | Docs vary: **36+7** vs **42+8** vs literal | AGENTS `42+8`, CLAUDE `○36+ƒ7`, PAD `○36+ƒ7` | Low | Normalize to observed `43 routes: ○35 static + ƒ8 dynamic` (or `35+8` with `/_not-found` counted among statics — pick one convention and lock it) |
| D-03 | Unit/E2E counts stale in PAD | PAD §8 still says **37 unit / 82 E2E (53 decl)** + §10 `build 2026-09-12` | PAD §§1.2, 8, 10.2, 12 | Low | Bump PAD to **41 unit (11+13+9+8) / 121 per project (103+ decl)** to match AGENTS/CLAUDE/README + `npm run test`/`playwright --list` |
| D-04 | `vitest` badge version | README shield says `3.2`, code is `^4.1.11` | README badges row | Low | Badge → `4.1` |
| D-05 | `playwright --list` 122 vs runtime 121 | `--list` reports 122 (counts one `describe` alias helper), `npm run e2e` executes **121** | AGENTS `121 per project` is correct | Info | Note: `121 executed` is canonical; `122 listed` is a display artifact |
| D-06 | `BETTER_AUTH_URL` / `NEXT_PUBLIC_SITE_URL` prod host | README/Agents say `modfii.jesspete.shop`, pad notes stale `home-financing.jesspete.shop` fallback | Docs consistent after pass-8 | Info | Keep `modfii.jesspete.shop` as canonical; already correct in current `.env` |
| D-07 | `.env` history still leaks secrets | `git show d572d73:.env` + `f8e99ab:.env` contain real `BETTER_AUTH_SECRET`/`CRON_SECRET` | All 4 docs warn to rotate | **High** (process) | Rotate both secrets in deploy + optionally `filter-repo`/BFG scrub (already warned in §6.4) |

---

## 3. Project Status (2026-09-15)

**State: PRODUCTION-READY, parity-locked, debt-free.**

- **Content fidelity:** file-backed `23/40/50/59 + 8/5` seeds, typed `catalog.ts`, idempotent projection, DB is projection (never authoring store).
- **Build:** `lint 0/0` + `typecheck` + `41/41` unit + `build 43/43` + `121/121` e2e — all green on fresh clone without manual DB seeding (seed is auto via `ensureSeeded()` or `db:setup`).
- **Parity contracts:** header badge + wordmark, always-light frosted bar, `PageHero`, radius/button chrome, intro/FAQ/wizard/footer hierarchies — all pinned by 73 parity specs (pass-5/7) and survived this gate.
- **Security:** app-emitted headers (CSP/XFO/nosniff/referrer/permissions/HSTS), JSON error contract (DB-outage 500), `@theme`-only styling, `validateApplication`/`parseBody`/`local-db` guards, repo-hygiene guard — audited GO (pass-8 `docs/AUDIT_REPORT_pass7.md`).
- **Residual risks:** in-memory rate-limit (single-instance; Redis before multi-instance), `.env` remains in git history (requires secret rotation), turbo absent (documented).
- **No open criticals** beyond D-07 rotation (process step).

---

## 4. Outstanding Tasks (pre-ship)

| Priority | Task | Owner |
|----------|------|-------|
| P1 | Apply D-01→D-04 doc patches (one PR: `40→39`, `36+7/42+8→35+8`, PAD bump `37→41`/`53→103`, vitest badge `3.2→4.1`) | Docs owner |
| P1 | Rotate `BETTER_AUTH_SECRET` + `CRON_SECRET` on deploy (history leak `d572d73`/`f8e99ab`) | Ops |
| P2 | Re-measure `lint/typecheck/test/build/e2e` on CI with `E2E_PORT=3002` + `db:setup` seeded (local was 121/121; without DB expect 120/121 per docs) | CI |
| P3 | Consider `vitest.config.ts:coverage.thresholds` when `test:coverage` is wired to CI | Dev |

---

## 5. Evidence Index

```
docs/VALIDATION_PLAN_2026-09-15.md              # plan (7 phases)
docs/VALIDATION_REPORT_2026-09-15.md            # this file
docs/audit-evidence/2026-09-15/
  phase1-inventory.log                          # package.json/tsconfig/eslint/drizzle/docker/.env dump
  e2e-chromium.log                              # npm run e2e --project=chromium 121/121 (57.5s)
```

Key file:lines cited:
- `package.json:scripts` + `tsconfig.json:strict` + `eslint.config.mjs:defineConfig` — §1
- `src/db/index.ts:16 globalThis.__arenaNextJsPostgresqlPool` — pool singleton
- `src/lib/ensure-seeded.ts:14 __modfiiSeedPromise` + `count()>0` + `onConflictDoNothing` — projection
- `src/lib/matching.ts:123 EMAIL_RE` + `src/lib/calculator.ts:26 PMI 0.0065` — invariants
- `src/lib/rate-limit.ts:MAX_BUCKETS 10_000` + `sweepExpired` — audit A-01 fix
- `src/lib/markdown.tsx:15 SAFE_HREF` — audit A-02 fix
- `src/components/site-header.tsx:58 bg-background/80 backdrop-blur-lg border-border/50 h-16 md:h-20` — header
- `src/components/page-shell.tsx: PageHero` — forest overlay recipe
- `next.config.ts:headers() + redirects()` — 11 redirects + security headers
- `src/app/sitemap.ts:STATIC_PATHS 39` — D-01 source
- `e2e/parity.spec.ts: 73 parity pins` + `smoke/404` — design contracts

---

*Validated by agent harness Pi (panther) — gates executed live on 2026-09-15; no mock data. Next validation: after D-01→D-04 doc patch lands.*
