---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
---

# ModFii — Home Financing (Prefab Mortgage Marketplace)

> **Brand:** ModFii — "The #1 Prefab Home Mortgage Platform" — prefab/modular/ADU/tiny-home financing marketplace matching borrowers to prefab-specialist lenders.
> **Stack:** Next.js 16.3 (App Router) + React 19.3 + TypeScript 5.9 strict + Tailwind CSS v4.3 CSS-first `@theme` + Drizzle ORM 0.45 + PostgreSQL 17 + `pg` + `next/font` (DM Sans + Outfit) + lucide-react + Drizzle Kit 0.31 / `tsx` 4.23 + Vitest 4.1.11 (unit, 41 tests — pass-8 audit bump) + Playwright 1.63 + `@axe-core/playwright` 4.13 (E2E, 121 tests per project — 103 declarations incl. data-driven loops). Package manager: npm (package-lock.json).
> **Repo:** `home-financing` (package.json name `nextjs-postgresql-template` — legacy; brand is **ModFii**). Single app, no monorepo/turborepo.

---

## Core Identity & Purpose

**What it does:** Content + transaction hybrid — editorial guides, calculators, and lender-matching funnel for prefab/modular/manufactured/ADU financing. Borrowers submit a pre-qual application (`/get-started`) → server validates + scores against seeded lenders (`matchLenders`) → persists `applications` + `application_matches` → returns top-4 matches with estimated rate/payment.

**Who it is for:** Homebuyers researching prefab financing and the internal team operating the marketplace. Domain content lives file-backed in `src/data/*.json` and is projected into Postgres at boot via `ensureSeeded()`.

**Key technical decisions that shape everything:**
- **File-backed content as source of truth** — `src/data/{articles,manufacturers,states,glossary}.json` → typed catalog (`src/lib/catalog.ts`) → idempotent `ensureSeeded()` into Drizzle tables. DB is a projection, not the authoring store.
- **Drizzle + `pg` Pool singleton via `globalThis`** — `src/db/index.ts` holds `__arenaNextJsPostgresqlPool`; never create a second Pool.
- **App Router, Server Components by default** — data fetching and `ensureSeeded()` run server-side; client components only for interactivity (header, forms, calculators).
- **Tailwind v4 CSS-first** — design tokens in `src/app/globals.css` `@theme`; never use Tailwind v3 config patterns.
- **Static-first with `force-dynamic` only where DB is touched** — API routes and seeded pages opt into `export const dynamic = "force-dynamic"`.

---

## Foundational Principles

### Meticulous Approach — Six-Phase Workflow (MANDATORY for every task)

1. **ANALYZE** — Deep, multi-dimensional requirement mining. Never assume. Surface ambiguities, explore alternatives, assess risks/dependencies.
2. **PLAN** — Structured roadmap with sequenced phases, checklists, success criteria, estimates. Present for confirmation.
3. **VALIDATE** — Explicit user approval before coding. Address concerns/modifications.
4. **IMPLEMENT** — Modular, tested, documented. Set up env, build in testable slices, docs alongside code. Library-first (Radix/shadcn patterns already in `src/components/ui.tsx`).
5. **VERIFY** — QA against success criteria: tests, lint, typecheck, build, a11y/perf, edge cases.
6. **DELIVER** — Complete handoff: usage, runbooks, challenges/solutions, next steps.

### Project-Specific Principles

- **Content fidelity over CMS convenience** — never hand-edit DB rows; edit `src/data/*.json` and re-seed.
- **Prefinancing accuracy** — rate/payment math must be auditable (see `src/lib/calculator.ts`, `src/lib/matching.ts`). No magic numbers without named constants.
- **Graceful degradation** — if `DATABASE_URL` unreachable, pages should not hard-crash except API routes that explicitly require DB.
- **Anti-generic UI** — intentional editorial + brutalist restraint (forest/moss/cream/accent), bespoke typography (Outfit display, DM Sans body), never purple-gradient clichés.

---

## Implementation Standards

### General Coding Practices

- **Early returns** over nested conditionals.
- **Composition over inheritance**.
- **Self-documenting names**; no `any`. Prefer `unknown` and narrow.
- **TDD when logic-bearing** — Red → Green → Refactor → Commit, one cycle per commit. Bugs get a failing regression test first. Exception: pure CSS/layout may skip TDD.
- **Handle all UI states**: loading / error / empty / success. Loading only when no data exists. Disable buttons during async + show spinner. Every list has an empty state. Every async handler has `onError` user feedback.

### TypeScript Strict Mode (non-negotiable)

- `strict: true` (already in `tsconfig.json`). `allowJs: false`, `skipLibCheck: true`, `isolatedModules: true`.
- Never use `any`. Use `unknown`, `type` guards, or generics.
- Prefer `interface` for structural shapes, `type` for unions/intersections.
- Avoid explicit return types unless they add safety; lean on inference.
- Path alias `@/*` → `./src/*` (`tsconfig.json:paths`). Always use `@/lib/*`, `@/components/*`, `@/db/*`.

### Next.js 16 + React 19 — App Router (authoritative)

- **App Router only** — routes under `src/app/**` (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`). No `pages/` directory.
- **Server Components by default** — add `"use client"` only when using `useState`/`useEffect`/event handlers/browser APIs (`src/components/site-header.tsx`, `prequal-form.tsx`, `calculator-app.tsx` are correct examples) **plus the required file-convention boundary `src/app/error.tsx`** (Next.js 16 `error.md` — error boundaries must be Client Components; `retry` is stable since 16.3, `reset` is the legacy alias kept for back-compat; `global-error.tsx` would also be client if added).
- **Never import a Server Component into a Client Component** — extract shared UI to a leaf component.
- **Data fetching in Server Components** — direct `db` access or `ensureSeeded()` + `catalog` helpers; no client-side `fetch` for own data except API routes.
- **`next/font`** — `DM_Sans` + `Outfit` already configured in `src/app/layout.tsx` with `variable` + `display: swap`. Use `var(--font-*)` tokens, never `<link>` for Google Fonts.
- **`next/image`** — used for brand assets (`/brand/modfii-logo-icon.svg`). Config: `images.unoptimized: true` in `next.config.ts` — intentional (no sharp optimizer in this deploy). Do not re-enable without infra change.
- **Metadata API** — `export const metadata` / `generateMetadata()` in `src/app/layout.tsx` and per-route. `metadataBase` from `NEXT_PUBLIC_SITE_URL`.
- **Route Handlers** — `src/app/api/*/route.ts` with `export const dynamic = "force-dynamic"`. Validate body with `matching.ts` validators (Zod not yet adopted — keep manual validators consistent until migration).
- **Redirects** — canonical redirects live in `next.config.ts:redirects()` (legacy `/loans/*`, `/manufacturers`, `/states/*`, `/get-started-v2`, `/playbook`). Add new redirects there, not in middleware.
- **No `middleware.ts` / `proxy.ts`** in this codebase — proxy concerns are handled at the reverse proxy.
- **Errors/Loading** — every segment that fetches should have `loading.tsx`/`error.tsx` (currently missing in many segments — add incrementally). `src/app/error.tsx` is the root error boundary and **must** be `"use client"` per the `error.md` convention — it receives `{ error: Error & { digest?: string }, retry?: () => void, reset?: () => void }` (`retry` stable since Next 16.3; `reset` without re-fetch is the legacy alias, kept via `retry ?? reset`) and logs via `useEffect(() => console.error(error), [error])`.

### React 19 Patterns

- Functional components only. No class components.
- Co-locate `Component.tsx` + `Component.test.tsx` (when tests exist) — no deep barrel re-exports that break HMR.
- `useId()` for a11y ids (see `site-header.tsx`). `useEffect` cleanup always returned (body `overflow` lock is a correct example).
- `lucide-react` for icons; never inline SVG without a component wrapper.

### Tailwind CSS v4 — CSS-first `@theme` (critical)

```css
/* src/app/globals.css is the ONLY theme definition — never add tailwind.config.js */
@import "tailwindcss";
@theme {
  --font-sans: var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-outfit), ...;
  --color-background: hsl(40 33% 99%);
  --color-foreground: hsl(155 30% 12%);
  --color-primary: hsl(155 45% 28%);
  --color-accent: hsl(38 92% 50%);
  --color-cream: hsl(40 40% 96%);
  --color-forest: hsl(155 42% 16%);
  /* …plus moss/muted/border/ring/radii/shadow — extend here, never arbitrary values */
}
```

- Never use `tailwind.config.ts` — project is v4 CSS-first. Add tokens only via `@theme`.
- Mobile-first, no arbitrary `text-[13px]` escapes. Use token classes or extend `@theme`.
- Use `cn()` from `src/components/ui.tsx` for conditional merging. Variants are explicit (`Button` variants: `primary | secondary | accent | outline | ghost | onPrimary`; sizes `sm | md | lg`).

### Drizzle ORM + PostgreSQL 17

- **Schema:** `src/db/schema.ts` — `pgTable` with `uuid().defaultRandom().primaryKey()`, `varchar` length-capped, `text().array()`, `timestamp({withTimezone:true})`. Indices via table callback.
- **Tables:** `lenders`, `applications`, `application_matches`, `manufacturers`, `states`, `articles`, `glossaryTerms`, `loanProducts`. Mirrors `src/data/*.json` + `src/lib/lenders.ts` seeds.
- **Client:** `src/db/index.ts` — `Pool` from `pg`, `drizzle(pool)`, `globalForDb.__arenaNextJsPostgresqlPool` singleton. Do not instantiate `Pool` elsewhere.
- **Seeding:** `src/lib/ensure-seeded.ts` — global promise `__modfiiSeedPromise`, checks `count(lenders) > 0` then `insert(...).onConflictDoNothing`. Called in `app/api/health` and `app/api/applications`; reuse, don't duplicate seeding.
- **Migrations/Introspection:** Drizzle Kit 0.31 via `drizzle-kit` + `tsx` 4.23 (devDeps). Config in `drizzle.config.ts` (primary, `satisfies Config`) and `drizzle.config.json` (JSON fallback) — `dialect postgresql`, `schema ./src/db/schema.ts`, `out ./drizzle`, `strict/verbose`; `dbCredentials.url` defaults to `postgresql://home_financing_user:home_financing_secret@localhost:5434/home_financing_dev` (runtime `DATABASE_URL` wins). Migrations in `drizzle/` (`0000_amusing_thena.sql` 8 tables + `0001_sharp_stick.sql` alters `manufacturers.founded 8→32`). `pgcrypto` + `pg_trgm` in `infrastructure/postgres/init/*.sql`.
- **Query style:** `select().from().where(eq(...)).limit(1)`; `insert().values().returning()`. Never raw SQL unless `sql` tag is unavoidable — prefer Drizzle builders.

### Component Library Discipline

- **Use `src/components/ui.tsx` primitives** (`Button`, `ButtonLink`, `Container`, `Badge`, `Card` etc.) — do not rebuild buttons/cards from scratch.
- Wrapping/styling is allowed; re-implementing is not.
- `site-header.tsx` / `site-footer.tsx` / `page-shell.tsx` are layout primitives — keep navigation in `site-header.tsx` (`NAV` + `MORE` arrays), footer links in `site-footer.tsx`.

### Domain Logic

- `src/lib/calculator.ts` — `calculatePayment()` owns amortization, PMI (`0.65%` annual when `<20%` down), tax/insurance/HOA, site-built comparison (`1.15×`). Constants `PMI_ANNUAL_RATE`, `1.15` are load-bearing — change only with product approval.
- `src/lib/matching.ts` — `matchLenders()` scoring (`+20` credit floor, `+18` specialty, `+12` green, etc.) and `validateApplication()` (regex `EMAIL_RE`, ZIP `^\d{5}$`, phone digits ≥10). Keep scoring deterministic and tested.
- `src/lib/rate-limit.ts` — in-memory `Map` buckets (`rateLimit(key, limit, windowMs)` + `clientKey(req)` via `x-forwarded-for`/`x-real-ip`). Note: single-instance memory — acceptable for now; document if moving to multi-instance.
- `src/lib/lenders.ts` — `LENDER_SEEDS` + `LOAN_PRODUCT_SEEDS` are the canonical seed constants.
- `src/lib/catalog.ts` + `src/lib/guides.ts` + `src/data/*.json` — typed catalog (`Manufacturer`, `StateGuide`, `Article`, `GlossaryTerm`). `src/lib/markdown.tsx` renders article `content` (markdown) — supports `#`–`####` headings; H4+ lines are handled explicitly and the paragraph branch always consumes ≥1 line (loop-safety after the 2026-09-11 OOM incident).

---

## Development Workflow

### Environment Setup

```bash
# 1) Clone and install (npm — lockfile is package-lock.json)
npm install

# 2) Env — copy example and fill required values
cp .env.example .env
# Required: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_SITE_URL, CRON_SECRET
# Generate secrets:
openssl rand -base64 32   # BETTER_AUTH_SECRET
openssl rand -hex 16      # CRON_SECRET

# 3) Database — Postgres 17 via Docker (port 5434 → 5432 in container)
docker compose up -d
docker compose logs -f postgres   # verify: pgcrypto + pg_trgm init

# Optional: point DATABASE_URL at an existing PG17 instead of Docker
# DATABASE_URL=postgresql://home_financing_user:home_financing_secret@localhost:5434/home_financing_dev

# 4) Run
npm run dev    # http://localhost:3000
```

### Build Commands

| Command | Purpose | Verified |
|---------|---------|----------|
| `npm run dev` | Start Next.js dev server (http://localhost:3000) | `package.json:scripts.dev` |
| `npm run build` | Production build (validates `next.config.ts:redirects`, requires `skills` excluded in `tsconfig`) | `package.json:scripts.build` |
| `npm start` | Start production server (after build) | `package.json:scripts.start` |
| `npm run lint` | ESLint (flat config, `eslint.config.mjs` + `eslint-config-next/core-web-vitals`) | `package.json:scripts.lint` |
| `npm run lint:fix` | ESLint auto-fix | `package.json:scripts.lint:fix` |
| `npm run typecheck` | `tsc --noEmit` type checking (`skills` excluded) | `package.json:scripts.typecheck` |
| `npm run db:generate` | Generate Drizzle migration (`drizzle-kit generate`, uses `drizzle.config.ts`) | `package.json:scripts.db:generate` |
| `npm run db:migrate` | Apply migrations (`tsx src/scripts/migrate.ts`, local-host guarded, `drizzle/` → PG) | `package.json:scripts.db:migrate` |
| `npm run db:seed` | Idempotent seed (`tsx src/scripts/seed.ts` → `ensureSeeded()`, 8 lenders/40 manuf/50 states/23 articles/59 glossary/5 products) | `package.json:scripts.db:seed` |
| `npm run db:setup` | `db:migrate && db:seed` — one-shot init for app launch | `package.json:scripts.db:setup` |
| `npm run db:reset` | Destructive local reset (`tsx src/scripts/reset.ts` — drops `public` + `drizzle` schemas, restores `pgcrypto/pg_trgm`) | `package.json:scripts.db:reset` |
| `npm run e2e` | Playwright E2E (chromium, `playwright.config.ts`, prod `next start` on 3002) | `package.json:scripts.e2e` |
| `npm run e2e:all` | Playwright both projects (chromium + webkit) | `package.json:scripts.e2e:all` |
| `docker compose up -d` | Start Postgres 17 | `docker-compose.yml:postgres:17-alpine` |
| `docker compose down` | Stop Postgres | `docker-compose.yml` |
| `docker compose down -v` | Reset Postgres + delete volume `home_financing_data` | `docker-compose.yml` |
| `docker compose logs -f postgres` | Tail DB logs / healthcheck | `docker-compose.yml` |

> `format` / `db:studio` not defined. `db:seed`/`db:generate`/`db:migrate` now via `npm run db:*` (see Build Commands). `test` not yet — use `npm run e2e` for E2E.

### Database & Seeding

```bash
# Drizzle configs — TS primary, JSON fallback
cat drizzle.config.ts   # satisfies Config, schema ./src/db/schema.ts, out ./drizzle
cat drizzle.config.json # same content (JSON) — keep in sync
ls drizzle/             # 0000_amusing_thena.sql (8 tables) + 0001_sharp_stick.sql

# One-shot init (migrate + seed) — idempotent, local-host guarded
npm run db:setup
# → [db] migrations applied  +  [db] seed complete (40 manuf/50 states/23 articles/59 glossary)

# Granular:
npm run db:generate       # diff schema → drizzle/*.sql
npm run db:migrate        # apply drizzle/* to PG (assertLocalDatabase)
npm run db:seed           # ensureSeeded() — also auto-runs in /api/health
npm run db:reset          # DROP SCHEMA public,drizzle CASCADE + restore extensions (destructive local only)

# Health check seeds automatically
curl http://localhost:3000/api/health
# → { ok: true, status: "ok", db: true } (also triggers ensureSeeded)

# Manual: ensureSeeded() is idempotent — safe to call anywhere server-side
# Never seed from client components.
```

- `docker-compose.yml` DB: `home_financing_dev` / `home_financing_user` / `home_financing_secret` on host port **5434** (migrated from `scandihaven_*` on 5432 in this branch). Healthcheck `pg_isready -U home_financing_user -d home_financing_dev`. Script guards `src/scripts/local-db.ts` refuse non-local `DATABASE_URL` for `migrate/seed/reset`.
- `drizzle.config.ts`/`drizzle.config.json` `dbCredentials.url` defaults to `postgresql://home_financing_user:home_financing_secret@localhost:5434/home_financing_dev` — overridden by `DATABASE_URL` env at runtime; keep both configs in sync.

### Project Structure

```
src/
  app/                    # App Router — every route is a folder with page.tsx
    layout.tsx            # Root layout: SiteHeader + SiteFooter + next/font + metadata
    globals.css           # Tailwind v4 @theme — single source of design tokens
    page.tsx              # / — hero + problems/fixes/steps
    sitemap.ts            # Next.js sitemap generation
    robots.ts             # robots.txt
    not-found.tsx         # 404
    api/
      health/route.ts     # GET — db ping + ensureSeeded (force-dynamic)
      applications/route.ts # POST — validate → matchLenders → insert application + matches
      calculator/route.ts # Calculator endpoint
    get-started/page.tsx  # /get-started — prequal funnel (canonical; /get-started-v2 redirects here)
    calculator/page.tsx   # /calculator — calculator-app
    financing/page.tsx, mortgage/page.tsx, adu-financing/page.tsx, ...
    modular-home-financing/** # Prefab hub (cost, rates, down-payment, loan-options, manufacturers, states, ...)
    compare/**            # Comparison pages
    construction-loans/** # Construction loan pages
    authors/[authorSlug]/page.tsx, glossary/page.tsx, resources/page.tsx, ...
  components/
    ui.tsx                # Primitives: cn, Button, ButtonLink, Container, Badge...
    site-header.tsx       # Fixed header, NAV + MORE, mobile drawer (client)
    site-footer.tsx       # Footer
    page-shell.tsx        # Shared page shell
    prequal-form.tsx      # Prequal form (client)
    calculator-app.tsx    # Calculator UI (client)
    learn-explorer.tsx    # Learn hub island: search/filter chips/featured/tools/newsletter (client)
    reveal.tsx            # Scroll-reveal wrapper for home intro (client)
    guide-screen.tsx      # Guide/article renderer
  data/
    articles.json         # Article corpus (source of truth)
    manufacturers.json    # Manufacturers corpus
    states.json           # State guides corpus
    glossary.json         # Glossary corpus
  db/
    schema.ts             # Drizzle pgTable definitions (8 tables, manufacturers.founded varchar 32)
    index.ts              # Pool singleton + drizzle(pool)
  lib/
    catalog.ts            # Typed catalog interfaces + re-exports of data/*.json
    guides.ts             # Guide helpers
    lenders.ts            # LENDER_SEEDS (8) + LOAN_PRODUCT_SEEDS (5)
    calculator.ts         # Payment math (amortize, PMI, comparisons)
    matching.ts           # matchLenders scoring + validateApplication
    ensure-seeded.ts      # Idempotent file→DB projection (global promise)
    markdown.tsx          # Markdown renderer for articles
    rate-limit.ts         # In-memory bucket limiter + clientKey()
  scripts/
    local-db.ts           # isLocalDatabaseUrl / assertLocalDatabase guard
    migrate.ts            # drizzle-orm migrator (CJS-safe main())
    seed.ts               # ensureSeeded wrapper (CJS-safe main())
    reset.ts              # DROP SCHEMA public+drizzle CASCADE + extensions
drizzle/
  0000_amusing_thena.sql  # 8 tables baseline
  0001_sharp_stick.sql    # alter manufacturers.founded 8→32
  meta/_journal.json
 e2e/
  smoke.spec.ts / seo.spec.ts / funnel.spec.ts /  # Playwright 121 tests per project (chromium)
  assets.spec.ts / parity.spec.ts
 playwright.config.ts      # E2E config (prod next start on 3002, reuseExistingServer)
 drizzle.config.ts         # TS config (primary)
 drizzle.config.json       # JSON fallback (keep in sync)
infrastructure/
  postgres/init/*.sql     # pgcrypto + pg_trgm extensions
public/
  brand/modfii-logo-icon.svg, brand/og-image.jpg, ...
```

---

## Testing Strategy

### Current State (post-remediation 2026-09-11)

- **Vitest unit runner installed** — `vitest.config.ts` (node env, `@` alias), `src/lib/{calculator,matching,rate-limit,markdown}.test.ts` — **41 tests, all passing** (`npm run test` / `test:watch` / `test:coverage`). Pure/deterministic domains only; DB-touching code stays under Playwright. (`calculator 11 + matching 13 + rate-limit 9 + markdown 8` — markdown pins the 2026-09-11 H4/OOM incident.)
- **Playwright E2E** — `@playwright/test 1.63.0` + `@axe-core/playwright 4.13.0`, `playwright.config.ts` (prod `next start` on 3002, `reuseExistingServer:true`), **121 tests per project** (103 declarations expanding via data-driven loops: +14 asset URLs, +2 H4 articles, +11 SEO-title routes): `smoke.spec.ts` (8 — home/nav/footer, get-started via the "Get Started" CTA, calculator, health, 404 (H1-level pin — footer H4s are headings since pass-7), security headers, axe critical), `seo.spec.ts` (16 — sitemap absolute locs + host-rewrite, robots, title, OG, + 11 exact source title-pattern pins (pass-7): home `ModFii | Modular & Prefab Home Loans`, get-started (site default), fha, mortgage, financing, about, manufacturers, states, rates, cost, down-payment), `funnel.spec.ts` (5 — POST `/api/applications` 400/200 + `x-forwarded-for` isolated, burst 429, DB-outage JSON-500 contract, UI no-500), `assets.spec.ts` (19 runtime — 14 referenced image assets return 200 + no broken `<img>` on `/`, `/adu-financing`, `/tiny-home-financing`, and the two `/compare/*` alias redirects resolve), `parity.spec.ts` (73 runtime — markdown-OOM regression on the two H4 articles, wordmark logos + testimonial avatars, learn-hub search/filter/featured/tools, calculator breakdown/PMI, footer Socials/Legal, wizard, the pass-3 (pass-5-corrected) pins: rotated-square badge + two-tone wordmark, always-light header, intro eyebrow RESTORED, closing trust line, 2-item More dropdown; the pass-4 pins: source hero overlay, hub Last-Updated/truth callout/dual CTA/4 chips, FHA/VA source heroes, calculator pill/crumb; the pass-5 pins: header bar /80+16px+h-20, hero paddings + `max-w-xl` grid, button chrome, radius tokens (md 10 / xl 12 / 2xl 16 px), wordmark strip, testimonial cards, heading hierarchy, exclusive FAQ accordions, interior H1 sizes, SEO title patterns, guide outlines, `/debug-error-probe`; and the pass-7 pins: header `h-16 md:h-20` + md nav `gap-8` + `px-4` container, home intro `max-w-5xl` + source card/icon-chip/chips chrome, problem/solution/steps/testimonials/standards source chrome, hero/closing h-11 CTAs + CircleCheck checks, FAQ 600-weight + text-sm answers, wizard single-H1, footer H4 columns + 8-col grid + filled socials, glossary H3 terms + closers, hub 20-FAQ + Sources, mortgage/financing/about/resources outlines, calculator FAQ H3s). With Postgres: 121/121; without DB: 120/121 (funnel valid-payload is the only DB-dependent test).
- **Manual verification still:** `npm run lint` (now 0 errors / 0 warnings) + `npm run typecheck` + `npm run build` + `curl /api/health`.

### Target Pyramid (next)

- **Integration (to add)** — `POST /api/applications` with a test Postgres (or `pg-mem`/testcontainers), `ensureSeeded()` idempotency, rate-limit 429.
- **E2E (expand)** — refinance funnel permutation, `/calculator` API compute assertions, state/manufacturer content spot-checks.

### Test Commands

```bash
npm run test         # vitest run (41 unit tests)
npm run test:watch   # vitest watch mode
npm run lint         # eslint . (0 errors / 0 warnings)
npm run typecheck    # tsc --noEmit (skills excluded)
npm run build        # next build (requires skills excluded)
npm run e2e          # playwright --project=chromium (needs build; funnel happy-path also needs db:setup)
npm run e2e:all      # playwright chromium+webkit
```

### Standards (when tests exist)

- Co-locate `Component.test.tsx` next to `Component.tsx`.
- Factory pattern for test data, not fixtures copy-paste.
- Mock `db`/`Pool` at the boundary; test real scoring/math, not mocks of mocks.
- CI must run `lint + typecheck + test + build` on every PR (see `shipping-and-launch`).

---

## Code Quality Standards

### Linting & Formatting

```bash
npm run lint        # eslint .  (flat config, core-web-vitals; 0 errors / 0 warnings)
npm run lint:fix    # eslint . --fix
npm run typecheck   # tsc --noEmit (skills excluded via tsconfig)
npm run test        # vitest run (41 unit tests = calculator 11 + matching 13 + rate-limit 9 + markdown 8)
npm run e2e         # playwright (chromium, 121 tests per project)
```

- Config: `eslint.config.mjs` — `defineConfig([...nextCoreWebVitals, globalIgnores([".next/**","out/**","build/**","next-env.d.ts","skills/**","infrastructure/**"])])`. Keep flat config; do not revert to `.eslintrc`. `skills/` + `infrastructure/` are operator-managed and excluded from all checks/tests/compilation.
- No Prettier installed — formatting is via ESLint + editor. If adding Prettier, wire `eslint-config-prettier` and a `format` script; don't run two formatters that fight.
- Before pushing: `npm run lint && npm run typecheck && npm run build` must pass.

### TypeScript

- `strict: true` enforced; `skills` excluded in `tsconfig.json` (otherwise `z-ai-web-dev-sdk` missing). Fix type errors, never `// @ts-ignore` or `as any` (last resort only with comment explaining why).
- Public function params are typed; returns inferred unless inference would leak `any`.

### Naming

- Components: `PascalCase.tsx` (e.g., `SiteHeader.tsx`, `CalculatorApp.tsx`) — existing `kebab-case.tsx` is grandfathered; new files use `PascalCase`.
- Lib/utils: `camelCase.ts` (e.g., `rate-limit.ts` grandfathered kebab — new files prefer `camelCase` but do not mass-rename).
- Data: `kebab-case.json` under `src/data/`.
- Route segments: `kebab-case` folders (`modular-home-financing`, `construction-loans`).

---

## Git & Version Control

### Branching

- `main` is the deploy branch (`origin/HEAD → origin/main`).
- Feature branches: `feat/<slug>`; fixes: `fix/<slug>`; chores: `chore/<slug>`. Short-lived (1–3 days), rebase or merge via PR.
- Never commit to `main` directly for non-trivial changes.

### Commits

- Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
- Atomic commits — one logical change per commit.
- TDD: one Red→Green→Refactor cycle per commit where applicable.

### Ignored (already in `.gitignore` — do not weaken)

- `node_modules/`, `.next/`, `out/`, `dist/`, `.turbo/`, `*.tsbuildinfo`
- `.env`, `.env.local`, `.env.*.local`, `docs/bak.env`, `*.env.bak`, `docs/env.tgz`, `**/env.tgz`
- `ssh-key.txt`, `**/ssh-key.txt`, `docs/ssh-key.txt` — never commit private keys (audit 2026-09-10 R-02)
- `start_server.sh` logs/pids: `server*.log`, `server*.pid` (`!start_server.sh` is tracked)
- Python caches under `skills/`: `.venv/`, `__pycache__/`, `.mypy_cache/`, etc. — `skills/` excluded from checks/tests/compilation by operator contract.

### Hooks

- No Husky/lint-staged configured (`.git/hooks/` is stock samples). If adding pre-commit, use `husky + lint-staged` running `eslint --fix` + `tsc --noEmit` (see `setup-pre-commit` skill). Keep hook fast (<10s).

---

## Error Handling & Debugging

### API Error Handling

- `POST /api/applications` pattern is canonical: `rateLimit(429)` → `try { json } catch(400)` → `validateApplication(400)` → `ensureSeeded()` → `db.insert().returning()` → `500` on no row → loop lender matches with `eq(lenders.slug)` guard. Keep this order.
- Always return `Response.json({ error: string }, { status })` for errors; success shape is `{ data }` or the created record. No HTML error pages from API routes.
- `GET /api/health` returns `{ ok, status, db }` with `500` on DB failure — use for readiness probes.

### UI Error Handling

- Every async form (`prequal-form.tsx`) must disable submit during request, show inline validation from `validateApplication()`, and surface server errors via `onError` toast/inline alert. Never silent-fail.
- Route segments that call `ensureSeeded()`/`db` should have `error.tsx` + `loading.tsx` (many are missing — add as you touch files).

### Rate Limiting

- `src/lib/rate-limit.ts` is in-memory `Map` — resets on restart and is per-instance. Limit `8 per 10min` for `POST /api/applications` by `clientKey(req)`. If deploying to >1 instance, migrate to Redis/Upstash and document the env flag.

### Debugging

```bash
docker compose logs -f postgres          # DB health, init extension notices
curl -s http://localhost:3000/api/health | jq  # readiness
npm run typecheck                        # fastest signal for type regressions
npm run build 2>&1 | tail -n 100        # Next.js build errors (RSC boundary violations surface here)
```

---

## Communication & Documentation

- Explain **why**, not just **what** — especially for scoring weights, PMI rate, comparison multipliers.
- Document assumptions/constraints in code comments and PR descriptions.
- Keep `docs/` lean — this `CLAUDE.md` is the single source of truth for agent conventions. Don't scatter overlapping guides.
- When touching content (`src/data/*.json`), note the corpus size and any slug changes in the PR (redirects may be needed in `next.config.ts`).

---

## Project-Specific Standards

### Architecture — 3-Layer Projection Model

```
File corpus (src/data/*.json + src/lib/lenders.ts)
        ↓  typed re-export (src/lib/catalog.ts) + seeds
  ensureSeeded() (idempotent, global promise) — src/lib/ensure-seeded.ts
        ↓  onConflictDoNothing
PostgreSQL 17 (Drizzle pgTable) — src/db/schema.ts
        ↓  drizzle(pool) via globalThis singleton
App Router Server Components + Route Handlers
```

- **Do not bypass the singleton** — import `{ db, pool }` only from `@/db`. Never `new Pool()` inline.
- **Do not write to Postgres as authoring store** — edit JSON/seeds, then re-seed. Manual DB edits will be clobbered on next fresh seed if DB is reset.
- **All DB-touching routes are `force-dynamic`** — do not add `export const revalidate` to seeded pages without understanding the trade-off.

### API Design

| Route | Method | Auth | Rate Limit | Purpose |
|-------|--------|------|------------|---------|
| `/api/health` | GET | none | none | DB ping + `ensureSeeded()` — readiness probe |
| `/api/applications` | POST | none | 8 / 10 min by IP | Validate → score → persist application + top-4 matches |
| `/api/calculator` | POST | none | 60 / min per IP | Calculator endpoint (see `src/app/api/calculator/route.ts`) |

- Request validation lives in `src/lib/matching.ts:validateApplication()` — keep error strings user-facing and stable (they're surfaced inline).
- Response codes: `400` validation/JSON, `429` rate-limit, `500` persistence failure. No `401/403` on public funnel.

### Database — Schema Notes

- `lenders.slug` unique (80), `lenders_green_idx` on `greenMortgage`.
- `applications` — `zipCode` is 5-char varchar (digits only after `replace(/\D/g)`), `status` defaults to `"new"` (API sets `"matched"`), indices on `email`, `createdAt`, `zipCode`.
- `application_matches` — FK cascades on both sides, `numeric(5,3)` for rate, `integer` for payment/score, index on `applicationId`.
- `manufacturers`/`states`/`articles`/`glossaryTerms`/`loanProducts` — projection tables with `slug` unique indices; `articles.slug` up to 160 (long slugs from content).
- Extensions: `pgcrypto` (UUID generation) + `pg_trgm` (future fuzzy search) — both in `infrastructure/postgres/init/*.sql`.

### Content Catalog

- **Types:** `Manufacturer`, `StateGuide`, `Article` (`relatedSlugs`, `keywords`, `publishedAt/updatedAt`, `authorName/Role/Slug`), `GlossaryTerm` — all in `src/lib/catalog.ts`.
- **Rendering:** `src/lib/markdown.tsx` renders `Article.content` markdown; `src/lib/guides.ts` provides guide-specific helpers; `src/components/guide-screen.tsx` is the shared renderer.
- **Authors:** `authors/[authorSlug]/page.tsx` — author pages derived from `articles` corpus.

### Routing & Redirects

- Canonical funnel: `/get-started`. Legacy alias `/get-started-v2` → `/get-started` (temporary redirect) in `next.config.ts`.
- Legacy loan paths `/loans/{fha,va,usda,construction}` → `/modular-home-financing/loan-options/*` (permanent).
- `/manufacturers` + `/manufacturers/:slug` → `/modular-home-financing/manufacturers*` (permanent).
- `/states/:state` → `/modular-home-financing/states/:state` (permanent).
- `/playbook` → `/learn` (temporary).
- Source-parity aliases (permanent): `/compare/fha-vs-conventional` → `/compare/fha-vs-conventional-prefab`, `/compare/prefab-vs-site-built` → `/compare/prefab-vs-site-built-costs` — modfii.com's footer links the short slugs.
- Add new aliases only in `next.config.ts:redirects()` — keep them tested via `npm run build` (Next validates redirects at build); the parity aliases are pinned by `e2e/assets.spec.ts`.

### Environment Variables

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | Postgres 17 connection | `postgresql://home_financing_user:home_financing_secret@localhost:5434/home_financing_dev` |
| `BETTER_AUTH_SECRET` | Yes | Auth signing secret (`openssl rand -base64 32`) | `…` (do not commit) |
| `BETTER_AUTH_URL` | Yes | Canonical public origin — must be real origin in prod or auth breaks (`Invalid origin`) | `http://localhost:3000` (dev) / `https://modfii.jesspete.shop` (prod) |
| `BETTER_AUTH_TRUSTED_ORIGINS` | No | Extra trusted origins (comma-separated) | `https://admin.example` |
| `NEXT_PUBLIC_SITE_URL` | Yes | `metadataBase` + OG + sitemap host — set to the canonical public origin (current deployment: `https://modfii.jesspete.shop/`) | `http://localhost:3000` (dev) / `https://modfii.jesspete.shop` (prod) |
| `STRIPE_SECRET_KEY` | No (feature) | Stripe test/live secret | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | No (feature) | Stripe webhook signing | `whsec_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No (feature) | Stripe publishable | `pk_test_…` |
| `RESEND_API_KEY` | No | Transactional email; unset → log transport | `re_…` |
| `EMAIL_FROM` | No | From header | `Home Financing <orders@…>` |
| `CRON_SECRET` | Yes | Jobs runner (`openssl rand -hex 16`) | `…` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | OAuth | — |
| `AUTH_APPLE_ID` / `AUTH_APPLE_SECRET` | No | OAuth | — |
| `FEATURE_*` | No | Feature flags (`on/off`, `true/false`, `1/0`); unknown `FEATURE_*` fails fast | `FEATURE_TRADE=off` etc. |
| `DISABLE_IMAGE_OPTIMIZER` | No | Set `1` in constrained sandboxes where `sharp` deadlocks; no `turbo.json` exists in this repo — wire it into CI env instead if Turborepo is ever added | `1` |

> Real `.env` is gitignored. Never commit secrets. `docs/bak.env`/`**/bak.env`/`*.env.bak`/`docs/env.tgz` are also ignored after audit incidents — do not re-introduce.

### Design System — ModFii Editorial (mirrors modfii.com)

- **Tokens:** `src/app/globals.css:@theme` — `background` (cream 40 33% 99), `foreground`/`forest`/`moss` greens (155–150 hue), `primary`/`primary-600` forest, `accent` amber 38 92% 50, `border`/`input`/`ring` muted greens, radii `sm→2xl`, shadow `lift`, ease `brand`. Extend only inside `@theme`.
- **Typography:** `Outfit` (display/headings, `--font-outfit`) + `DM Sans` (body, `--font-dm-sans`) via `next/font/google` with `variable` + `display: swap`. Apply via `font-sans` / `font-display`.
- **Header:** fixed, inner bar `h-16 md:h-20` (64px mobile / 80px desktop, 81px rendered with the border); **always light** — `bg-background/80` + `backdrop-blur-lg` (16px) + `border-border/50` in every state (homepage hero included) — aligned to the live source bar in pass 5 + pass 7 (2026-09-13: source probes `rgba(253,253,252,0.8)` + blur(16px) + `h-16 md:h-20`; desktop nav becomes visible at `md` (768px) with `gap-8`; containers use a flat `px-4` inset — no `md:px-8`). CTA is a forest "Get Started" pill (never amber). Desktop More dropdown = exactly two items (ADU Financing, Tiny Home Financing); the mobile drawer keeps NAV + MORE.
- **PageHero (`src/components/page-shell.tsx`):** centered interior hero — photo background (one of the five `/images/*.jpg`) under a forest overlay, star eyebrow pill, optional amber `highlight` title line, CTA pair, glass stat chips; `Breadcrumbs` centered inside. All `GuideScreen` pages + learn/glossary/manufacturers flow through it. Pass-4 props: `updated` (Last-Updated line), `eyebrowIcon`, `callout` (glass paragraphs), `crumbsOutside` (hub places breadcrumbs on the page background above the photo panel, chevron separators), and hero crumbs drop the `Home` entry (source pattern).
- **Homepage (`src/app/page.tsx`)** mirrors modfii.com section-for-section (pass-5 aligned): photo hero on a 50/50 `lg:grid-cols-2` grid with a `max-w-xl` text column (source paddings `pt-24 pb-16 md:pt-28 md:pb-20`, no container py; eyebrow glass pill `bg-white/15 border-white/30`; hero title is an **H2** with amber `Financing Nightmares` span; hero height within ~3% of source) + glass stats card with the 🏆 amber badge, manufacturer wordmark strip (`py-8 bg-muted/30 border-y border-border/50` — pass-5), "Modular & Prefab Home Loans" intro with the RESTORED `Your Prefab Financing Partner` `bg-primary/10` pill (pass-4 removal was a wrong pin — source DOES render it) over the document **H1** (48px) + 4 H2 card titles (20px/600), problem/solution (red vs green cards, 16px titles) + "See Your Options" CTA, 3-step icons + ghost numerals (20px titles), 5-star testimonials with portrait avatars on `bg-background rounded-2xl(16px)` cards + savings ledger, "Our Standards" trio (30px H2, 16px cards), animated FAQ accordions with **H3** questions (16px/600 with `text-sm` answers — pass-7 re-probe; the pass-5 400-weight pin was stale), dotted-pattern closing CTA with `text-lg` "Get Pre-Approved Free" + the trust line. Heading hierarchy matches the source: hero H2 → intro H1. Pass-7 tightened the intro to the source's single `max-w-5xl` column with `rounded-xl p-5 md:p-6` border-border/50 shadow-sm cards + 40px gradient icon chips + `text-sm` bodies, source card chrome on problem/solution (p-5, /20 borders, `bg-primary/5` wash), steps hover states + `text-primary/10` numerals + 56px chips + gradient connectors, testimonials `bg-gradient-to-b from-card to-background` band, standards `bg-muted/30 border-y` band, and `CircleCheck` hero checks at `gap-5`.
- **Motion:** `Reveal` (`src/components/reveal.tsx`) lazily reveals the home intro (opacity 0 + translateY, cards also scale 0.95, 300ms, staggered) matching modfii.com; `<details>` accordions animate via `::details-content` in `globals.css` (progressive enhancement, uses `--ease-brand`); `prefers-reduced-motion` forces `[data-reveal]` visible.
- **Logo:** the live source header AND footer render a CSS **rotated-square gradient badge** — `relative w-8 h-8` → `bg-gradient-to-br from-primary to-primary-600 rotate-3 rounded-lg` square → inner `inset-0.5 bg-background rounded-lg` square → `w-4 h-4` gradient core — beside the two-tone wordmark `Mod` (foreground) + `Fii` (primary). Pass-5 (2026-09-12) flipped the pass-3 pin: the circle-ring `modfii-logo-icon.svg` is the **favicon only** on both sites. Don't revert to the SVG-as-logo or the single-tone wordmark.
- **Layout rhythm:** `Container` max `1400px`, flat `px-4` (pass-7: the source uses Tailwind `container px-4`), header `h-16 md:h-20` fixed + `backdrop-blur-lg` + `border-b border-border/50`. Radius tokens match the source scale (pass-7 CSS probe of the source stylesheet: shadcn `--radius: .75rem` — buttons `rounded-md`=10px, cards `rounded-xl`=12px, `rounded-2xl`=16px). Button base is `font-medium` with `h-11 px-8` at lg sizes (`lgSm` text-sm / `lg` text-base / `xl` text-lg — all 44px tall like the source); `sm` stays `h-9 px-3`.
- **Iconography:** `lucide-react` only (v1.44 has no brand icons — wrap inline SVGs in local components, see `LinkedInIcon`/`TwitterIcon`/`FacebookIcon`/`YouTubeIcon` in `site-footer.tsx`). Footer mirrors modfii.com (pass-7): `grid-cols-2 md:grid-cols-8` with a `col-span-2` brand column, **H4** column headings, filled `w-10 h-10 bg-muted` social pills that invert on hover, the Legal column folded into the grid, a 4-link copyright row, and the underlined "NMLS Consumer Access" link in the disclaimer line.
- **Calculator page:** the lower sections (How to Use / Explore / FAQ / Related) sit on a warm `bg-accent/15` band mirroring the source's peach wash; the hero carries the source's "Free Calculator" pill, chevron breadcrumb with the middle `Modular Home Financing` crumb, `CircleCheck` trust chips, icon-chip section headers, and a blue Property-Tax bar segment via `--color-chart-tax` (pass 4). The clone intentionally keeps charging `PMI_ANNUAL_RATE=0.0065` at <20% down — the live source's calculator omits PMI (its default-quote total is lower); the PMI math is a documented load-bearing product decision and must not be dropped for parity.
- **Guide heroes (`guides.ts` + `PageHero`):** hub (`modular-home-financing`) renders the source's `Last Updated: January 2026` line, "Here's the truth" 3-paragraph glass callout, dual CTAs (light + outline), and 4 stat chips, with breadcrumbs above the photo panel (`crumbsOutside`) like the source; loan-option pages (FHA/VA/USDA/construction) carry source copy, amber-first CTA + white-outline second CTA, contextual eyebrow icons (`Home`/`User`/`MapPin`/`FileText`), author/reviewer strips, and no stat chips (FHA) — verified against live modfii.com 2026-09-13.
- **Get-started:** below the hero sits the source's "Get Financing in 3 Easy Steps" band (`bg-muted/50`, border-2 shadow-lg cards, w-8 floating numerals, gradient icon chips); the hero eyebrow is a pulse-dot `text-xs font-semibold` pill; pass-7 added the source's mobile-only (`lg:hidden`) "Why Choose ModFii?" + "Common Questions" light band, H3 trust chips in the hero, and de-H1'd wizard step titles (labels — one document H1 total).
- **Anti-generic guard:** no purple gradients, no Inter/Roboto fallback without hierarchy, no undifferentiated card grids — editorial intent on every section.

---

## Success Metrics

You are successful when:

- `npm run lint && npm run typecheck && npm run build` pass on every push.
- New content is added via `src/data/*.json` + `src/lib/lenders.ts` and survives a `docker compose down -v && docker compose up -d && curl /api/health` round-trip.
- No `any`, no `ts-ignore`, no second `Pool`, no `tailwind.config.*`, no raw `<img>` without justification, no client-side `fetch` where a Server Component would do.
- Every new route has `loading`/`error` states or an explicit ADR explaining why not.
- Redirects for renamed slugs are added in `next.config.ts` and verified at build.
- Lighthouse/CWV + a11y (keyboard, focus-visible, `aria-label` on icon buttons) do not regress.

---

## System Integration

This project is intentionally static-site-hostable with an optional Postgres backing:

- **Deploy:** `npm run build` → `.next` (standalone not enabled; add `output: "standalone"` in `next.config.ts` if containerizing). Static export not enabled — SSR via Node required for API routes.
- **DB becomes optional for content pages** — they can render from `catalog` JSON without DB; API routes and `ensureSeeded()` require DB. Document any new hard DB dependency.
- **No monorepo, no Turborepo** — single app. Don't add workspace tooling without ADR.
- **Skills:** `skills/` is operator-managed and excluded from checks/tests/compilation — don't import from it into `src/`.

---

## Anti-Patterns to Avoid

- **Second Pool** — `new Pool()` outside `src/db/index.ts`.
- **Direct DB edits for content** — edit `src/data/*.json`, not Postgres rows.
- **Tailwind v3 config** — `tailwind.config.{js,ts}` must not be created; use `@theme`.
- **Client Component overuse** — default to Server Components; `"use client"` only for interactivity.
- **Importing Server → Client** — boundary violation that breaks the build.
- **`<img>` for brand** — use `next/image` (even with `unoptimized: true`, you get `priority`, sizing, and a11y).
- **Inline `style` props / arbitrary values** — extend `@theme` instead.
- **`as any` escapes** — use `unknown` + narrowing.
- **N+1 or missing eager loads** — batch `whereIn` or indexed `eq` lookups (see `applications` loop that fetches lender by `slug` — acceptable at 4 matches; don't scale pattern without batching).
- **In-memory rate-limit in multi-instance deploy** — will silently under-limit; flag and migrate to distributed store.
- **Committing secrets** — `.env`, `bak.env`, `env.tgz`, `ssh-key.txt` are all ignored for a reason. Never `git add -f` them.

---

## Continuous Improvement

- **Unit tests:** vitest is installed — `src/lib/*.test.ts` co-located, `npm run test` (41 tests: calculator 11 + matching 13 + rate-limit 9 + markdown 8). Keep unit tests on pure domains; DB paths belong to Playwright E2E.
- **When content grows:** consider moving `src/data/*.json` to Content Collections or a headless CMS — but keep the file-backed seed pattern until the migration is ADR'd and redirect-tested.
- **When DB load grows:** add `pgBouncer` or Drizzle `migrate` workflow (`drizzle-kit generate` + `drizzle-kit migrate`) instead of ad-hoc `push`.
- **After each task:** run `npm run lint && npm run typecheck`, reflect on what broke, and update this file if the workflow changed.

---

## CLAUDE.md Validation Checklist

| # | Section | Required | Present |
|---|---------|----------|---------|
| 1 | Core Identity & Purpose | Yes | ✓ |
| 2 | Foundational Principles (Six-Phase) | Yes | ✓ |
| 3 | Implementation Standards | Yes | ✓ |
| 4 | Development Workflow | Yes | ✓ |
| 5 | Testing Strategy | Yes | ✓ |
| 6 | Code Quality Standards | Yes | ✓ |
| 7 | Git & Version Control | Yes | ✓ |
| 8 | Error Handling & Debugging | Yes | ✓ |
| 9 | Communication & Documentation | Yes | ✓ |
| 10 | Project-Specific Standards | Yes | ✓ |
| 11 | Success Metrics | No | ✓ |
| 12 | System Integration | No | ✓ |
| 13 | Anti-Patterns to Avoid | No | ✓ |
| 14 | Continuous Improvement | No | ✓ |
| 15 | Frontmatter | No | ✓ (`IMPORTANT` banner) |

*Framework checks:* Next.js App Router ✓, `next/font` ✓, Tailwind v4 `@theme` ✓, Drizzle + `pg` Pool singleton ✓, `next.config.ts:redirects` ✓, `images.unoptimized` documented ✓, `force-dynamic` API routes ✓, Playwright E2E (prod build, 3002) ✓, Drizzle migrate/seed guarded ✓, Vitest unit suite ✓.
*Commands verified against `package.json:scripts`* (`dev`, `build`, `start`, `lint`, `lint:fix`, `typecheck`, `test`, `test:watch`, `test:coverage`, `e2e`, `e2e:all`, `db:generate/migrate/seed/setup/reset`) + `drizzle.config.ts`/`.json` + `docker-compose.yml:5434`.

---

*Last generated 2026-09-11 via `claude-md:create`; updated 2026-09-11 (remediation pass 2); updated 2026-09-12 (remediation pass 3 — live-source parity: circle brand mark + two-tone wordmark, always-light header (transparent-over-dark removed after a computed-style probe), homepage intro eyebrow + closing trust line, green band + duplicate steps CTA removed, get-started "Get Financing in 3 Easy Steps" band, calculator amber sections, footer copyright/legal-line + 2-item More dropdown; calculator-PMI E2E flake root-caused to pre-hydration value-tracker poisoning and pinned with a fresh-navigation retry; counts now 37 unit + 82 E2E per project = 42 declarations + 14 asset variants; earlier passes: markdown H4/OOM fix + regression suites, untracked `.env` (real secrets in `d572d73` — rotate `BETTER_AUTH_SECRET`/`CRON_SECRET`), eslint ignores `skills/**`+`infrastructure/**`, six missing images, compare alias redirects. Source of truth: package.json, tsconfig, next.config.ts, eslint.config.mjs, drizzle.config.ts/json, docker-compose.yml:5434, src/db, src/lib, src/scripts, e2e, vitest.config.ts, live modfii.com probes (`docs/REMEDIATION_PLAN_pass3.md`). Preserve team-specific conventions when updating.*

*Updated 2026-09-13 (pass 7 — live-source parity audit + remediation): header responsive `h-16 md:h-20` + md nav `gap-8` + flat `px-4` Container; home intro/hero/sections source chrome (see Design System); radius xl 12px; FAQ 600 + text-sm; wizard single-H1; footer H4/8-col; glossary H3 + Related Resources; 11 exact SEO titles; guides hub 20-FAQ + Sources + closers, mortgage/financing outlines, GuideView `faqsHeading`/`relatedHeading`/`sources`/`closing`; about/resources sections; calculator FAQ H3s. Gate: lint 0/0, typecheck, 41/41 unit, build 43/43, 120/121 E2E chromium DB-less. E2E now 121 per project (smoke 8 + seo 16 + funnel 5 + assets 19 + parity 73). Evidence: docs/REMEDIATION_PLAN_pass7.md. Earlier passes 5-6 as previously documented; pass-4 note:*
 error boundary `retry` doc retained; source-exact home hero (daylight photo + dual-overlay recipe + content height + text-6xl cap), intro eyebrow removed (source renders none — pass-3 pin flipped), hub Last-Updated + truth callout + dual CTA + 4th chip + crumbsOutside, FHA/VA/USDA/construction source heroes + author strips + contextual eyebrow icons + amber first CTA, learn read-duplication fix, calculator Free-Calculator pill + middle crumb + `--color-chart-tax` blue tax segment, header blur 12→16px, hero photo + skyline wordmark swapped to source assets; counts now 41 unit + 121 E2E per project (smoke 8 + seo 16 + funnel 5 + assets 19 + parity 73; 103 declarations + data-driven loops); `turbo.json` claims fixed across docs; full gate `lint → typecheck → test → build → e2e` green (120/121 DB-less; funnel-persist needs Postgres). Evidence: `docs/REMEDIATION_PLAN_pass5.md`. Earlier updates: 2026-09-12 pass-5 (security headers, JSON-500, source-exact header/logo/buttons/radius, heading hierarchy, guide depth), 2026-09-13 pass-4, pass-3 (`retry` prop + live-source parity), 2026-09-11 passes 1–2. 2026-09-13 (Super Z re-validation): clean-clone gate re-measured — `lint 0/0`, `typecheck` clean, `41/41` unit, `build` 43/43 (35 static + 8 dynamic routes), `120/121` E2E chromium DB-less; doc typos fixed (37→41 unit, 53→103 declarations, smoke 7→8, funnel 4→5, parity 26→73 runtime, 42+8→35+8 routes, seo 5→16, 68→103 decl). 2026-09-15 (pass 9 — drift alignment D-01→D-07): sitemap STATIC_PATHS 40→39 (152 total = 39+23+50+40), build 42+8/36+7→35+8, PAD 37/82→41/121, vitest badge 3.2→4.1, playwright 122 listed→121 executed (display artifact), host `modfii.jesspete.shop` locked; gates `lint 0/0 typecheck 41/41 build 43/43 e2e 121/121 (120/121 DB-less)` validated in `docs/VALIDATION_REPORT_2026-09-15.md`.*
