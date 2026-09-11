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
| `npm run e2e` | Playwright E2E chromium (prod `next start` on 3002, 44 tests; 43/44 without a DB) |
| `npm run test` | Vitest unit suite (37 tests — calculator / matching / rate-limit / markdown) |
| `npm run e2e:all` | Playwright both projects (chromium+webkit) |
| `curl http://localhost:3000/api/health` | Readiness — pings DB + triggers `ensureSeeded()` |
| `docker compose down -v` | **Destructive** — wipes `home_financing_data` volume |

**Order that matters:** `db:setup` → `lint` → `typecheck` → `test` → `build` → `e2e` before PR.

## Architecture — what an agent will miss

- **File-backed seeds are the write path.** Edit `src/data/*.json` + `src/lib/lenders.ts`, not Postgres rows. `ensureSeeded()` is idempotent via `globalThis.__modfiiSeedPromise` + `count(lenders) > 0` guard + `onConflictDoNothing`. Called in `/api/health` and `/api/applications` and via `npm run db:seed` (`src/scripts/seed.ts`) — reuse, don't duplicate.
- **Visual parity with modfii.com is a design contract.** The header sits transparent (light text) over the homepage hero until scroll; interior heroes flow through `PageHero` (`src/components/page-shell.tsx`) — centered, photo-backed, star eyebrow pill, optional amber `highlight` title line, CTA pair, glass stat chips. Don't reintroduce left-aligned gradient heroes or an amber header CTA (it is a forest "Get Started" pill).
- **Pool singleton.** Import `{ db, pool }` only from `@/db` (`src/db/index.ts`). `globalThis.__arenaNextJsPostgresqlPool` prevents HMR pool leaks. Never `new Pool()` inline.
- **Server Components by default.** `"use client"` only for `site-header`, `prequal-form`, `calculator-app`, `learn-explorer`, `reveal`. Never import a Server Component into a Client Component.
- **`force-dynamic` only where DB is touched.** API routes (`src/app/api/*/route.ts`) have `export const dynamic = "force-dynamic"`. Content pages can render from `catalog` without DB.
- **Drizzle lifecycle guarded.** `src/scripts/local-db.ts` `assertLocalDatabase()` refuses non-local `DATABASE_URL` for `migrate/seed/reset` (drops `public`+`drizzle` schemas + restores `pgcrypto/pg_trgm`). Migrations in `drizzle/` (`0000` 8 tables + `0001` founded 8→32) via `drizzle.config.ts` (TS primary) + `.json` fallback.
- **Playwright on prod build.** `playwright.config.ts` runs `npx next start --port 3002` (not `dev`) with `reuseExistingServer:true`, 90s timeout, chromium+webkit, `x-forwarded-for` isolation for rate-limit tests.
- **Path alias:** `@/*` → `./src/*` (`tsconfig.json`). Always `@/lib/*`, `@/db/*`, `@/components/*`.
- **Target ES2017**, `jsx: react-jsx`, `moduleResolution: bundler`, `incremental: true`.

## Conventions & Gotchas (deviations from defaults)

- **Tailwind v4 CSS-first — no `tailwind.config.*`.** All tokens in `src/app/globals.css:@theme` (`--color-forest`, `--color-accent`, `--color-cream`, radii, shadows). Extend only there; no arbitrary `text-[13px]`.
- **`next.config.ts:images.unoptimized: true`** is intentional (no `sharp` in deploy). Don't re-enable without infra.
- **Redirects live in `next.config.ts:redirects()`:** `/loans/*` → `/modular-home-financing/loan-options/*`, `/manufacturers` → `/modular-home-financing/manufacturers`, `/states/:state` → `/modular-home-financing/states/:state`, `/get-started-v2` → `/get-started` (temp), `/playbook` → `/learn`, plus source-parity aliases `/compare/fha-vs-conventional` → `…-prefab` and `/compare/prefab-vs-site-built` → `…-costs`. Add new aliases there only.
- **`drizzle.config.ts` (primary) + `.json` fallback** — both `out: ./drizzle`, `strict/verbose`, `url: home_financing_user:secret@localhost:5434/home_financing_dev` (runtime `DATABASE_URL` wins). Keep them in sync after schema edits (`npm run db:generate` writes to `drizzle/`).
- **`tsconfig.json:strict:true`, `skipLibCheck:true`, `isolatedModules:true`, `exclude: [node_modules,skills]`.** `eslint.config.mjs` also ignores `skills/**` + `infrastructure/**` — operator-managed folders stay out of checks/tests/compilation. Don't add `z-ai-web-dev-sdk`; don't re-include `skills`.
- **Rate limiter is in-memory `Map`.** `8 / 10 min` per IP on `POST /api/applications` (`clientKey` via `x-forwarded-for`/`x-real-ip`). Under-limits on multi-instance — migrate to Redis if scaling.
- **Tests: Vitest unit + Playwright E2E.** 37 unit tests in `src/lib/*.test.ts` (`npm run test`) + 44 E2E tests in `e2e/` (`smoke`/`seo`/`funnel`/`assets`/`parity`, chromium via `npm run e2e`). `assets.spec.ts` guards fourteen image assets (6 heroes/OG + 5 manufacturer wordmarks + 3 testimonial avatars) + two `/compare/*` aliases (2026-09-11 incidents). `parity.spec.ts` pins the markdown-OOM regression (`#### ` articles must render) and the modfii.com visual-parity additions. The funnel valid-payload E2E needs Postgres; the rest run DB-less.
- **Markdown renderer is loop-guarded.** `src/lib/markdown.tsx` renders `#### ` as `h4` and its paragraph branch always consumes ≥1 line — an H4 line once fell through and looped forever, OOM-ing the whole next-server process (2026-09-11 origin 502). Regression-pinned by `markdown.test.ts` + `parity.spec.ts`.
- **Kebab route folders** (`modular-home-financing`, `construction-loans`), `kebab-case.json` data, `kebab-case.tsx` components (grandfathered; new components prefer `PascalCase.tsx` — don't mass-rename).

## Environment & Services

- **Required env:** `DATABASE_URL` (`home_financing_*` on `:5434` — matches `docker-compose.yml` **and** `.env.example` now), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (must be canonical public origin in prod — `localhost` breaks with `Invalid origin`), `NEXT_PUBLIC_SITE_URL` (for `metadataBase` + sitemap — **current deployment is `https://modfii.jesspete.shop/`**; a wrong value makes sitemap/OG emit the wrong host), `CRON_SECRET`.
- **Never commit:** `.env`, `.env.*.local`, `docs/bak.env`, `**/bak.env`, `*.env.bak`, `docs/env.tgz`, `ssh-key.txt` — all `.gitignore`d. `.env` was untracked on 2026-09-11 after being found committed with real secrets (`d572d73`) — **rotate `BETTER_AUTH_SECRET` + `CRON_SECRET`**: they remain in git history.

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

*Last verified 2026-09-11 (remediation pass 2: markdown OOM fix + modfii.com visual parity — wordmark logos, testimonial avatars, scroll reveals, accordion animation, footer socials/Legal, learn-hub and calculator rebuilds) against `package.json` (next ^16.3.4, react ^19.3.0, tailwind ^4.3.3, vitest ^3.2), `eslint.config.mjs` (skills + infrastructure ignored), `tsconfig.json`, `next.config.ts` (11 redirects), `drizzle.config.ts/json` (5434), `docker-compose.yml`, `src/db` (8 tables), `src/lib` (+ `*.test.ts`), `public/images/*` + `public/brand/og-image.jpg` (every referenced asset exists), `playwright.config.ts` (3002), `e2e/*` 27 tests, `vitest.config.ts`.*

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
