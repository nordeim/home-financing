# REMEDIATION PLAN — PASS 8 (Audit Findings)

**Date:** 2026-09-13 · **Input:** `docs/AUDIT_REPORT_pass7.md` (deep-tier review: 1 Critical, 1 Medium, 2 Low/Info)
**Method:** TDD — verifiable checks written RED first, minimal implementation GREEN, full gate.
**Scope:** git hygiene + devDependencies. No runtime `src/` logic changes.

## Tasks

### Task 1 — R7-1 untrack the leaked `.env` (Critical)
- **RED:** `scripts/verify-repo-hygiene.sh` — fails while `.env` (or `bak.env`/`ssh-key.txt`/`env.tgz`) is tracked by git; passes when untracked. Run it: exit 1 (RED) because `git ls-files` currently lists `.env` (`f8e99ab` re-committed it after `ec11541`'s untracking).
- **GREEN:** `git rm --cached .env` (file stays on disk for local dev; `.gitignore:13` already covers it), commit the removal. Re-run the script: exit 0.
- **Wire-in:** the script joins the documented pre-push gate (`AGENTS.md` commands note + README verification block).
- **Rotation (operator action, documented not automated):** `BETTER_AUTH_SECRET` + `CRON_SECRET` must be rotated on the deployment — both remain readable from git history (`d572d73`, `f8e99ab`). Same disposition as the 2026-09-11 incident.
- **Verify:** `git ls-files | grep -c '^\.env$'` → 0; full gate unaffected (`.env` is runtime-neutral to the repo).

### Task 2 — R7-2 bump vitest to 4.1.11 (Medium, GHSA-82fw-gwwq-j7x9)
- **RED:** `npm audit` reports vitest + @vitest/mocker moderate (path traversal via mocker redirect — dev-time). This is the existing failing state.
- **GREEN:** `npm install -D vitest@4.1.11` — the advisory fix release; verify `vitest.config.ts` (node env, `@` alias, include globs) still works and **41/41 unit tests pass**; full gate re-run (vitest 4 keeps the v3 config surface for these options).
- **Accepted (documented):** `esbuild@0.18.20` via `drizzle-kit → @esbuild-kit/esm-loader` — the advisory's fixed version (`1.0.0-beta.2`) is not published on npm (E404) and drizzle-kit@0.31.10 is latest; dev-only exposure, no runtime impact. Revisit when drizzle-kit ships a fix.
- **Verify:** `npm audit --omit=dev` stays 0; `npm audit` moderate count drops from 6 to ≤4 (esbuild-kit chain + drizzle-kit remain, documented).

### Task 3 — docs alignment (round 2)
- `AGENTS.md` / `README.md`: add the hygiene script to the gate notes; note the `.env` re-commit + second rotation requirement in the env/history notes; update the audit cross-reference to `docs/AUDIT_REPORT_pass7.md` + this plan; note vitest 4.1.11 bump (SKILL §2 stack table pins `^3.2.7` — update to `^4.1.11`).
- Update counts if any test numbers shift (they should not — vitest 4 runs the same 41 tests).

## Validation against the codebase (pre-execution)
- `git ls-files | grep '^\.env$'` → `.env` (tracked) → Task 1 confirmed. ✓
- `.gitignore:13` covers `.env` → untracking is permanent once removed from the index. ✓
- `git show HEAD:.env` contains real `BETTER_AUTH_SECRET`/`CRON_SECRET` values (rotation mandatory — documented). ✓
- `npm audit --json` → vitest 3.2.7 in the vulnerable range, fix 4.1.11 published (`npm view vitest@4.1.11` OK). ✓
- `vitest.config.ts` uses only `resolve.alias` + `test.environment/include` — stable across v3→v4 for this surface. ✓
- drizzle-kit fix version `1.0.0-beta.2` NOT on npm (E404) → accepted-risk path confirmed. ✓

## Gate (per repo contract)
`db:setup → lint → typecheck → test → build → e2e` — full green required before commit (db:setup not runnable in this environment — no Docker; documented).
