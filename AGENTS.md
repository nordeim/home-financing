# AGENTS.md — home-financing (ModFii)

> Prefab mortgage marketplace — Next.js 16 App Router + React 19 + TypeScript strict + Tailwind v4 `@theme` + Drizzle ORM + PostgreSQL 17. `CLAUDE.md` is the full spec; this file is the compact agent cheat-sheet — only what you'd miss without help.

## Stack & Entrypoints

- **Brand:** ModFii (package.json name `nextjs-postgresql-template` is legacy). No monorepo.
- **App:** `src/app/layout.tsx` (root layout + `next/font` DM Sans/Outfit + `SiteHeader`/`SiteFooter`), `src/app/globals.css` (sole theme — `@theme`), `src/app/page.tsx`.
- **Data:** `src/data/{articles,manufacturers,states,glossary}.json` → typed `src/lib/catalog.ts` → `src/lib/ensure-seeded.ts` → Postgres. DB is a **projection**, not source.
- **Domain:** `src/lib/calculator.ts` (amortization + PMI 0.65%), `src/lib/matching.ts` (scoring), `src/lib/rate-limit.ts` (in-memory buckets), `src/lib/lenders.ts` (seeds).
- **Primitives:** `src/components/ui.tsx` (`cn`, `Button`/`ButtonLink`/`Container`/`Badge`), `src/components/site-header.tsx` (NAV + MORE, `"use client"`).

## Commands (npm — lockfile is `package-lock.json`)

| Command | Purpose |
|---------|---------|
| `npm install` | Install (npm, not pnpm) |
| `cp .env.example .env` | Env — then fill `DATABASE_URL`, `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `CRON_SECRET` (`openssl rand -hex 16`) |
| `docker compose up -d` | Postgres 17 on host **5434** (`home_financing_dev` / `home_financing_user` / `home_financing_secret`) |
| `docker compose logs -f postgres` | Verify `pgcrypto` + `pg_trgm` init |
| `npm run dev` | Dev server http://localhost:3000 |
| `npm run build` | Production build (validates `next.config.ts:redirects`) |
| `npm run lint` | ESLint flat config (`eslint.config.mjs` + `core-web-vitals`, ignores `.next/out/build`) |
| `npm run typecheck` | `tsc --noEmit` (skills cause `z-ai-web-dev-sdk` noise — see Gotchas) |
| `npx drizzle-kit generate` | Generate migration from `src/db/schema.ts` |
| `curl http://localhost:3000/api/health` | Readiness — pings DB + triggers `ensureSeeded()` |
| `docker compose down -v` | **Destructive** — wipes `home_financing_data` volume |

**Order that matters:** `lint` → `typecheck` → `build` before PR. No `test`/`format` scripts exist.

## Architecture — what an agent will miss

- **File-backed seeds are the write path.** Edit `src/data/*.json` + `src/lib/lenders.ts`, not Postgres rows. `ensureSeeded()` is idempotent via `globalThis.__modfiiSeedPromise` + `count(lenders) > 0` guard + `onConflictDoNothing`. Called in `/api/health` and `/api/applications` — reuse, don't duplicate.
- **Pool singleton.** Import `{ db, pool }` only from `@/db` (`src/db/index.ts`). `globalThis.__arenaNextJsPostgresqlPool` prevents HMR pool leaks. Never `new Pool()` inline.
- **Server Components by default.** `"use client"` only for `site-header`, `prequal-form`, `calculator-app`. Never import a Server Component into a Client Component.
- **`force-dynamic` only where DB is touched.** API routes (`src/app/api/*/route.ts`) have `export const dynamic = "force-dynamic"`. Content pages can render from `catalog` without DB.
- **Path alias:** `@/*` → `./src/*` (`tsconfig.json`). Always `@/lib/*`, `@/db/*`, `@/components/*`.
- **Target ES2017**, `jsx: react-jsx`, `moduleResolution: bundler`, `incremental: true`.

## Conventions & Gotchas (deviations from defaults)

- **Tailwind v4 CSS-first — no `tailwind.config.*`.** All tokens in `src/app/globals.css:@theme` (`--color-forest`, `--color-accent`, `--color-cream`, radii, shadows). Extend only there; no arbitrary `text-[13px]`.
- **`next.config.ts:images.unoptimized: true`** is intentional (no `sharp` in deploy). Don't re-enable without infra.
- **Redirects live in `next.config.ts:redirects()`:** `/loans/*` → `/modular-home-financing/loan-options/*`, `/manufacturers` → `/modular-home-financing/manufacturers`, `/states/:state` → `/modular-home-financing/states/:state`, `/get-started-v2` → `/get-started` (temp), `/playbook` → `/learn`. Add new aliases there only.
- **`drizzle.config.json` URL is a dummy** (`postgres@127.0.0.1:5432/app_db`) for CLI; runtime uses `process.env.DATABASE_URL` (host port **5434**). Don't "fix" the mismatch.
- **`tsconfig.json:strict:true`, `skipLibCheck:true`, `isolatedModules:true`.** `typecheck` legitimately fails on `skills/*` (`z-ai-web-dev-sdk` not installed) — `skills/` is operator-managed and excluded from checks/tests/compilation by `.gitignore`. Ignore that noise; don't add the dep.
- **Rate limiter is in-memory `Map`.** `8 / 10 min` per IP on `POST /api/applications` (`clientKey` via `x-forwarded-for`/`x-real-ip`). Under-limits on multi-instance — migrate to Redis if scaling.
- **No test framework.** No `*.test.*`, no `vitest`/`jest`/`playwright`. Verify via `lint + typecheck + build + curl /api/health`.
- **Kebab route folders** (`modular-home-financing`, `construction-loans`), `kebab-case.json` data, `kebab-case.tsx` components (grandfathered; new components prefer `PascalCase.tsx` — don't mass-rename).

## Environment & Services

- **Required env:** `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (must be canonical public origin in prod — `localhost` breaks with `Invalid origin`), `NEXT_PUBLIC_SITE_URL` (for `metadataBase`), `CRON_SECRET`. See `.env.example` (note: example still says `scandihaven_*` — real DB is `home_financing_*` on `:5434`).
- **Never commit:** `.env`, `.env.*.local`, `docs/bak.env`, `**/bak.env`, `*.env.bak`, `docs/env.tgz`, `ssh-key.txt` — all `.gitignore`d after 2026-09 audits.

## Never Do

- `new Pool()` outside `src/db/index.ts` — use the singleton.
- Hand-edit Postgres content — edit JSON/seeds, re-seed.
- Create `tailwind.config.*` — use `@theme` in `globals.css`.
- `as any` / `@ts-ignore` — use `unknown` + narrowing.
- `git add -f .env` or `ssh-key.txt`.
- Import server → client components (RSC boundary violation fails `build`).

## Where to Look

- Full conventions: `CLAUDE.md` (535 lines — 6-phase workflow, schema table, env table, design system).
- DB schema: `src/db/schema.ts` (8 tables, `uuid().defaultRandom()`, `text().array()`).
- Validation: `src/lib/matching.ts:validateApplication()` (ZIP `^\d{5}$`, phone digits ≥10, `EMAIL_RE`).
- Math: `src/lib/calculator.ts:PMI_ANNUAL_RATE = 0.0065`, site-built `1.15×`.

*Last verified 2026-09-11 against `package.json`, `tsconfig.json`, `next.config.ts`, `drizzle.config.json`, `docker-compose.yml`, `src/db`, `src/lib`, `src/app`, `.gitignore`.*
