# ModFii — Home Financing

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9_strict-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38bdf8?logo=tailwindcss)
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
| Framework | Next.js (App Router) | 16.2.6 | SSR + RSC + Route Handlers + `next/font` + `next/image` |
| UI | React | 19.2.6 | Server Components by default; `"use client"` only for header/forms/calculator |
| Language | TypeScript | 5.9.3 | `strict: true`, `isolatedModules`, alias `@/*→./src/*` |
| Styling | Tailwind CSS | 4.1.17 | CSS-first `@theme` in `src/app/globals.css` — no `tailwind.config.*` |
| Icons | lucide-react | 1.44.0 | All product icons |
| ORM | Drizzle ORM | 0.45.2 | `pgTable` + `drizzle-kit` migrations |
| Driver | `pg` + `Pool` | 8.20.0 | Singleton via `globalThis.__arenaNextJsPostgresqlPool` |
| Database | PostgreSQL | 17-alpine | 8 tables, `pgcrypto`/`pg_trgm` extensions |
| Fonts | `next/font/google` | — | `Outfit` (display) + `DM Sans` (body), `variable` + `swap` |
| Tooling | ESLint | 9.39.4 | Flat config + `eslint-config-next/core-web-vitals` |

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
  📂 data/
    📄 articles.json / manufacturers.json / states.json / glossary.json  # Source corpora
  📂 db/
    📄 schema.ts                  # 8 pgTables (lenders→applications→matches→manufacturers/states/articles/…)
    📄 index.ts                   # Pool singleton + drizzle(pool)
  📂 lib/
    📄 catalog.ts / guides.ts     # Typed Manufacturer/StateGuide/Article/GlossaryTerm
    📄 lenders.ts                 # Canonical seeds
    📄 ensure-seeded.ts           # Idempotent file→DB projection
    📄 calculator.ts              # Amortize + PMI + comparison
    📄 matching.ts                # Scoring + validateApplication()
    📄 rate-limit.ts / markdown.tsx
📂 infrastructure/postgres/init/  # pgcrypto + pg_trgm extensions
📂 public/brand/                  # modfii-logo-icon.svg, og-image.jpg
📄 next.config.ts                 # images.unoptimized + 9 redirects
📄 drizzle.config.json            # CLI config (dummy URL; runtime uses DATABASE_URL)
📄 docker-compose.yml             # PG17 on host 5434
📄 .env.example                   # Template (scandihaven_* legacy names — real DB is home_financing_*)
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

# 4 — Run
npm run dev
# → http://localhost:3000
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

# Lint / typecheck / build (pre-push gate — must all pass)
npm run lint        # flat ESLint (core-web-vitals)
npm run typecheck   # tsc --noEmit (ignore skills/ z-ai-web-dev-sdk noise)
npm run build       # validates next.config.ts:redirects + RSC boundaries

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
| `BETTER_AUTH_URL` | **Yes** | Canonical public origin — must be real origin in prod or auth fails `Invalid origin` | `http://localhost:3000` (dev) / `https://home-financing.jesspete.shop` (prod) |
| `BETTER_AUTH_TRUSTED_ORIGINS` | No | Extra trusted origins (comma-separated) | `https://admin.example` |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | `metadataBase` + OG URLs | `http://localhost:3000` / `https://home-financing.jesspete.shop` |
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

> `.env` is gitignored. Never commit secrets. `docs/bak.env`/`**/bak.env`/`*.env.bak`/`docs/env.tgz`/`ssh-key.txt` are also ignored after 2026-09 audits. `.env.example` still contains legacy `scandihaven_*` placeholders — the real Docker DB is `home_financing_*` on `:5434`.

---

## API Reference

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| `GET` | `/api/health` | none | none | DB ping `select 1` + `ensureSeeded()` → `{ ok, status, db }` (500 on DB failure) |
| `POST` | `/api/applications` | none | `8 / 10 min` per IP (`x-forwarded-for` → `x-real-ip` → `local`) | Body: `ApplicationInput` → `400` validate/JSON, `429` rate-limit, `500` on no-row → inserts `applications` + up to 4 `application_matches` → returns matches with `estimatedRate`/`estimatedPayment`/`matchScore` |
| `*` | `/api/calculator` | none | none | Payment calculator (see `src/app/api/calculator/route.ts`) |

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

**Layout rhythm:** `Container` max `1400px` `px-4 md:px-8`, header `h-16` fixed + `backdrop-blur-md` + `border-b`, `cn()` helper in `src/components/ui.tsx` for variant merging (`primary | secondary | accent | outline | ghost | onPrimary`).

---

## Testing & Verification

No test framework is installed — no `vitest`/`jest`/`playwright`, no `*.test.*` files, no `test` script.

**Current verification:**
```bash
npm run lint       # ESLint flat config
npm run typecheck  # tsc --noEmit
npm run build      # Next.js production build
curl http://localhost:3000/api/health   # readiness probe
```

**Recommended when adding tests:** `vitest` for `src/lib/calculator.ts`/`matching.ts`/`rate-limit.ts` (pure, deterministic), integration tests for `POST /api/applications` with a test Postgres, Playwright for Journeys (`/` → `/get-started` → submit → matches; `/calculator`).

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `Error: DATABASE_URL is required` | Missing env | `cp .env.example .env` and set `DATABASE_URL` (see Quick Start) |
| `ECONNREFUSED :5432` on `drizzle-kit` | CLI uses `drizzle.config.json` dummy `5432` | For app, set `DATABASE_URL` to `:5434`; for `drizzle-kit push` override `DATABASE_URL` env or accept dummy in dev |
| `pm2` not found / `skills/` `TS2307 z-ai-web-dev-sdk` | `skills/` is operator-managed, excluded from build | Ignore — `skills/` is `.gitignore`d from checks/tests/compilation; don't install `z-ai-web-dev-sdk` into app |
| `setState-in-effect` lint error on `site-header.tsx` | `useEffect` resetting `open` on `pathname` change | Pre-existing; safe to ignore until header refactor (matches `react-hooks/set-state-in-effect` rule) |
| Auth `Invalid origin` | `BETTER_AUTH_URL` still `localhost` in prod | Set `BETTER_AUTH_URL` to canonical public origin + list extras in `BETTER_AUTH_TRUSTED_ORIGINS` |
| `sharp` deadlock in sandbox | Image optimizer stress | Set `DISABLE_IMAGE_OPTIMIZER=1` (kept in `turbo.json:globalEnv` when used) |

---

## Deployment

- **Build:** `npm run build` → `.next` (no `output: "standalone"` — add in `next.config.ts` if containerizing; no static export — SSR required for API routes).
- **DB is optional for content pages** (can render from `catalog` JSON), required for `/api/*` + `ensureSeeded()`.
- **Redirects validated at build** — renaming a content slug without adding a `next.config.ts:redirects()` entry will produce 404.

---

## Contributing & Conventions

- **Workflow:** Meticulous 6-phase — `ANALYZE → PLAN → VALIDATE → IMPLEMENT → VERIFY → DELIVER` (see `CLAUDE.md`). Don't code before the plan is approved.
- **Library discipline:** Use `src/components/ui.tsx` primitives (`Button`, `Container`, etc.) — wrap/style, don't re-implement.
- **Styling:** Tailwind v4 `@theme` only; mobile-first; no arbitrary values; `cn()` for merging.
- **Components:** Server Components by default; `"use client"` only for interactivity; never import server → client.
- **TypeScript:** `strict` — no `any`, `interface` for shapes, `type` for unions; prefer inference.
- **Content:** Edit `src/data/*.json` + `src/lib/lenders.ts`, not DB rows; verify `npm run build` after slug changes.
- **Pre-push gate:** `npm run lint && npm run typecheck && npm run build` must pass. No Husky hook is configured.

---

## Related Docs

- `CLAUDE.md` — full agent spec (535 lines): 6-phase workflow, schema tables, env table, design-system deep dive, anti-patterns.
- `AGENTS.md` — compact cheat-sheet (72 lines): commands, architecture gotchas, never-do list.
- `docs/` — prompt archives & `build_error.txt` (not a deployment guide).

---

## License

Private — `package.json:private: true`, no `LICENSE` file. Not licensed for public redistribution. Contact the repository owner for terms.

---

*Last verified 2026-09-11 against `package.json` (Next 16.2.6), `tsconfig.json`, `next.config.ts`, `drizzle.config.json`, `docker-compose.yml`, `src/db/schema.ts`, `src/lib/*.ts`, `src/app/layout.tsx`, `src/app/globals.css`, `.env.example`, `.gitignore`.*
