#!/usr/bin/env bash
# Verifies the S-10 JSON-error contract on the DB-outage path (pass-5 F-13):
# starts a prod server with an unreachable DATABASE_URL and asserts that
# POST /api/applications returns a JSON 500 — not an empty body.
# Run: bash scripts/verify-db-outage.sh
set -euo pipefail
cd "$(dirname "$0")/.."

PORT=3003
BASE="http://127.0.0.1:${PORT}"
DEAD_DB="postgresql://user:pass@127.0.0.1:9/do-not-exist"

echo "[db-outage] building fresh prod bundle (quiet)…"
npm run build > /dev/null 2>&1

echo "[db-outage] starting next start on :${PORT} with unreachable DB…"
DATABASE_URL="${DEAD_DB}" npx next start --port "${PORT}" > /tmp/db-outage-server.log 2>&1 &
SERVER_PID=$!
trap 'kill ${SERVER_PID} 2>/dev/null || true' EXIT

for i in $(seq 1 30); do
  sleep 1
  if curl -s -o /dev/null "${BASE}/" 2>/dev/null; then break; fi
done

STATUS=$(curl -s -o /tmp/db-outage-body.json -w "%{http_code}" \
  -X POST "${BASE}/api/applications" \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: db-outage-probe' \
  -d '{"fullName":"Jane Doe","email":"jane@example.com","phone":"5551234567","zipCode":"90210","propertyIntent":"purchase","homeType":"modular","landStatus":"own_land","manufacturerKnown":false,"creditRange":"good","incomeRange":"100k_150k","budget":"250k_400k","timeline":"3_6_months"}')

CTYPE=$(curl -s -o /dev/null -w "%{content_type}" -X POST "${BASE}/api/applications" \
  -H 'Content-Type: application/json' \
  -H 'x-forwarded-for: db-outage-probe-2' \
  -d '{"fullName":"Jane Doe","email":"jane2@example.com","phone":"5551234567","zipCode":"90210","propertyIntent":"purchase","homeType":"modular","landStatus":"own_land","manufacturerKnown":false,"creditRange":"good","incomeRange":"100k_150k","budget":"250k_400k","timeline":"3_6_months"}')

echo "[db-outage] status=${STATUS} content-type=${CTYPE}"
echo "[db-outage] body: $(head -c 200 /tmp/db-outage-body.json)"

if [ "${STATUS}" = "500" ] && echo "${CTYPE}" | grep -qi "application/json"; then
  echo "[db-outage] PASS — funnel returns JSON 500 when the DB is unreachable"
  exit 0
fi
echo "[db-outage] FAIL — expected JSON 500" >&2
exit 1
