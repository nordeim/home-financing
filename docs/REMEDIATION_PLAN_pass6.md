# REMEDIATION PLAN — PASS 6 (Audit Findings)

**Date:** 2026-09-12 · **Input:** `docs/AUDIT_REPORT_pass5.md` (tiered review + security audit backlog)
**Method:** TDD — failing unit/E2E tests first (RED), minimal implementation (GREEN), full gate.
**Scope:** `src/lib/rate-limit.ts`, `src/lib/markdown.tsx`, three `<details>` FAQ groups. No `skills/`/`infrastructure/` changes.

## Tasks

### Task 1 — R6-1 rate-limit bucket eviction (Medium)
- **RED:** `src/lib/rate-limit.test.ts` — (a) unique expired keys beyond a cap keep the map bounded; (b) active-window keys are never evicted; (c) hot path still allows up to limit + blocks after.
- **GREEN:** in `rateLimit()`, when `buckets.size` exceeds a `MAX_BUCKETS` cap, sweep entries whose `resetAt < now` before inserting a new key; drop the oldest expired first (simplest correct: delete all expired; if still over cap, evict by nearest `resetAt`).
- **Verify:** `npm run test` + full gate.

### Task 2 — R6-2 markdown href allow-list (Low)
- **RED:** `src/lib/markdown.test.ts` — a `[click](javascript:alert(1))` link renders as plain text (no `<a>`), `[ok](https://x)` and `[rel](/guide)` still render anchors.
- **GREEN:** `inline()` allows only `http:`, `https:`, `mailto:`, and `/`-relative hrefs; anything else renders the label text without the anchor.
- **Verify:** `npm run test`.

### Task 3 — R6-3 exclusive FAQ accordions (Low)
- **RED:** `e2e/parity.spec.ts` — opening the second home FAQ closes the first (source accordion behavior).
- **GREEN:** add `name="faq"` (per-page group names: `home-faq`, `guide-faq`, `calc-faq`) to the `<details>` elements in `page.tsx`, `page-shell.tsx`, `calculator/page.tsx`.
- **Verify:** `npm run e2e` (Chromium supports exclusive details).

### Task 4 — docs
- PAD §11: add audit-disposition rows (A-01..A-06 → resolved/accepted); update counts if tests added.

## Validation against the codebase (pre-execution)
- `rate-limit.ts` has no deletion path (A-01 confirmed) → Task 1 additive. ✓
- `markdown.tsx:21-35` href used verbatim (A-02 confirmed) → Task 2 localized to `inline()`. ✓
- All three `<details>` groups lack `name` (rg confirmed) → Task 3 attribute-only. ✓
- Unit tests live in `src/lib/{rate-limit,markdown}.test.ts` (existing suites 7 + 6 tests — counts move to 37+N; docs updated in Task 4). ✓
