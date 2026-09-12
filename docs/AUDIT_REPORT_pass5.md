# Audit Report — Pass 5: Tiered Code Review + Security Audit

**Scope:** Full codebase minus operator-managed `skills/` + `infrastructure/` (excluded per repo contract). Focus: prove the SPA matches its documented contracts (AGENTS/CLAUDE/README/SKILL/PAD) and is safe to ship.
**Method:** Repo skills applied — `code-review-checklist` (12-category tactical scan), `security-and-hardening` (boundary/OWASP checklist), `vulnerability-scanner` (automated `security_scan.py` + manual triage), `verification-and-review-protocol` (evidence-backed claims only). Review dimensions per audit discipline: correctness, security, data integrity, error handling, performance, testing, maintainability, consistency, dependency health.
**Evidence window:** 2026-09-12, local prod build (post pass-5 commit), embedded PG 17 on :5434, live probes of modfii.jesspete.shop + modfii.com.
**Verdict:** **GO — no blocking defects.** 2 Medium + 3 Low actionable findings (remediation backlog below); everything else verified clean. Full gate green at audit time: `lint 0/0`, `typecheck`, `37/37` unit, `build 43/43`, `81/81` E2E chromium (with PG).

---

## Verification ledger

| # | Check | How | Result |
|---|-------|-----|--------|
| V-01 | Contract: commands | `package.json:scripts` vs AGENTS/CLAUDE/README tables | ✓ all 17 scripts match |
| V-02 | Contract: 81 E2E per project | `npx playwright test --project=chromium` | ✓ 81/81 (with PG); 80/81 DB-less |
| V-03 | Contract: 37 unit = 11+13+7+6 | `npm run test` | ✓ 37/37 |
| V-04 | Contract: 8 DB tables, seeds 8/40/50/23/59/5 | psql counts on embedded PG | ✓ |
| V-05 | Contract: security headers app-emitted | `curl -sI` local prod + `smoke.spec.ts` pin | ✓ CSP/XFO/nosniff/referrer/permissions + HSTS |
| V-06 | Contract: JSON-error funnel incl. DB outage | `funnel.spec.ts` + `scripts/verify-db-outage.sh` | ✓ 500 + application/json + error body |
| V-07 | Contract: 11 redirects | `next.config.ts` + build validation | ✓ |
| V-08 | Contract: RSC boundaries / client islands | `next build` + `grep 'use client'` | ✓ 5 islands + error.tsx, build clean |
| V-09 | Contract: no `new Pool` outside singleton | `rg "new Pool" src/` | ✓ only `src/db/index.ts` |
| V-10 | Contract: no `as any` / `@ts-ignore` / `console.log` / `eval` / secrets in src | `rg` sweep | ✓ clean |
| V-11 | Dependency health (prod) | `npm audit --omit=dev` | ✓ **0 vulnerabilities** |
| V-12 | Dependency health (dev) | `npm audit` | 6 moderate, dev-only — see A-05 |
| V-13 | Automated security scan | `skills/vulnerability-scanner/scripts/security_scan.py` | in-scope findings triaged below (A-02/A-03 false-positive detail) |
| V-14 | a11y floor | `smoke.spec.ts` axe critical | ✓ zero critical violations |
| V-15 | Secrets in git history | `.gitignore` + `git status` | ✓ `.env`/`ssh-key.txt` untracked (d572d73 history exposure remains a documented rotate-on-deploy item) |
| V-16 | Input validation | manual review `matching.ts` + `parseBody` + `num()` | ✓ ZIP `^\d{5}$`, EMAIL_RE, phone ≥10 digits, per-field slices, numeric clamps |
| V-17 | Injection resistance | Drizzle parameterized builders only; no string SQL in src | ✓ |
| V-18 | XSS | React auto-escaping; no raw HTML sink except static JSON-LD (A-03) | ✓ with A-02 hardening noted |

---

## Findings (severity-ranked)

### A-01 — MEDIUM · rate-limit bucket map grows unboundedly
- **Location:** `src/lib/rate-limit.ts:1-13`
- **Description:** `buckets` `Map` entries are created per unique client key and never evicted — only overwritten when the same key returns after expiry. A bot rotating spoofed `x-forwarded-for` values allocates one entry per request.
- **Evidence:** code inspection — no deletion path exists; `resetAt < now` branch replaces in place.
- **Impact:** slow memory growth on a long-lived single instance (~100 bytes/request under attack). Not a crash risk at current scale; contradicts the "resilience" quality bar.
- **Recommended fix:** sweep expired entries when the map exceeds a cap (e.g. 10k) inside `rateLimit()`, evicting stale `resetAt` keys; keep the data structure lock-free and O(1) on the hot path.
- **Confidence:** Verified (code) / Reasoned (impact at scale).

### A-02 — LOW · markdown link hrefs accept any scheme
- **Location:** `src/lib/markdown.tsx:21-35`
- **Description:** `[text](href)` tokens render `<a href>` without restricting the scheme. A `javascript:` or `data:` URL inside article content would be rendered as-is.
- **Evidence:** `const href = link[2]; const external = href.startsWith("http");` — no scheme allow-list.
- **Impact:** currently zero — content is developer-authored `src/data/articles.json` (not user input). PAD §6.4 explicitly flags this class for hardening "when touching". Defense-in-depth item.
- **Recommended fix:** allow only `http:`, `https:`, `mailto:`, and relative `/`-rooted hrefs; drop the anchor (render text only) otherwise. Add a unit test with a `javascript:` payload.
- **Confidence:** Verified (code) / Assumed (no current malicious content).

### A-03 — INFORMATIONAL · `dangerouslySetInnerHTML` JSON-LD (scanner hit)
- **Location:** `src/app/page.tsx:210` (+ `learn/[slug]/page.tsx` same pattern)
- **Description:** the automated scanner flags `dangerouslySetInnerHTML`. The value is `JSON.stringify(jsonLd)` over developer-controlled constants (SITE + static content) — the canonical Next.js structured-data pattern, no user input reaches it.
- **Evidence:** `jsonLd` literal inspection; scanner output `severity: high, category: XSS risk`.
- **Impact:** none — false positive; documented so future audits don't re-litigate.
- **Confidence:** Verified.

### A-04 — LOW · FAQ `<details>` groups are not exclusive
- **Location:** `src/app/page.tsx:537`, `src/components/page-shell.tsx:303`, `src/app/calculator/page.tsx:157`
- **Description:** the source modfii.com uses a Radix accordion where opening one item closes the others; the clone's `<details>` elements stay independently open.
- **Impact:** minor UX divergence; no correctness/a11y issue.
- **Recommended fix:** add `name="faq"` to the `<details>` elements per group (HTML exclusive-accordion, progressive enhancement — Chromium/Safari support; older browsers keep today's behavior).
- **Confidence:** Verified (code) / Reasoned (source behavior from probes).

### A-05 — INFORMATIONAL · 6 dev-only moderate npm audit advisories
- **Location:** devDependencies — `vitest@3.2.7` (mocker path traversal GHSA-82fw-gwwq-j7x9) and `esbuild <=0.24.2` via `drizzle-kit@0.31` chain.
- **Impact:** none at runtime — both are dev-time tools; prod dependency tree audits **0 vulnerabilities** (`npm audit --omit=dev`). The vitest advisory requires running malicious project config; esbuild's requires a dev server exposure.
- **Recommended action:** accept and document; re-evaluate on the next planned toolchain bump (vitest 5 / drizzle-kit 2). Force-fixing now would break the migration toolchain for zero runtime gain.
- **Confidence:** Verified (`npm audit` output).

### A-06 — LOW · `scripts/` probe utilities ship in the repo without lint/type coverage
- **Location:** `scripts/*.mts` (recon + verification harnesses added during passes 4-5)
- **Description:** the audit/E2E probe scripts (source-recon, clone-compare, etc.) are dev utilities executed via `node --experimental-strip-types`; they are not covered by `tsconfig` (excluded? — no: they ARE type-checked since `scripts/` is under the include path... verified: `tsc --noEmit` passes, so they type-check) but have no lint rule overrides and reference no repo modules beyond `playwright`.
- **Impact:** none at runtime; they are developer tooling consistent with the existing `scripts/live-audit.mts` convention.
- **Recommended action:** keep; optionally move one-off probes to `docs/` archives later. No change required.
- **Confidence:** Verified (typecheck + lint pass with them present).

### Verified-clean inventory (no findings)
- **`POST /api/applications`:** rate-limit-before-parse ✓, per-field `slice()` clamps ✓, `validateApplication` ✓, JSON errors on 400/429/500 ✓, Drizzle parameterized inserts ✓, deterministic scoring with capped values ✓.
- **`POST /api/calculator`:** 60/min limit ✓, `num()` min/max clamps on every numeric field ✓, pure computation ✓.
- **`GET /api/health`:** DB ping + seed trigger, 500-on-DB-failure ✓.
- **`ensureSeeded()`:** idempotent (`count(lenders)` guard + `onConflictDoNothing`), global promise resets on failure so transient DB errors don't poison the cache ✓.
- **`src/db/index.ts`:** single Pool via `globalThis` ✓; `DATABASE_URL` required-at-import throw ✓.
- **Client islands:** `prequal-form` (submitting state, disabled buttons, inline validation, catch → error UI), `calculator-app` (bounded inputs, breakdown bar with `role="img"` + label), `learn-explorer` (memoized filters, aria-hidden icons), `reveal` (observer disconnect, reduced-motion via CSS), `site-header` (adjust-state-during-render pattern, `useId`, body-scroll lock cleanup) ✓.
- **Docs contract:** commands, counts, routes, tokens, pins — all reconciled in pass-5 doc updates (V-01..V-08).

---

## Remediation backlog (fed into remediation pass 6)

| ID | Severity | Item | Effort |
|----|----------|------|--------|
| R6-1 | Medium | Evict expired rate-limit buckets when map exceeds cap (+ unit tests: eviction, hot-path O(1), spoofed-IP growth bounded) | S |
| R6-2 | Low | Markdown href scheme allow-list (+ unit test with `javascript:` payload) | S |
| R6-3 | Low | `<details name="faq">` exclusive accordions (page, guide, calculator) (+ E2E assertion: opening second closes first) | S |
| R6-4 | Info | Document A-03/A-05/A-06 dispositions in PAD §11 + this report (done here) | — |

**Out of scope / accepted risks (unchanged):** in-memory limiter under-limits on multi-instance (documented; Redis migration when scaling); git-history secret exposure `d572d73` (rotate on deploy); `images.unoptimized` (no sharp in deploy); PMI product decision.
