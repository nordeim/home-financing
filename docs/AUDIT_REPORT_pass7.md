# AUDIT REPORT — PASS 7 (Tiered Code Review + Security Audit)

**Date:** 2026-09-13 · **Audited tree:** `1bf7fe9` (post pass-7 remediation) · **Mode:** deep (all phases)
**Method:** repo skill `skills/code-review-and-audit` (per `skills/skills-catalog.md`), phases 1–6, with the skill's Native CLI Fallback Protocol applied where the bundled scripts could not be scoped (the bundled `checklist_runner.py` scans the whole tree including the operator-managed `skills/` folder, which the repo contract excludes from checking — all 77 of its "critical" hits and ~2.1k "medium" hits fall in `skills/` and are recorded below as A-04, not app findings). App-code scope: `src/`, `e2e/`, repo `scripts/`, root configs.

**Verdict: GO after one critical fix (A-01).** One true Critical (tracked `.env` with live secrets — re-committed after the earlier untracking), zero app-code injection/XSS/type-safety findings, documented contracts otherwise verified end-to-end, CWV green, gate green.

---

## Phase 1 — Static Analysis (lint-and-validate)

| Check | Result |
|---|---|
| `npm run lint` (ESLint 9 flat + next/core-web-vitals, `skills`+`infrastructure` ignored) | ✅ 0 errors / 0 warnings |
| `npm run typecheck` (`tsc --noEmit`, strict) | ✅ clean |

## Phase 2 — Security Scan (vulnerability-scanner)

| Check | Result |
|---|---|
| `npm audit --omit=dev` (production deps) | ✅ 0 vulnerabilities |
| `npm audit` (all) | 🟡 6 moderate — **all in dev toolchain** (A-02) |
| Secret scan (`src/`, `e2e/`, repo `scripts/`, root configs) | ✅ no credentials (content strings only) |
| Dangerous patterns (`eval`, `exec`, `child_process`, `innerHTML=`, SQL concat) in `src/` | ✅ none |
| `dangerouslySetInnerHTML` | 🟢 1 hit — `page.tsx:212` JSON-LD built from a static object via `JSON.stringify` — accepted (A-03) |
| Tracked-files hygiene | 🔴 **`.env` IS tracked at HEAD with real secrets** (A-01) |
| Security headers (CSP/XFO/nosniff/referrer/permissions/HSTS) | ✅ pinned by `smoke.spec.ts`, verified in earlier probes of the live deploy |
| Rate limiting (`8/10min` per IP) | ✅ live-verified: 8×400 then 429 on the 9th request (`x-forwarded-for: audit-burst-test`) |

## Phase 3 — Code Quality (code-quality-standards, 12 categories, scoped to app code)

| Category | Result |
|---|---|
| Correctness (unsafe access, parseInt radix) | ✅ none |
| Security | ✅ (see Phase 2) |
| Performance (N+1, `for...in` arrays) | ✅ none — applications loop fetches ≤4 lender rows by indexed `slug` (documented as acceptable) |
| Code quality (long fns) | 🟢 `guides.ts` is a 1.5k-line content corpus (data, not logic — accepted, same class as `src/data/*.json`) |
| Testing | ✅ 41 unit + 121 E2E per project (pass-7), all green except the DB-dependent funnel test |
| Documentation | ✅ README/AGENTS/CLAUDE/SKILL aligned this session |
| Error handling (empty catch) | ✅ none |
| Naming | ✅ conventions followed (kebab grandfathered, PascalCase for new files) |
| Type safety (`as any`, `@ts-ignore`, `any`) | ✅ zero in `src/`+`e2e/` |
| React/UI (useEffect deps, setState-in-effect, loading states) | ✅ clean (header uses adjust-state-during-render pattern) |
| LLM/AI patterns | n/a |
| Anti-patterns (second Pool, tailwind.config, inline styles) | ✅ none — `new Pool` only in `src/db/index.ts`; no `tailwind.config.*`; one documented `style` for the dotted CTA texture |

## Phase 4 — Test Coverage

`vitest run` → **41/41** ✅ (calculator 11 + matching 13 + rate-limit 9 + markdown 8).
`playwright --project=chromium` → **120/121** ✅ (only the funnel valid-payload persistence test needs Postgres — unavailable in this environment; with DB: 121/121 documented).
`scripts/verify-db-outage.sh` → **PASS** (JSON 500 contract on DB outage, fresh build + isolated port 3003).

## Phase 5 — Performance

Lighthouse crashes in this sandbox (TARGET_CRASHED with full Chrome tracing), so Core Web Vitals were measured via PerformanceObserver in Playwright against the fresh prod build (`scripts/cwv-probe.mts`):

| Route | LCP | CLS | TTFB |
|---|---|---|---|
| `/` | 252ms ✓ | 0.003 ✓ | 6ms |
| `/get-started` | 168ms ✓ | 0 ✓ | 7ms |
| `/calculator` | 164ms ✓ | 0 ✓ | 6ms |
| `/modular-home-financing` | 288ms ✓ | 0 ✓ | 9ms |
| `/learn` | 288ms ✓ | 0 ✓ | 6ms |

All comfortably inside "good" thresholds (LCP ≤ 2500ms, CLS ≤ 0.1).

## Phase 6 — Contract Conformance (AGENTS/CLAUDE/README/SKILL vs code)

| Documented contract | Verified |
|---|---|
| Pool singleton only in `src/db/index.ts` | ✅ `rg "new Pool"` → 1 hit |
| `"use client"` allow-list (header/forms/calculator/learn-explorer/reveal/error.tsx) | ✅ exact set |
| `force-dynamic` on the 3 API routes (+ debug probe) | ✅ |
| 11 redirects in `next.config.ts` + security headers | ✅ (E2E-pinned) |
| File corpus 23/40/50/59 + 8 lenders/5 products; DB is a projection | ✅ |
| RSC boundary (no server→client imports) | ✅ (build passes) |
| `/debug-error-probe` excluded from sitemap; editorial-policy/corrections included | ✅ (live sitemap checked) |
| robots.txt allows + sitemap link | ✅ |
| API error order: rateLimit → JSON → validate → ensureSeeded → insert; JSON errors only | ✅ live-verified |
| DB outage → JSON 500 | ✅ `verify-db-outage.sh` PASS |
| Tailwind v4 CSS-first, no `tailwind.config.*`, tokens in `@theme` | ✅ |
| Tests: 41 unit / 121 E2E per project | ✅ measured this session |
| Gate: lint → typecheck → test → build (43/43) → e2e | ✅ green (120/121 DB-less) |
| **"`.env` untracked, never commit"** | 🔴 **VIOLATED — A-01** |

---

## Findings (severity-ranked, with evidence)

### 🔴 A-01 CRITICAL — `.env` is tracked at HEAD with live secrets
- **Evidence:** `git ls-files` lists `.env`; `git show HEAD:.env` contains `BETTER_AUTH_SECRET="8KxGMB4…"` and `CRON_SECRET="ec16d8…"`. Commit `f8e99ab` ("update session log", 2026-09-12) re-added `.env` (52 lines) AFTER `ec11541` had untracked it (2026-09-11). Docs (AGENTS.md §Environment, README §Troubleshooting) claim it is untracked — the contract is currently violated.
- **Impact:** anyone with repo read access obtains the auth signing secret and the cron secret. Stripe keys in the same file are placeholders (`sk_test_set-me`); `DATABASE_URL` holds local-only dev credentials.
- **Remediation:** `git rm --cached .env` + commit (R7-1). Rotate `BETTER_AUTH_SECRET` + `CRON_SECRET` on the deployment (R7-1). History retains the secret in `d572d73` and `f8e99ab` — a history rewrite (filter-repo) is possible later but changes SHAs on a shared remote and is explicitly out of scope for this pass; rotation is the documented compensating control (same disposition as the 2026-09-11 incident).

### 🟠 A-02 MEDIUM — dev-toolchain advisories (npm audit)
- **Evidence:** `npm audit` → 6 moderate, all dev-only: `vitest` 2.1.0-beta.1–4.1.10 + `@vitest/mocker` (fixed in 4.1.11), `esbuild` ≤0.24.2 (fixed 0.25), `drizzle-kit` 0.19.0–1.0.0-beta.1 (fixed 1.0.0-beta.2), `@esbuild-kit/core-utils` + `@esbuild-kit/esm-loader` (transitive via tsx's legacy loader). Production dependency tree: **0 vulnerabilities**.
- **Impact:** build/test-time only; no runtime exposure for site visitors.
- **Remediation (R7-2):** bump `vitest` to ≥4.1.11 and `drizzle-kit` to ≥1.0.0-beta.2 in devDeps (semver-major bumps — run full gate after); `esbuild`/`@esbuild-kit` resolve transitively via `tsx`/`vitest` updates. If upgrades break, accept risk (dev-only) with documentation.

### 🟡 A-03 LOW — accepted: `dangerouslySetInnerHTML` for JSON-LD
- **Evidence:** `src/app/page.tsx:212` — `JSON.stringify(jsonLd)` from a module-level constant; no user input reaches it. Pass-2 audit already accepted this pattern; unchanged.

### ⚪ A-04 INFO — `skills/` operator-managed folder contains scanner-flagged patterns
- **Evidence:** the bundled checklist scanner flags `eval()`/SQL-string patterns inside `skills/**` (e.g. `skills/trustskill`, `skills/skill-creator`, `skills/kimi-pdf`). The repo contract (`tsconfig`/`eslint.config.mjs` exclusions + user instruction) keeps `skills/` and `infrastructure/` out of all checks/tests/compilation; nothing in `src/` imports from it.
- **Disposition:** out of scope by contract; recorded for the operator.

### ⚪ A-05 INFO — secrets persist in git history
- **Evidence:** `d572d73` (original leak, 2026-09-10/11 audit R-02) and now `f8e99ab`. Disposition as A-01: rotate; optional future `git filter-repo` by the owner.

### ✅ Passed checks
See phase tables above — static analysis, secret/pattern scans (app scope), rate limit, outage JSON contract, sitemap/robots, RSC boundaries, singleton pool, CWV, full test suites, build, and every documented-contract claim except A-01.

---

## Remediation backlog (feeds REMEDIATION_PLAN_pass8)

| ID | Finding | Severity | Action |
|---|---|---|---|
| R7-1 | A-01 | Critical | Untrack `.env`; document rotation requirement; add a guard so `git status` can't silently reintroduce it |
| R7-2 | A-02 | Medium | Bump vitest ≥4.1.11 + drizzle-kit ≥1.0.0-beta.2 (devDeps), re-run full gate |
| R7-3 | A-05 | Info | Optional: `git filter-repo` history purge (owner decision; breaks remote SHAs) |

**Overall status:** FAILED (CRITICAL) → **GO once R7-1 lands** (it does not affect shipped runtime behavior; the site itself is safe to serve — the exposure is repo-side).

*Evidence artifacts: `.audit-report.md` (raw bundled-scanner output, unscoped — retained for provenance), `scripts/cwv-probe.mts` output, `scripts/verify-db-outage.sh` PASS, live curl probes of `/api/applications` (JSON 500 + 8-then-429), sitemap/robots fetches.*
