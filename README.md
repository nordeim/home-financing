# ModFii — Home Financing

![Next.js](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.3-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9_strict-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-38bdf8?logo=tailwindcss)
![Vitest](https://img.shields.io/badge/Vitest-3.2_37_tests-6e9f18?logo=vitest)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F277?logo=drizzle)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql)
![License](https://img.shields.io/badge/license-Private-lightgrey)
![Node](https://img.shields.io/badge/Node-%3E%3D20-339933?logo=node.js)

> **The #1 prefab home mortgage marketplace** — modular, manufactured, ADU & tiny-home financing with specialist-lender matching, editorial guides, and payment calculators. Get pre-approved in 15 minutes; approvals in 7 days.

**ModFii** is a content + transaction hybrid for prefab homebuyers. Borrowers research via SEO-driven guides, estimate payments with a full PITI+PMI calculator, then submit a single pre-qual form (`/get-started`) that scores against a curated lender pool and persists the top-4 matches — all on Next.js App Router with file-backed content projected into PostgreSQL.

---

## Key Features

|  | Feature | Description |
|--|---------|-------------|
| 🏠 | Lender matching funnel | Single `POST /api/applications` validates, scores (`matchLenders`), persists `applications` + `application_matches` |
| 🧮 | PITI + PMI calculator | Amortization, tax, insurance, HOA, PMI at <20% down (`0.65%`), site-built `1.15×` comparison |
| 📚 | Editorial guide system | Markdown articles, manufacturers & state pages from `src/data/*.json` corpus |
| 🗺️ | 50-state + manufacturer coverage | Typed `StateGuide` / `Manufacturer` / `Article` catalog via `src/lib/catalog.ts` |
| 🛡️ | Request hardening | Per-IP rate limit `8/10 min` + Zod-ready validation (ZIP `^\d{5}$`, `EMAIL_RE`) |
| 🎨 | Editorial design system | Tailwind v4 `@theme` (forest/moss/cream/accent), Outfit + DM Sans via `next/font` |
| 🔄 | Idempotent seeding | `ensureSeeded()` global promise — safe to call anywhere server-side |
| 🐳 | One-command Postgres | Docker Compose PG17 on host `5434` with `pgcrypto` + `pg_trgm` |

---

## Architecture

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js (App Router) | 16.3.x | SSR + RSC + Route Handlers + `next/font` + `next/image` |
| UI | React | 19.3.x | Server Components by default; `"use client"` only for header/forms/calculator + the required `src/app/error.tsx` boundary (Next.js 16 `error.md` — `retry` stable since 16.3) |
| Language | TypeScript | 5.9.3 | `strict: true`, `isolatedModules`, alias `@/*→./src/*` |
| Styling | Tailwind CSS | 4.3.x | CSS-first `@theme` in `src/app/globals.css` — no `tailwind.config.*` |
| Icons | lucide-react | 1.44.0 | All product icons |
| ORM | Drizzle ORM | 0.45.2 | `pgTable` + `drizzle-kit` migrations (`drizzle/` 0000+0001) |
| Driver | `pg` + `Pool` | 8.23.x | Singleton via `globalThis.__arenaNextJsPostgresqlPool` |
| Database | PostgreSQL | 17-alpine | 8 tables, `pgcrypto`/`pg_trgm` extensions |
| Fonts | `next/font/google` | — | `Outfit` (display) + `DM Sans` (body), `variable` + `swap` |
| Tooling | ESLint + `tsx` | 9.39.5 / 4.23 | Flat config + `eslint-config-next/core-web-vitals` + `tsx` for scripts |
| Unit | Vitest | 3.2 | 37 tests over `src/lib/{calculator,matching,rate-limit,markdown}` (`npm run test`) |
| E2E | Playwright + `@axe-core` | 1.63 + 4.13 | 81 tests (chromium), `playwright.config.ts` prod `next start` on 3002 |

```mermaid
flowchart TB
  subgraph Content["File Corpus — source of truth"]
    J1[src/data/articles.json]
    J2[src/data/manufacturers.json]
    J3[src/data/states.json]
    J4[src/data/glossary.json]
    L[src/lib/lenders.ts<br/>LENDER_SEEDS]
  end
  CAT[src/lib/catalog.ts<br/>typed re-exports]
  SEED[src/lib/ensure-seeded.ts<br/>global promise + onConflictDoNothing]
  DB[(PostgreSQL 17<br/>Drizzle pgTable — 8 tables)]
  APP[Next.js App Router<br/>RSC + Route Handlers]
  API1[POST /api/applications<br/>validate → score → persist]
  API2[GET /api/health<br/>ping + seed]
  API3[/api/calculator]

  Content --> CAT --> SEED --> DB --> APP
  L --> SEED
  APP --> API1 & API2 & API3
```

```mermaid
sequenceDiagram
  participant U as Borrower
  participant G as /get-started (RSC)
  participant A as POST /api/applications
  participant M as matchLenders()
  participant D as Postgres

  U->>G: Fill pre-qual form
  G->>A: JSON body
  A->>A: rateLimit 8/10min + validateApplication
  A->>D: ensureSeeded() if empty
  A->>M: Score LENDER_SEEDS by credit/specialty/green
  A->>D: insert applications + top-4 application_matches
  A-->>U: { data: matches, estimatedRate, estimatedPayment }
```

**Principles:** file-backed content is authoritative (DB is a projection), `Pool` singleton only, Server Components by default, `force-dynamic` only where DB is touched, token-driven styling via `@theme`.

---

## File Hierarchy

```
📂 src/
  📂 app/                         # App Router — every route is a folder
    📄 layout.tsx                 # Root layout: header/footer + fonts + metadataBase
    📄 globals.css                # Tailwind v4 @theme — single token source
    📄 page.tsx                   # / — hero, problems/fixes/steps
    📄 sitemap.ts / robots.ts     # SEO
    📄 not-found.tsx
    📂 api/
      📂 health/route.ts          # GET readiness (ping + seed)
      📂 applications/route.ts    # POST funnel (validate → match → persist)
      📂 calculator/route.ts      # Calculator endpoint
    📂 get-started/page.tsx       # /get-started — canonical funnel
    📂 calculator/page.tsx        # /calculator
    📂 modular-home-financing/    # Prefab hub (cost/rates/down-payment/loan-options/manufacturers/states/…)
    📂 compare/ / construction-loans/ / adu-financing/ / authors/[authorSlug]/ …
  📂 components/
    📄 ui.tsx                     # cn, Button/ButtonLink/Container/Badge (use these — don't rebuild)
    📄 site-header.tsx            # Fixed header, NAV+MORE, mobile drawer (client)
    📄 site-footer.tsx / page-shell.tsx / guide-screen.tsx
    📄 prequal-form.tsx / calculator-app.tsx  # Client islands
    📄 learn-explorer.tsx / reveal.tsx        # Client islands (learn hub + scroll reveal)
  📂 data/
    📄 articles.json / manufacturers.json / states.json / glossary.json  # Source corpora
  📂 db/
    📄 schema.ts                  # 8 pgTables (manufacturers.founded varchar 32)
    📄 index.ts                   # Pool singleton + drizzle(pool)
  📂 lib/
    📄 catalog.ts / guides.ts     # Typed Manufacturer/StateGuide/Article/GlossaryTerm
    📄 lenders.ts                 # Canonical seeds (8 lenders / 5 products)
    📄 ensure-seeded.ts           # Idempotent file→DB projection (global promise)
    📄 calculator.ts              # Amortize + PMI + comparison
    📄 matching.ts                # Scoring + validateApplication()
    📄 rate-limit.ts / markdown.tsx
  📂 scripts/                     # DB lifecycle (local-guarded)
    📄 local-db.ts / migrate.ts / seed.ts / reset.ts
📂 drizzle/                       # Migrations (0000 8 tables + 0001 founded 8→32, meta/_journal.json)
📂 e2e/                           # Playwright: smoke / seo / funnel / assets / parity specs (81 tests)
📄 playwright.config.ts           # E2E config (prod next start on 3002, reuseExistingServer)
📄 drizzle.config.ts / .json      # TS primary + JSON fallback (keep in sync, url 5434)
📂 infrastructure/postgres/init/  # pgcrypto + pg_trgm extensions
📂 public/brand/                  # modfii-logo-icon.svg, og-image.jpg, wordmarks/*.png (5 manufacturer logos)
📂 public/images/avatars/         # 3 testimonial portraits
📄 next.config.ts                 # images.unoptimized + 11 redirects
📄 docker-compose.yml             # PG17 on host 5434 (home_financing_*)
📄 .env.example                   # Template (home_financing_* on :5434 — matches docker-compose.yml)
```

---

## Quick Start

**Prereqs:** Node ≥20, npm (repo uses `package-lock.json`, not pnpm), Docker (or an existing PostgreSQL 17).

```bash
# 1 — Clone & install
git clone <repo-url> home-financing
cd home-financing
npm install

# 2 — Env (copy then fill required values)
cp .env.example .env
# Fill at minimum: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_SITE_URL, CRON_SECRET
# Generate secrets:
#   openssl rand -base64 32   # BETTER_AUTH_SECRET
#   openssl rand -hex 16      # CRON_SECRET

# 3 — Database (Docker path — simplest)
docker compose up -d
docker compose logs -f postgres   # expect: "pgcrypto extension: t" / "pg_trgm extension: t"

# 3b — Init DB (migrate + seed) — one-shot, idempotent, local-guarded
npm run db:setup
# → [db] migrations applied (drizzle/0000 + 0001) + [db] seed complete (8/40/50/23/59/5)
# Granular: npm run db:generate / db:migrate / db:seed / db:reset

# 4 — Run
npm run dev
# → http://localhost:3000
# Or prod: npm run build && npm start  # http://localhost:3000
```

**Alternative — existing Postgres instead of Docker:**
```bash
# Point DATABASE_URL at your PG17 (no code change — runtime env wins):
# DATABASE_URL=postgresql://user:pass@localhost:5432/home_financing_dev
npm run dev
```

**Verify Setup:**

```bash
# Health + auto-seed (idempotent)
curl -s http://localhost:3000/api/health | jq
# Expected: { "ok": true, "status": "ok", "db": true }

# Lint / typecheck / unit / build / E2E (pre-push gate — must all pass)
npm run lint        # flat ESLint (0 errors / 0 warnings)
npm run lint:fix    # auto-fix
npm run typecheck   # tsc --noEmit (skills excluded via tsconfig)
npm run test        # vitest unit suite (37 tests: calculator 11 + matching 13 + rate-limit 7 + markdown 6)
npm run build       # validates next.config.ts:redirects + RSC boundaries + skills excluded
npm run e2e         # Playwright chromium (81 tests per project — prod next start on 3002) — needs build; funnel happy-path also needs db:setup
```
```bash
# Quick E2E without manual build (Playwright starts prod server itself)
npm run db:setup
npm run e2e

# Exercise the funnel
curl -s -X POST http://localhost:3000/api/applications \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Jane Doe","email":"jane@example.com","phone":"(555) 123-4567","zipCode":"90210","propertyIntent":"purchase","homeType":"modular","landStatus":"own_land","manufacturerKnown":false,"creditRange":"good","incomeRange":"100k_150k","budget":"250k_400k","timeline":"3_6_months"}' | jq '.data | length'
# Expected: 4 (top-4 matches)
```

---

## Environment Variables

Canonical list — derived from `.env.example` + `docker-compose.yml` + `src/db/index.ts` + `src/app/layout.tsx:metadataBase`:

| Variable | Required | Purpose | Example |
|----------|----------|---------|---------|
| `DATABASE_URL` | **Yes** | Postgres connection — app **throws** if missing | `postgresql://home_financing_user:home_financing_secret@localhost:5434/home_financing_dev` |
| `BETTER_AUTH_SECRET` | **Yes** | Auth signing (`openssl rand -base64 32`) | `…` |
| `BETTER_AUTH_URL` | **Yes** | Canonical public origin — must be real origin in prod or auth fails `Invalid origin` | `http://localhost:3000` (dev) / `https://modfii.jesspete.shop` (prod) |
| `BETTER_AUTH_TRUSTED_ORIGINS` | No | Extra trusted origins (comma-separated) | `https://admin.example` |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | `metadataBase` + OG + sitemap host | `http://localhost:3000` / `https://modfii.jesspete.shop` |
| `CRON_SECRET` | **Yes** | Jobs runner (`openssl rand -hex 16`) | `…` |
| `STRIPE_SECRET_KEY` | No | Stripe secret (test `sk_test_…`) | `sk_test_set-me` |
| `STRIPE_WEBHOOK_SECRET` | No | Webhook signing | `whsec_set-me` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable | `pk_test_set-me` |
| `RESEND_API_KEY` | No | Email — unset → log transport | `re_…` |
| `EMAIL_FROM` | No | From header | `Home Financing <orders@example.com>` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | OAuth | — |
| `AUTH_APPLE_ID` / `AUTH_APPLE_SECRET` | No | OAuth | — |
| `FEATURE_*` | No | Flags `on/off` (also `true/false`, `1/0`); unknown `FEATURE_*` fails fast | `FEATURE_TRADE=off` |
| `DISABLE_IMAGE_OPTIMIZER` | No | `1` in constrained sandboxes where `sharp` deadlocks | `1` |

> `.env` is gitignored. Never commit secrets. `docs/bak.env`/`**/bak.env`/`*.env.bak`/`docs/env.tgz`/`ssh-key.txt` are also ignored after 2026-09 audits. `.env.example` now uses `home_financing_*` on `:5434` (matches `docker-compose.yml`); runtime `DATABASE_URL` wins.

---

## API Reference

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| `GET` | `/api/health` | none | none | DB ping `select 1` + `ensureSeeded()` → `{ ok, status, db }` (500 on DB failure) |
| `POST` | `/api/applications` | none | `8 / 10 min` per IP (`x-forwarded-for` → `x-real-ip` → `local`) | Body: `ApplicationInput` → `400` validate/JSON, `429` rate-limit, `500` on no-row → inserts `applications` + up to 4 `application_matches` → returns matches with `estimatedRate`/`estimatedPayment`/`matchScore` |
| `POST` | `/api/calculator` | none | `60 / min` per IP | Payment calculator (see `src/app/api/calculator/route.ts`) |

**`ApplicationInput` shape** (`src/lib/matching.ts`):
```ts
{ fullName, email, phone, zipCode: "12345", propertyIntent, homeType, landStatus,
  manufacturerKnown: boolean|null, manufacturerSlug?, creditRange, incomeRange, budget, timeline }
```

---

## Design System

Tokens live **only** in `src/app/globals.css:@theme` — never add `tailwind.config.*`.

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `hsl(40 33% 99%)` | Page background (warm cream) |
| `--color-foreground` / `--color-forest` / `--color-moss` | `hsl(155 30% 12%)` / `155 42% 16%` / `150 22% 34%` | Text / forest / muted green |
| `--color-primary` / `--color-primary-600` | `hsl(155 45% 28%)` / `155 50% 22%` | Primary actions + hover |
| `--color-accent` | `hsl(38 92% 50%)` | CTAs, highlights |
| `--color-card` / `--color-secondary` / `--color-muted` | `40 25% 97%` / `150 20% 92%` / `150 15% 93%` | Surfaces |
| `--color-border` / `--color-ring` | `150 15% 88%` / `155 45% 28%` | Borders / focus ring |
| `--radius-sm → 2xl` | `0.5rem → 1.5rem` | Radii scale |
| `--shadow-lift` | `0 18px 40px -24px hsl(155 30% 12% / 0.35)` | Elevated cards |
| `--ease-brand` | `cubic-bezier(0.22,1,0.36,1)` | Brand easing |

**Typography:** `Outfit` (display/headings, `var(--font-outfit)`) + `DM Sans` (body, `var(--font-dm-sans)`) via `next/font/google` with `variable` + `display:swap`. Always use `font-sans` / `font-display` utilities.

**Layout rhythm:** `Container` max `1400px` `px-4 md:px-8`, header `h-16` fixed + `backdrop-blur-xl` + `border-b` (source bar drift — modfii.com renders `h-20`/81px + `backdrop-blur-lg`/16px + `bg-background/80`; alignment queued), `cn()` helper in `src/components/ui.tsx` for variant merging (`primary | secondary | accent | outline | ghost | onPrimary`).

---

## Testing & Verification

**Unit:** Vitest 3.2 (`vitest.config.ts`, `@` alias), co-located `src/lib/{calculator,matching,rate-limit,markdown}.test.ts` — **37 tests** over the pure domains (amortization/PMI, scoring/validation, in-memory limiter, markdown rendering incl. the 2026-09-11 H4/OOM regression). `npm run test` / `test:watch` / `test:coverage`.

**E2E:** Playwright 1.63 + `@axe-core/playwright` 4.13, `playwright.config.ts` (prod `next start` on 3002, `reuseExistingServer:true`), `e2e/` **81 tests** (chromium) — `smoke` (home/nav/footer, get-started, calculator, health, 404, axe critical) + `seo` (sitemap absolute locs + host-rewrite, robots, title/OG) + `funnel` (POST `/api/applications` 400/200 with `x-forwarded-for` isolation, burst 429) + `assets` (fourteen image assets 200, no broken `<img>` on the image-led pages, `/compare/*` parity aliases resolve) + `parity` (markdown-OOM regression on the two H4 articles, wordmark logos + testimonial avatars on home, learn-hub search/filter/featured/tools, calculator breakdown bar + PMI alert, footer socials + Legal column, get-started step chip/ZIP helper/privacy note, the pass-3 live-source pins (pass-5-corrected): rotated-square brand badge + two-tone wordmark, always-light header on desktop and mobile, intro eyebrow RESTORED (source renders it), closing trust line, no green band, single steps CTA, 2-item More dropdown, footer copyright + legal-line NMLS link, get-started 3-step band, calculator amber band, and the pass-4 pins: source hero overlay recipe + bottom fade + no hero-grid, hub Last-Updated line + truth callout + dual CTA + 4 chips, FHA/VA highlight + dual CTA + author strip, learn no-"read read", calculator Free-Calculator pill + middle crumb). With Postgres: **81/81**; without a DB: 80/81 (funnel happy-path persistence is the only DB-dependent test).

**Current verification:**
```bash
npm run lint       # ESLint flat config (0 errors / 0 warnings)
npm run typecheck  # tsc --noEmit (skills excluded)
npm run test       # vitest (37 tests: calculator 11 + matching 13 + rate-limit 7 + markdown 6)
npm run build      # Next.js production build (requires skills excluded)
npm run e2e        # Playwright chromium (prod build)
curl http://localhost:3000/api/health   # readiness probe (also triggers ensureSeeded)
```

**To add:** integration tests for `POST /api/applications` with a test Postgres (pg-mem/testcontainers); refinance-path funnel E2E.

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Error: DATABASE_URL is required` | Missing env | `cp .env.example .env` and set `DATABASE_URL` (see Quick Start) |
| `ECONNREFUSED :5432` on `drizzle-kit` | Old `drizzle.config.json` dummy `5432` (pre-fix) | Now both configs default to `:5434/home_financing_dev` — keep `drizzle.config.ts/.json` in sync; runtime `DATABASE_URL` still wins |
| `skills/` `TS2307 z-ai-web-dev-sdk` | `skills/` is operator-managed, excluded via `tsconfig.json` + `eslint.config.mjs` | No longer blocks `typecheck`/`build`/`lint` — don't install `z-ai-web-dev-sdk`; don't re-include `skills` |
| `ENOTFOUND home-financing.jesspete.shop` in E2E sitemap 30×200 | `sitemap.xml` uses `NEXT_PUBLIC_SITE_URL` (prod host) | `seo.spec.ts` host-rewrites loc origin → local `E2E_BASE_URL` (3002) before `request.get` |
| `429` in funnel API tests | In-memory limiter `8/10 min` per IP persists across tests (reuseExistingServer) | Tests use isolated `x-forwarded-for: test-*` per request; burst test uses dedicated `burst-*` IP |
| `EADDRINUSE 3000` for E2E webServer | `scandihaven` also on 3000 | Playwright now defaults to `3002` (`E2E_PORT`) for home-financing |
| `pm2` not found | Not used | Ignore |
| `react-hooks/set-state-in-effect` lint error | Header menus were reset via a `useEffect` on `pathname` | Fixed 2026-09-11 via React's adjust-state-during-render pattern in `site-header.tsx`; `npm run lint` is now clean |
| `/learn/*` article OOMs the server (origin 502) | `#### ` (H4) lines hit the markdown paragraph branch, which broke without consuming the line — infinite React-element allocation until the heap died | Fixed 2026-09-11: H4 branch + always-consume-a-line loop guard in `src/lib/markdown.tsx`; pinned by `markdown.test.ts` + `e2e/parity.spec.ts` |
| Auth `Invalid origin` | `BETTER_AUTH_URL` still `localhost` in prod | Set `BETTER_AUTH_URL` to canonical public origin + list extras in `BETTER_AUTH_TRUSTED_ORIGINS` |
| `sharp` deadlock in sandbox | Image optimizer stress | Set `DISABLE_IMAGE_OPTIMIZER=1` (no `turbo.json` in this repo — wire into CI env if Turborepo is ever added) |
| `.env` committed / secrets leaked | `.env` was tracked before the gitignore rule existed | Untracked 2026-09-11 (`git rm --cached .env`). **Rotate `BETTER_AUTH_SECRET` + `CRON_SECRET`** — they remain in git history |
| Sitemap/OG point at `home-financing.jesspete.shop` | `NEXT_PUBLIC_SITE_URL` env on the deploy predates the `modfii.jesspete.shop` host | Set `NEXT_PUBLIC_SITE_URL=https://modfii.jesspete.shop` in the deployment env and redeploy |

---

## Deployment

- **Live:** `https://modfii.jesspete.shop/` — set `NEXT_PUBLIC_SITE_URL=https://modfii.jesspete.shop` (and `BETTER_AUTH_URL` to the same origin) in the deployment env, or sitemap.xml / OG tags keep emitting the stale `home-financing.jesspete.shop` host.
- **Build:** `npm run build` → `.next` (no `output: "standalone"` — add in `next.config.ts` if containerizing; no static export — SSR required for API routes).
- **DB is optional for content pages** (can render from `catalog` JSON), required for `/api/*` + `ensureSeeded()`.
- **Redirects validated at build** — renaming a content slug without adding a `next.config.ts:redirects()` entry will produce 404.

---

## Contributing & Conventions

- **Workflow:** Meticulous 6-phase — `ANALYZE → PLAN → VALIDATE → IMPLEMENT → VERIFY → DELIVER` (see `CLAUDE.md`). Don't code before the plan is approved.
- **Library discipline:** Use `src/components/ui.tsx` primitives (`Button`, `Container`, etc.) — wrap/style, don't re-implement.
- **Styling:** Tailwind v4 `@theme` only; mobile-first; no arbitrary values; `cn()` for merging.
- **Components:** Server Components by default; `"use client"` only for interactivity **plus the required file-convention boundary `src/app/error.tsx`** (error boundaries must be Client Components per Next.js 16 `error.md`; `retry` stable since 16.3, `reset` kept as alias via `retry ?? reset`; `global-error.tsx` would also be client if added). Never import server → client.
- **TypeScript:** `strict` — no `any`, `interface` for shapes, `type` for unions; prefer inference.
- **Content:** Edit `src/data/*.json` + `src/lib/lenders.ts`, not DB rows; verify `npm run build` after slug changes.
- **Pre-push gate:** `npm run lint && npm run typecheck && npm run build` must pass. No Husky hook is configured.

---

## Related Docs

- `CLAUDE.md` — full agent spec (~600 lines): 6-phase workflow, schema tables, env table, DB lifecycle (`src/scripts/*` + `drizzle/`), E2E, design-system, anti-patterns.
- `AGENTS.md` — compact cheat-sheet (~100 lines): commands (`db:*` + `e2e`), architecture (guarded lifecycle + prod E2E), never-do list.
- `playwright.config.ts` + `e2e/` — E2E harness (3002, 81 tests per project) · `vitest.config.ts` + `src/lib/*.test.ts` — unit suite (37 tests = 11+13+7+6).
- `docs/` — prompt archives & `build_error.txt` (not a deployment guide).

---

## License

Private — `package.json:private: true`, no `LICENSE` file. Not licensed for public redistribution. Contact the repository owner for terms.

---

*Last verified 2026-09-12 (remediation pass 5 — security headers app-emitted (`next.config.ts:headers()`), funnel JSON-500 contract, header bar + rotated-square badge aligned to source (`bg-background/80 backdrop-blur-lg border-border/50 h-20`), button chrome + radius tokens (md 10px / 2xl 16px / font-medium / px-8), hero `max-w-xl` grid + source paddings, intro eyebrow `Your Prefab Financing Partner` restored (pass-4 removal was a wrong pin), heading hierarchy corrected (hero H2 + intro H1), wordmark strip + testimonial card chrome, FAQ H3 questions, interior H1 sizes + long-form titles + source-pattern SEO titles, guide content depth ×2-3 via `GuideSection.subsections`; counts: 37 unit = 11+13+7+6, 81 E2E per project = smoke 8 + seo 5 + funnel 5 + assets 19 + parity 44 (52 declarations + data-driven loops); earlier pass 4 — source-exact home hero; hub hero Last-Updated line + "Here's the truth" glass callout + dual CTA + 4th stat chip + breadcrumbs above the photo panel; FHA/VA/USDA/construction loan pages: source copy, amber-first CTA + white-outline second CTA, contextual eyebrow icons, author/reviewer strips; learn hub "15 min read read" duplication fixed; calculator Free-Calculator pill + middle crumb + blue tax segment (`--color-chart-tax`); header blur aligned to the source's 16px; hero photo + skyline wordmark swapped to source assets; counts: 37 unit = 11+13+7+6, 61 E2E per project = smoke 8 + seo 5 + funnel 5 + assets 19 + parity 44 (52 declarations + data-driven loops); `turbo.json` doc claims fixed; evidence: `docs/REMEDIATION_PLAN_pass4.md`) against `package.json` (Next 16.3 + React 19.3 + Tailwind 4.3 + Vitest 3.2 + Playwright 1.63), `tsconfig.json` + `eslint.config.mjs` (skills + infrastructure excluded), `next.config.ts` (11 redirects), `drizzle.config.ts/.json` (5434, strict/verbose), `docker-compose.yml` (home_financing_*), `src/db/schema.ts` (8 tables), `src/lib/*` (37 unit tests), `public/images/*` + `public/brand/*` (all referenced assets present), `playwright.config.ts` (3002), `e2e/*` 81 tests per project, `src/app/page.tsx` + `src/components/*` (modfii.com parity design), `.env.example`, `.gitignore`.*
