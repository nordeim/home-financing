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
| `npm run db:setup` | **One-shot DB init** — `db:migrate && db:seed` (local-guarded, idempotent, 8/40/50/23/59/5 rows) |
| `npm run db:generate` | Generate migration (`drizzle-kit generate` via `drizzle.config.ts`) |
| `npm run db:migrate` | Apply `drizzle/` migrations (`tsx src/scripts/migrate.ts`) |
| `npm run db:seed` | Seed via `ensureSeeded()` (`tsx src/scripts/seed.ts`) |
| `npm run db:reset` | **Destructive** local reset — drops `public`+`drizzle` schemas, restores extensions |
| `npm run dev` | Dev server http://localhost:3000 |
| `npm run build` | Production build (validates `next.config.ts:redirects`, requires `skills` excluded) |
| `npm run lint` | ESLint flat config (`eslint.config.mjs` + `core-web-vitals`) |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run typecheck` | `tsc --noEmit` (`skills` excluded via `tsconfig`) |
| `npm run e2e` | Playwright E2E chromium (prod `next start` on 3002, 16 tests) |
| `npm run e2e:all` | Playwright both projects (chromium+webkit) |
| `curl http://localhost:3000/api/health` | Readiness — pings DB + triggers `ensureSeeded()` |
| `docker compose down -v` | **Destructive** — wipes `home_financing_data` volume |

**Order that matters:** `db:setup` → `lint` → `typecheck` → `build` → `e2e` before PR. No `test`/`format` scripts yet (vitest not installed).

## Architecture — what an agent will miss

- **File-backed seeds are the write path.** Edit `src/data/*.json` + `src/lib/lenders.ts`, not Postgres rows. `ensureSeeded()` is idempotent via `globalThis.__modfiiSeedPromise` + `count(lenders) > 0` guard + `onConflictDoNothing`. Called in `/api/health` and `/api/applications` and via `npm run db:seed` (`src/scripts/seed.ts`) — reuse, don't duplicate.
- **Pool singleton.** Import `{ db, pool }` only from `@/db` (`src/db/index.ts`). `globalThis.__arenaNextJsPostgresqlPool` prevents HMR pool leaks. Never `new Pool()` inline.
- **Server Components by default.** `"use client"` only for `site-header`, `prequal-form`, `calculator-app`. Never import a Server Component into a Client Component.
- **`force-dynamic` only where DB is touched.** API routes (`src/app/api/*/route.ts`) have `export const dynamic = "force-dynamic"`. Content pages can render from `catalog` without DB.
- **Drizzle lifecycle guarded.** `src/scripts/local-db.ts` `assertLocalDatabase()` refuses non-local `DATABASE_URL` for `migrate/seed/reset` (drops `public`+`drizzle` schemas + restores `pgcrypto/pg_trgm`). Migrations in `drizzle/` (`0000` 8 tables + `0001` founded 8→32) via `drizzle.config.ts` (TS primary) + `.json` fallback.
- **Playwright on prod build.** `playwright.config.ts` runs `npx next start --port 3002` (not `dev`) with `reuseExistingServer:true`, 90s timeout, chromium+webkit, `x-forwarded-for` isolation for rate-limit tests.
- **Path alias:** `@/*` → `./src/*` (`tsconfig.json`). Always `@/lib/*`, `@/db/*`, `@/components/*`.
- **Target ES2017**, `jsx: react-jsx`, `moduleResolution: bundler`, `incremental: true`.

## Conventions & Gotchas (deviations from defaults)

- **Tailwind v4 CSS-first — no `tailwind.config.*`.** All tokens in `src/app/globals.css:@theme` (`--color-forest`, `--color-accent`, `--color-cream`, radii, shadows). Extend only there; no arbitrary `text-[13px]`.
- **`next.config.ts:images.unoptimized: true`** is intentional (no `sharp` in deploy). Don't re-enable without infra.
- **Redirects live in `next.config.ts:redirects()`:** `/loans/*` → `/modular-home-financing/loan-options/*`, `/manufacturers` → `/modular-home-financing/manufacturers`, `/states/:state` → `/modular-home-financing/states/:state`, `/get-started-v2` → `/get-started` (temp), `/playbook` → `/learn`. Add new aliases there only.
- **`drizzle.config.ts` (primary) + `.json` fallback** — both `out: ./drizzle`, `strict/verbose`, `url: home_financing_user:secret@localhost:5434/home_financing_dev` (runtime `DATABASE_URL` wins). Keep them in sync after schema edits (`npm run db:generate` writes to `drizzle/`).
- **`tsconfig.json:strict:true`, `skipLibCheck:true`, `isolatedModules:true`, `exclude: [node_modules,skills]`.** `skills/` is operator-managed and now excluded from `typecheck`/`build` — don't add `z-ai-web-dev-sdk`; don't re-include `skills`.
- **Rate limiter is in-memory `Map`.** `8 / 10 min` per IP on `POST /api/applications` (`clientKey` via `x-forwarded-for`/`x-real-ip`). Under-limits on multi-instance — migrate to Redis if scaling.
- **Playwright E2E (no unit yet).** 16 tests in `e2e/` (`smoke`/`seo`/`funnel`, chromium via `npm run e2e`). No `*.test.*` unit files, no `vitest`/`jest` yet. Verify via `lint + typecheck + build + e2e + curl /api/health`.
- **Kebab route folders** (`modular-home-financing`, `construction-loans`), `kebab-case.json` data, `kebab-case.tsx` components (grandfathered; new components prefer `PascalCase.tsx` — don't mass-rename).

## Environment & Services

- **Required env:** `DATABASE_URL` (`home_financing_*` on `:5434` — see `docker-compose.yml`; `.env.example` still has legacy `scandihaven_*` placeholders), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (must be canonical public origin in prod — `localhost` breaks with `Invalid origin`), `NEXT_PUBLIC_SITE_URL` (for `metadataBase`, sitemap uses this — hence host-rewrite in `seo.spec.ts`), `CRON_SECRET`.
- **Never commit:** `.env`, `.env.*.local`, `docs/bak.env`, `**/bak.env`, `*.env.bak`, `docs/env.tgz`, `ssh-key.txt` — all `.gitignore`d after 2026-09 audits.

## Never Do

- `new Pool()` outside `src/db/index.ts` — use the singleton.
- Hand-edit Postgres content — edit JSON/seeds, re-seed.
- Create `tailwind.config.*` — use `@theme` in `globals.css`.
- `as any` / `@ts-ignore` — use `unknown` + narrowing.
- `git add -f .env` or `ssh-key.txt`.
- Import server → client components (RSC boundary violation fails `build`).

## Where to Look

- Full conventions: `CLAUDE.md` (~600 lines — 6-phase workflow, schema table, env table, design system, DB lifecycle + E2E).
- DB schema: `src/db/schema.ts` (8 tables, `manufacturers.founded varchar(32)`, `uuid().defaultRandom()`, `text().array()`).
- Validation: `src/lib/matching.ts:validateApplication()` (ZIP `^\d{5}$`, phone digits ≥10, `EMAIL_RE`).
- Math: `src/lib/calculator.ts:PMI_ANNUAL_RATE = 0.0065`, site-built `1.15×`.

*Last verified 2026-09-11 against `package.json` (tsx + playwright), `tsconfig.json` (excludes skills), `next.config.ts`, `drizzle.config.ts/json` (5434), `docker-compose.yml` (home_financing_*), `src/db` (founded 32), `src/scripts/*`, `playwright.config.ts` (3002), `e2e/*` 16 tests, `src/lib`, `src/app`, `.gitignore`.*
