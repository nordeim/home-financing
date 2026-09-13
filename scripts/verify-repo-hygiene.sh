#!/usr/bin/env bash
# Repo hygiene guard — fails when secret files are tracked by git.
# Runs as part of the pre-push gate (docs/REMEDIATION_PLAN_pass8.md R7-1,
# evidence: docs/AUDIT_REPORT_pass7.md A-01 — commit f8e99ab re-committed
# .env after ec11541 had untracked it).
# Usage: bash scripts/verify-repo-hygiene.sh
set -u

PATTERNS=(
  '^\.env$'
  '^\.env\.local$'
  'bak\.env$'
  'env\.tgz$'
  'ssh-key'
)

TRACKED=$(git ls-files)
FAILED=0
for pattern in "${PATTERNS[@]}"; do
  MATCHES=$(echo "$TRACKED" | grep -E "$pattern" || true)
  if [ -n "$MATCHES" ]; then
    echo "[hygiene] FAIL: tracked file(s) match '$pattern':"
    echo "$MATCHES" | sed 's/^/        /'
    FAILED=1
  fi
done

if [ "$FAILED" -ne 0 ]; then
  echo "[hygiene] FAIL — untrack with 'git rm --cached <file>' (see docs/REMEDIATION_PLAN_pass8.md)"
  exit 1
fi

echo "[hygiene] PASS — no tracked secret files"
