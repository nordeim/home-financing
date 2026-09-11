---
IMPORTANT: File is read fresh for every conversation. Be brief and practical.
---

# ModFii — Home Financing (Prefab Mortgage Marketplace)

> **Brand:** ModFii — "The #1 Prefab Home Mortgage Platform" — prefab/modular/ADU/tiny-home financing marketplace matching borrowers to prefab-specialist lenders.
> **Stack:** Next.js 16.2.6 (App Router) + React 19.2 + TypeScript 5.9 strict + Tailwind CSS v4.1 CSS-first `@theme` + Drizzle ORM 0.45 + PostgreSQL 17 + `pg` + `next/font` (DM Sans + Outfit) + lucide-react. Package manager: npm (package-lock.json). No test framework installed.
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
- **Server Components by default** — add `"use client"` only when using `useState`/`useEffect`/event handlers/browser APIs (`src/components/site-header.tsx`, `prequal-form.tsx`, `calculator-app.tsx` are correct examples).
- **Never import a Server Component into a Client Component** — extract shared UI to a leaf component.
- **Data fetching in Server Components** — direct `db` access or `ensureSeeded()` + `catalog` helpers; no client-side `fetch` for own data except API routes.
- **`next/font`** — `DM_Sans` + `Outfit` already configured in `src/app/layout.tsx` with `variable` + `display: swap`. Use `var(--font-*)` tokens, never `<link>` for Google Fonts.
- **`next/image`** — used for brand assets (`/brand/modfii-logo-icon.svg`). Config: `images.unoptimized: true` in `next.config.ts` — intentional (no sharp optimizer in this deploy). Do not re-enable without infra change.
- **Metadata API** — `export const metadata` / `generateMetadata()` in `src/app/layout.tsx` and per-route. `metadataBase` from `NEXT_PUBLIC_SITE_URL`.
- **Route Handlers** — `src/app/api/*/route.ts` with `export const dynamic = "force-dynamic"`. Validate body with `matching.ts` validators (Zod not yet adopted — keep manual validators consistent until migration).
- **Redirects** — canonical redirects live in `next.config.ts:redirects()` (legacy `/loans/*`, `/manufacturers`, `/states/*`, `/get-started-v2`, `/playbook`). Add new redirects there, not in middleware.
- **No `middleware.ts` / `proxy.ts`** in this codebase — proxy concerns are handled at the reverse proxy.
- **Errors/Loading** — every segment that fetches should have `loading.tsx`/`error.tsx` (currently missing in many segments — add incrementally).

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
- **Migrations/Introspection:** Drizzle Kit via `drizzle-kit` (devDep). Config in `drizzle.config.json` — dialect `postgresql`, schema `./src/db/schema.ts`, default URL `postgresql://postgres:postgres@127.0.0.1:5432/app_db` (overridden by env). `pgcrypto` + `pg_trgm` enabled in `infrastructure/postgres/init/*.sql`.
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
- `src/lib/catalog.ts` + `src/lib/guides.ts` + `src/data/*.json` — typed catalog (`Manufacturer`, `StateGuide`, `Article`, `GlossaryTerm`). `src/lib/markdown.tsx` renders article `content` (markdown).

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
| `npm run build` | Production build | `package.json:scripts.build` |
| `npm start` | Start production server (after build) | `package.json:scripts.start` |
| `npm run lint` | ESLint (flat config, `eslint.config.mjs` + `eslint-config-next/core-web-vitals`) | `package.json:scripts.lint` |
| `npm run typecheck` | `tsc --noEmit` type checking | `package.json:scripts.typecheck` |
| `npx drizzle-kit generate` | Generate Drizzle migration from `src/db/schema.ts` | `drizzle-kit` devDep + `drizzle.config.json` |
| `npx drizzle-kit push` | Push schema directly (dev only) | `drizzle-kit` |
| `npx drizzle-kit studio` | Drizzle Studio / DB GUI (if installed) | `drizzle-kit` |
| `docker compose up -d` | Start Postgres 17 | `docker-compose.yml:postgres:17-alpine` |
| `docker compose down` | Stop Postgres | `docker-compose.yml` |
| `docker compose down -v` | Reset Postgres + delete volume `home_financing_data` | `docker-compose.yml` |
| `docker compose logs -f postgres` | Tail DB logs / healthcheck | `docker-compose.yml` |

> No `test`, `format`, `db:seed`, `db:studio` scripts are defined — see Testing Strategy.

### Database & Seeding

```bash
# Drizzle config points at schema ./src/db/schema.ts
cat drizzle.config.json

# Health check seeds automatically
curl http://localhost:3000/api/health
# → { ok: true, db: true } (also triggers ensureSeeded)

# Manual: ensureSeeded() is idempotent — safe to call anywhere server-side
# Never seed from client components.
```

- `docker-compose.yml` DB: `home_financing_dev` / `home_financing_user` / `home_financing_secret` on host port **5434**. Healthcheck `pg_isready -U home_financing_user -d home_financing_dev`.
- `drizzle.config.json` default URL is `postgresql://postgres:postgres@127.0.0.1:5432/app_db` — overridden by `DATABASE_URL` env at runtime; keep `drizzle.config.json` for CLI, `process.env.DATABASE_URL` for app.

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
    guide-screen.tsx      # Guide/article renderer
  data/
    articles.json         # Article corpus (source of truth)
    manufacturers.json    # Manufacturers corpus
    states.json           # State guides corpus
    glossary.json         # Glossary corpus
  db/
    schema.ts             # Drizzle pgTable definitions (8 tables)
    index.ts              # Pool singleton + drizzle(pool)
  lib/
    catalog.ts            # Typed catalog interfaces + re-exports of data/*.json
    guides.ts             # Guide helpers
    lenders.ts            # LENDER_SEEDS + LOAN_PRODUCT_SEEDS
    calculator.ts         # Payment math (amortize, PMI, comparisons)
    matching.ts           # matchLenders scoring + validateApplication
    ensure-seeded.ts      # Idempotent file→DB projection (global promise)
    markdown.tsx          # Markdown renderer for articles
    rate-limit.ts         # In-memory bucket limiter + clientKey()
infrastructure/
  postgres/init/*.sql     # pgcrypto + pg_trgm extensions
public/
  brand/modfii-logo-icon.svg, brand/og-image.jpg, ...
```

---

## Testing Strategy

### Current State (audit 2026-09-11)

- **No test runner installed** — no `vitest`, `jest`, `playwright`, `pytest`, or `phpunit` in `package.json`.
- **No `*.test.*` / `*.spec.*` files** in the repo.
- **No test scripts** in `package.json` (`test`, `test:watch`, `test:coverage` absent).
- Verification today is manual + `npm run lint` + `npm run typecheck` + `npm run build` + `curl /api/health`.

### Target Pyramid (when adding tests)

- **Unit** — `src/lib/calculator.ts`, `src/lib/matching.ts`, `src/lib/rate-limit.ts` in isolation (pure functions, deterministic). Use `vitest` + factory helpers `getMockApplicationInput(overrides)`.
- **Integration** — `POST /api/applications` with a test Postgres (or `pg-mem`/testcontainers), `ensureSeeded()` idempotency, rate-limit 429.
- **E2E** — critical journeys: `/` → `/get-started` → submit → matches; `/calculator` compute; `/modular-home-financing/*` content renders; `sitemap`/`robots` respond. Use Playwright.

### Test Commands (to add)

```bash
# Recommended additions to package.json:scripts
npm test              # vitest run
npm run test:watch    # vitest watch
npm run test:coverage # vitest --coverage
npx playwright test   # E2E (when playwright added)
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
npm run lint        # eslint .  (flat config, core-web-vitals, ignores .next/out/build/next-env.d.ts)
npm run typecheck   # tsc --noEmit
```

- Config: `eslint.config.mjs` — `defineConfig([...nextCoreWebVitals, globalIgnores([".next/**","out/**","build/**","next-env.d.ts"])])`. Keep flat config; do not revert to `.eslintrc`.
- No Prettier installed — formatting is via ESLint + editor. If adding Prettier, wire `eslint-config-prettier` and a `format` script; don't run two formatters that fight.
- Before pushing: `npm run lint && npm run typecheck && npm run build` must pass.

### TypeScript

- `strict: true` enforced. Fix type errors, never `// @ts-ignore` or `as any` (last resort only with comment explaining why).
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
| `/api/calculator` | GET/POST | none | none | Calculator endpoint (see `src/app/api/calculator/route.ts`) |

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
- Add new aliases only in `next.config.ts:redirects()` — keep them tested via `npm run build` (Next validates redirects at build).

### Environment Variables

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `DATABASE_URL` | Yes | Postgres 17 connection | `postgresql://home_financing_user:home_financing_secret@localhost:5434/home_financing_dev` |
| `BETTER_AUTH_SECRET` | Yes | Auth signing secret (`openssl rand -base64 32`) | `…` (do not commit) |
| `BETTER_AUTH_URL` | Yes | Canonical public origin — must be real origin in prod or auth breaks (`Invalid origin`) | `http://localhost:3000` (dev) / `https://home-financing.jesspete.shop` (prod) |
| `BETTER_AUTH_TRUSTED_ORIGINS` | No | Extra trusted origins (comma-separated) | `https://admin.example` |
| `NEXT_PUBLIC_SITE_URL` | Yes | `metadataBase` + OG URLs | `http://localhost:3000` / `https://home-financing.jesspete.shop` |
| `STRIPE_SECRET_KEY` | No (feature) | Stripe test/live secret | `sk_test_…` |
| `STRIPE_WEBHOOK_SECRET` | No (feature) | Stripe webhook signing | `whsec_…` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No (feature) | Stripe publishable | `pk_test_…` |
| `RESEND_API_KEY` | No | Transactional email; unset → log transport | `re_…` |
| `EMAIL_FROM` | No | From header | `Home Financing <orders@…>` |
| `CRON_SECRET` | Yes | Jobs runner (`openssl rand -hex 16`) | `…` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | OAuth | — |
| `AUTH_APPLE_ID` / `AUTH_APPLE_SECRET` | No | OAuth | — |
| `FEATURE_*` | No | Feature flags (`on/off`, `true/false`, `1/0`); unknown `FEATURE_*` fails fast | `FEATURE_TRADE=off` etc. |
| `DISABLE_IMAGE_OPTIMIZER` | No | Set `1` in constrained sandboxes where `sharp` deadlocks; must stay in `turbo.json:globalEnv` if used | `1` |

> Real `.env` is gitignored. Never commit secrets. `docs/bak.env`/`**/bak.env`/`*.env.bak`/`docs/env.tgz` are also ignored after audit incidents — do not re-introduce.

### Design System — ModFii Editorial

- **Tokens:** `src/app/globals.css:@theme` — `background` (cream 40 33% 99), `foreground`/`forest`/`moss` greens (155–150 hue), `primary`/`primary-600` forest, `accent` amber 38 92% 50, `border`/`input`/`ring` muted greens, radii `sm→2xl`, shadow `lift`, ease `brand`. Extend only inside `@theme`.
- **Typography:** `Outfit` (display/headings, `--font-outfit`) + `DM Sans` (body, `--font-dm-sans`) via `next/font/google` with `variable` + `display: swap`. Apply via `font-sans` / `font-display`.
- **Layout rhythm:** `Container` max `1400px`, `px-4 md:px-8`, header `h-16` fixed + `backdrop-blur-md` + `border-b`.
- **Iconography:** `lucide-react` only. No emoji-as-icon.
- **Anti-generic guard:** no purple gradients, no Inter/Roboto fallback without hierarchy, no undifferentiated card grids — editorial intent on every section (see `src/app/page.tsx` PROBLEMS/FIXES/STEPS for the current voice model).

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

- **When you add tests:** install `vitest` + `playwright`, add `test`/`test:watch`/`test:coverage` scripts, and add a `sitemap`/health smoke test before anything fancy.
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

*Framework checks:* Next.js App Router ✓, `next/font` ✓, Tailwind v4 `@theme` ✓, Drizzle + `pg` Pool singleton ✓, `next.config.ts:redirects` ✓, `images.unoptimized` documented ✓, `force-dynamic` API routes ✓.
*Commands verified against `package.json:scripts`* (`dev`, `build`, `start`, `lint`, `typecheck`) + `drizzle.config.json` + `docker-compose.yml`. Missing `test`/`format` intentionally flagged.

---

*Last generated 2026-09-11 via `claude-md:create` (Steps 1→2→4→5) + `framework-templates:get` (Next.js). Source of truth for generation: codebase read (package.json, tsconfig, next.config.ts, eslint.config.mjs, drizzle.config.json, .env.example/.env, docker-compose.yml, src/db, src/lib, src/app, src/components, infrastructure/postgres/init). Preserve team-specific conventions when updating — compare this file to current codebase before overwriting.*
