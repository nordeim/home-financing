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
| `npm run e2e` | Playwright E2E chromium (prod `next start` on 3002, 121 tests per project; 120/121 without a DB) |
| `npm run test` | Vitest unit suite (41 tests — calculator 11 + matching 13 + rate-limit 9 + markdown 8) |
| `npm run e2e:all` | Playwright both projects (chromium+webkit) |
| `curl http://localhost:3000/api/health` | Readiness — pings DB + triggers `ensureSeeded()` |
| `bash scripts/verify-repo-hygiene.sh` | Hygiene guard — fails if `.env`/secret files are tracked (pass-8 R7-1) |
| `docker compose down -v` | **Destructive** — wipes `home_financing_data` volume |

**Order that matters:** `db:setup` → `lint` → `typecheck` → `test` → `build` → `e2e` before PR.

## Architecture — what an agent will miss

- **File-backed seeds are the write path.** Edit `src/data/*.json` + `src/lib/lenders.ts`, not Postgres rows. `ensureSeeded()` is idempotent via `globalThis.__modfiiSeedPromise` + `count(lenders) > 0` guard + `onConflictDoNothing`. Called in `/api/health` and `/api/applications` and via `npm run db:seed` (`src/scripts/seed.ts`) — reuse, don't duplicate.
- **Visual parity with modfii.com is a design contract.** The header is a light frosted bar — `bg-background/80` + `backdrop-blur-lg` (16px) + `border-border/50` + inner `h-16 md:h-20` (64px mobile / 81px rendered desktop) — in every state, with the desktop nav visible from `md` (768px) at `gap-8` and a flat `px-4` container inset, aligned to the live source bar (pass-5 + pass-7). Interior heroes flow through `PageHero` (`src/components/page-shell.tsx`) — centered, photo-backed, star eyebrow pill, optional amber `highlight` title line, CTA pair, glass stat chips; `titleSize` prop scales H1s (60px guides / 48px glossary). Don't reintroduce left-aligned gradient heroes or an amber header CTA (it is a forest "Get Started" pill).
- **Brand mark is the rotated-square gradient badge + two-tone wordmark.** Header and footer render a 3-div CSS badge (`relative w-8 h-8` → gradient square `rotate-3 rounded-lg` → inner `bg-background` square → `w-4 h-4` gradient core) beside `Mod<primary>Fii</primary>` — pass-5 flipped the pass-3 "circle glyph" pin (that SVG is the favicon only, on both sites). Desktop More dropdown carries exactly two items (ADU Financing, Tiny Home Financing) like the source.
- **Pool singleton.** Import `{ db, pool }` only from `@/db` (`src/db/index.ts`). `globalThis.__arenaNextJsPostgresqlPool` prevents HMR pool leaks. Never `new Pool()` inline.
- **Server Components by default.** `"use client"` only for `site-header`, `prequal-form`, `calculator-app`, `learn-explorer`, `reveal`, and the required file-convention boundary `src/app/error.tsx` (Next.js 16 `error.md` — error boundaries must be Client Components; `retry` stable since 16.3, `reset` kept as alias for back-compat; `global-error.tsx` would also be client if added). Never import a Server Component into a Client Component.
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
- **Tests: Vitest unit + Playwright E2E.** 41 unit tests in `src/lib/*.test.ts` (`npm run test`: calculator 11 + matching 13 + rate-limit 9 + markdown 8) + **121 E2E tests per project** in `e2e/` (`smoke 8`/`seo 16`/`funnel 5`/`assets 19 runtime`/`parity 73 runtime`, chromium via `npm run e2e`; 103 declarations + data-driven loops — `playwright --list` shows 122 listed but 121 executed; 122 is a display artifact counting one alias helper). `assets.spec.ts` guards fourteen image assets + two `/compare/*` aliases (2026-09-11 incidents). `parity.spec.ts` pins the markdown-OOM regression, the visual-parity additions, the pass-3/4 live-source pins, the pass-5 pins (rotated-square badge, header bar metrics /80+16px+h-20, hero source paddings + `max-w-xl` grid, intro eyebrow RESTORED — the pass-4 removal was a wrong pin, button chrome 10px/500/px-8, radius tokens md=10px/2xl=16px/xl=12px, wordmark strip `py-8 bg-muted/30 border-y`, testimonial `bg-background` 16px cards, heading hierarchy hero-H2/intro-H1, FAQ H3 questions, interior H1 sizes + long-form guide titles, SEO title patterns, guide content-depth outlines for hub/FHA/ADU/tiny/construction, `/debug-error-probe` error-boundary render), and the pass-7 pins (header responsive `h-16 md:h-20` + `md`-visible nav `gap-8` + `px-4` container, home intro `max-w-5xl` + source card/icon-chip/chips chrome, problem/solution/steps/testimonials/standards source chrome, hero/closing CTA h-11 + CircleCheck checks, FAQ 600-weight + text-sm answers, wizard single-H1, footer H4 columns + 8-col grid + filled socials, glossary H3 terms + Related Resources, 11 exact SEO titles, hub 20-FAQ + Sources + closers, mortgage/financing/about/resources outlines, calculator FAQ H3s). The funnel valid-payload E2E needs Postgres; the rest run DB-less (120/121). Security headers are pinned by `smoke.spec.ts` (CSP/XFO/nosniff/referrer/permissions from `next.config.ts:headers()`), and the JSON-error contract (incl. DB-outage 500) by `funnel.spec.ts` + `scripts/verify-db-outage.sh`.
- **Markdown renderer is loop-guarded.** `src/lib/markdown.tsx` renders `#### ` as `h4` and its paragraph branch always consumes ≥1 line — an H4 line once fell through and looped forever, OOM-ing the whole next-server process (2026-09-11 origin 502). Regression-pinned by `markdown.test.ts` + `parity.spec.ts`.
- **Kebab route folders** (`modular-home-financing`, `construction-loans`), `kebab-case.json` data, `kebab-case.tsx` components (grandfathered; new components prefer `PascalCase.tsx` — don't mass-rename).
- **Undocumented-but-shipped routes:** `/debug-error-probe` (`src/app/debug-error-probe/page.tsx`) is a deliberate error-boundary probe (throws `probe-error-boundary`; `error.tsx` catches → renders recovery UI with HTTP 200 on the live deploy). Not in `sitemap.ts`, not linked — keep it out of the sitemap; `/editorial-policy` + `/corrections` ARE in the sitemap (static).

## Environment & Services

- **Required env:** `DATABASE_URL` (`home_financing_*` on `:5434` — matches `docker-compose.yml` **and** `.env.example` now), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (must be canonical public origin in prod — `localhost` breaks with `Invalid origin`), `NEXT_PUBLIC_SITE_URL` (for `metadataBase` + sitemap — **current deployment is `https://modfii.jesspete.shop/`**; a wrong value makes sitemap/OG emit the wrong host), `CRON_SECRET`.
- **Never commit:** `.env`, `.env.*.local`, `docs/bak.env`, `**/bak.env`, `*.env.bak`, `docs/env.tgz`, `ssh-key.txt` — all `.gitignore`d. `.env` was untracked on 2026-09-11 after being found committed with real secrets (`d572d73`), **re-committed 2026-09-12 in `f8e99ab`** (found by the pass-8 audit, docs/AUDIT_REPORT_pass7.md A-01), and untracked again in pass-8 — `scripts/verify-repo-hygiene.sh` now guards the index. **Rotate `BETTER_AUTH_SECRET` + `CRON_SECRET`**: both remain in git history (`d572d73`, `f8e99ab`).

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

*Last verified 2026-09-15 (pass 9 — drift alignment D-01→D-07: STATIC_PATHS 40→39 (152 total = 39+23+50+40), build 42+8/36+7→35+8 (43 routes), PAD 37/82→41/121, vitest badge 3.2→4.1, playwright 122 listed→121 executed (display artifact), host `modfii.jesspete.shop` locked, hygiene GO; validation `docs/VALIDATION_REPORT_2026-09-15.md` (121/121 e2e, 41/41 unit, build 43/43); pass 8 — audit remediation: `.env` untracked (was re-committed in f8e99ab — rotate BETTER_AUTH_SECRET + CRON_SECRET) + `scripts/verify-repo-hygiene.sh` guard + vitest ^4.1.11 (GHSA-82fw-gwwq-j7x9); audit report docs/AUDIT_REPORT_pass7.md (GO after R7-1), plan docs/REMEDIATION_PLAN_pass8.md; gate re-run green: lint 0/0, typecheck, 41/41 unit, build 43/43, 120/121 E2E DB-less. Pass 7 — live-source parity audit + remediation, TDD: 40 new E2E pins written RED then GREEN. Changes: header responsive `h-16 md:h-20` + md-visible nav `gap-8` + flat `px-4` container (site-wide); home intro `max-w-5xl` column + House-icon eyebrow + source card chrome (rounded-xl p-5 md:p-6 border-border/50 shadow-sm, 40px gradient icon chips, text-sm bodies, 2-col chips); problem/solution cards p-5 + /20 borders + primary/5 wash; steps hover states + primary/10 numerals + 56px chips + gradient connectors; testimonials gradient band + H2 ramp; standards muted/30 border-y band + p-6 cards; hero/closing CTA h-11 chrome + CircleCheck hero checks + gap-5; FAQ 600-weight questions + text-sm answers + 200ms chevrons; radius token xl 14→12px (source CSS probe: shadcn `--radius:.75rem` scale); get-started H1 desktop ramp + pulse eyebrow + source mobile-only Why-Choose/Common-Questions band + muted/50 steps band; wizard step titles de-H1'd (single document H1); footer `grid-cols-2 md:grid-cols-8` + col-span-2 brand column + H4 column headings + w-10 filled social pills + Legal folded into the grid; glossary terms h2→h3 + Related Resources closers; 11 exact source SEO titles (home/fha/mortgage/financing/about/manufacturers/states/rates/cost/down-payment absolute + get-started default); guides.ts: hub +7 sections + 20-question FAQ + numbered Sources + closing band, FHA FAQ/Sources/Ready closers, mortgage + financing full source outlines, GuideView `faqsHeading`/`relatedHeading`/`sources`/`closing` schema + FAQ questions as H3; about +4 sections; resources +2 sections; calculator FAQ H3s. Full gate after changes: `lint 0/0`, `typecheck`, `41/41` unit, `build 43/43`, **120/121 E2E** chromium DB-less (funnel valid-payload needs Postgres). Local-prod parity re-measure: home 7251 vs 7355 px (−1.4%), home-mobile 11151 vs 11274 (−1.1%), header/H1/CTA/nav metrics identical. Evidence: `docs/REMEDIATION_PLAN_pass7.md` + `scripts/live-parity-*.mts`; probe data under `/home/z/my-project/audit/live-parity/`. Pin flips with fresh evidence: FAQ question weight 400→600, get-started H1 24→48px ramp (source renders two H1s; clone keeps one semantic H1), `--radius-xl` 14→12px. E2E counts now 121 per project = smoke 8 + seo 16 + funnel 5 + assets 19 + parity 73 (103 declarations + data-driven loops). Backlog: ADU/tiny/construction guide H3 body depth, cost/down-payment/states/rates/manufacturers depth. Earlier passes 1–6 as previously documented)*

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
