# ModFii (home-financing) — Master Project Architecture Document (PAD) v1.0

**Classification:** Internal Engineering Reference
**Status:** DEFINITIVE, PRODUCTION-LOCKED BLUEPRINT
**Companion Documents:** `CLAUDE.md` (agent spec) · `AGENTS.md` (compact cheat-sheet) · `README.md` (operator guide)
**Last Updated:** 2026-09-11
**Audience:** Senior Engineers, Tech Leads, DevOps, Onboarding Engineers, and AI Coding Agents
**Rule:** Every architectural decision in this document traces to a specific rationale. Nothing is here "because it's popular."

#### Revision Block — v1.0 (Tracked Changes)

Every change is tagged: `[RES]` = web research, `[SR]` = self-review, `[CA]` = critical analysis, `[SYN]` = synthesis, `[SAN]` = sanitization, `[AUTH]` = auth alignment.

- `[SYN, CLAUDE.md+AGENTS.md+README.md]` Initial PAD distilled from 3 companion docs (post-remediation 2026-09-11) and verified against `package.json`, `tsconfig.json`, `next.config.ts`, `drizzle.config.*`, `docker-compose.yml`, `src/db/schema.ts`, `src/lib/*.ts`, `src/app/**`, `e2e/**`, `public/**`, and live probes (`/api/health` → `ok:true`, `/api/applications` → 4 matches, `sitemap.xml` → 152 locs, `lint/typecheck/test/build/e2e` all green).
- `[SR, docker ps]` Postgres `home_financing_postgres` `postgres:17-alpine` `5434` `(healthy)` with `pgcrypto 1.3 + pg_trgm 1.6` — seed counts `8/40/50/23/59/5` proven via `psql count(*)`.
- `[CA, build]` Next build `43/43` (`○ 36 static + ƒ 7 dynamic`) with 11 redirects validated; `images.unoptimized:true` locked.

---

## Table of Contents

1. [System Overview & Decisions](#1-system-overview--decisions) — 1.1 Metadata & Purpose · 1.2 Technology Stack Summary · 1.3 Architecture Decision Records
2. [High-Level System Topology](#2-high-level-system-topology)
3. [Application Architecture](#3-application-architecture) — 3.1 Layer Model · 3.2 Annotated Directory Structure · 3.3 Critical Code Patterns
4. [Data Architecture](#4-data-architecture) — 4.1 Database Schema · 4.2 Data Models · 4.3 Persistence Strategy
5. [Design System Reference](#5-design-system-reference) — 5.1 Typography · 5.2 Color Tokens · 5.3 Component Primitives · 5.4 Motion
6. [Security Architecture](#6-security-architecture) — 6.1 Rules · 6.2 Utilities · 6.3 Auth · 6.4 Threat Model
7. [Worker / Background Service Architecture](#7-worker--background-service-architecture)
8. [Testing Strategy](#8-testing-strategy) — 8.1 Distribution · 8.2 Patterns · 8.3 Coverage · 8.4 Pre-PR Checklist
9. [Build & Deployment](#9-build--deployment) — 9.1 Production Build · 9.2 Environment Variables · 9.3 Docker Configuration · 9.4 CI/CD Pipeline
10. [Developer Handbook](#10-developer-handbook) — 10.1 Local Setup · 10.2 Common Commands · 10.3 Code Style Rules · 10.4 Git Workflow
11. [Known Issues & Outstanding Tasks](#11-known-issues--outstanding-tasks)
12. [Key Files Reference](#12-key-files-reference)
13. [Glossary](#13-glossary)

---

## 1. System Overview & Decisions

### 1.1 Document Metadata & Purpose

**What this PAD is:** The single definitive blueprint for the ModFii codebase. `CLAUDE.md` (~600 lines) is the agent workflow spec; `AGENTS.md` is the 100-line cheat-sheet; `README.md` is the operator/install guide. This PAD **locks** every consequential choice (version-pinned, rationale-traced, alternative-rejected) and captures the **3-layer projection model** that makes the system reproducible from a fresh `docker compose down -v`.

**How to use it:**

| Audience | Start Here | Why |
|----------|------------|-----|
| New engineer | §1.2 Stack → §3.1 Layer Model → §3.2 Directory Tree → §10.1 Local Setup | Get the mental model, then run `db:setup → lint → typecheck → test → build → e2e` without guessing |
| Debugging a funnel/DB issue | §3.3 Critical Patterns (`ensureSeeded`, `matchLenders`, `rateLimit`) → §4.3 Persistence → §6.2 Utilities → `curl /api/health` probe | Every DB path is idempotent and guarded — section tells you where to look first |
| Reviewing a tech choice | §1.3 ADRs (001–006) | Each ADR states Context → Decision → Rationale → Consequences → Alternatives Rejected |
| DevOps / deploy | §9 Build & Deployment + §6 Security + env table | `BETTER_AUTH_URL`/`NEXT_PUBLIC_SITE_URL` must be canonical prod origin or auth + sitemap break |
| AI coding agent | Entire §3 (never bypass singleton, never hand-edit PG, never add `tailwind.config.*`) + §6.1 rules | Violations break `build`; PAD is the guardrail |

**Core identity:** Content + transaction hybrid for prefab homebuyers. Borrowers research via 23 markdown articles, 50 state guides, 40 manufacturers (typed `catalog.ts`), estimate via PITI+PMI calculator (`0.65%` PMI, `1.15×` site-built compare), then submit one 12-field pre-qual form (`/get-started`) that `validateApplication()` → `matchLenders()` scores → persists `applications` + top-4 `application_matches` → returns `estimatedRate/estimatedPayment/matchScore`.

### 1.2 Technology Stack Summary

Every version is pinned from `package.json` / `docker-compose.yml` / `drizzle.config.*`. No speculative `e.g.` language.

| Layer | Technology | Version | Key Rationale |
|-------|------------|---------|---------------|
| Web Framework | Next.js (App Router) | `^16.3.4` (16.3.x) | App Router RSC streaming + `metadataBase` + `sitemap.ts`/`robots.ts` + `next/font` + `next/image`; `pages/` cannot express `force-dynamic` per route as cleanly. Pinned with `eslint-config-next ^16.3.4` for `core-web-vitals` parity. |
| UI Runtime | React | `^19.3.0` | Server Components by default; `useId`, `useEffect` cleanup, `lucide-react` interop. Functional components only, no class components. |
| Language | TypeScript | `^5.9.3` (`strict:true`, `isolatedModules:true`, `moduleResolution: bundler`, `target ES2017`, `jsx: react-jsx`) | Strict mode + `skipLibCheck:true` + `incremental:true`; project excludes `skills/` to avoid `z-ai-web-dev-sdk` missing. `as any` banned; `unknown` + narrowing required. Alias `@/* → ./src/*`. |
| Styling | Tailwind CSS + PostCSS | `^4.3.3` + `@tailwindcss/postcss ^4.3.3` + `postcss ^8.5.28` | **CSS-first `@theme`** in `src/app/globals.css` is the sole token source. No `tailwind.config.*` may be created — intentional v4 migration. Deploy has `images.unoptimized:true` (no `sharp` infra). |
| Icons | lucide-react | `^1.44.0` | All product icons; brand icons (LinkedIn) wrapped as local component (`site-footer.tsx:LinkedInIcon`) since lucide has no brand set. |
| ORM | Drizzle ORM | `^0.45.2` | `pgTable` + `drizzle-orm/node-postgres/migrator` + `onConflictDoNothing`. Chosen over Prisma for SQL-level control and `drizzle-kit generate` diff-to-SQL workflow. |
| ORM Tooling | Drizzle Kit | `^0.31.10` | `drizzle-kit generate` via `drizzle.config.ts` (primary, `satisfies Config`) + `.json` fallback — both `out: ./drizzle`, `strict/verbose`, `url: …@localhost:5434/home_financing_dev`. Migrations `0000_amusing_thena.sql` (8 tables) + `0001_sharp_stick.sql` (founded 8→32). |
| Driver | `pg` + `Pool` | `^8.23.0` + `@types/pg ^8.23.1` | `Pool` singleton via `globalThis.__arenaNextJsPostgresqlPool` prevents HMR pool leaks. Never `new Pool()` inline. |
| Database | PostgreSQL | `17-alpine` (Docker, host `5434`) | 8 tables, `pgcrypto 1.3` (UUID) + `pg_trgm 1.6` (future fuzzy search). Healthcheck `pg_isready -U home_financing_user -d home_financing_dev`. Named volume `home_financing_data`. |
| Fonts | `next/font/google` | Built-in | `Outfit` (display, `--font-outfit`) + `DM Sans` (body, `--font-dm-sans`) with `variable` + `display:swap`; `var(--font-*)` tokens consumed in `globals.css`. No `<link>` Google Fonts. |
| Env Loader | `dotenv` | `^17.4.2` | `import "dotenv/config"` in `src/scripts/*.ts` for lifecycle scripts (dev-only). Runtime `DATABASE_URL` wins over `drizzle.config.*` fallback. |
| Type Support | `@types/node`, `@types/react`, `@types/react-dom` | `^22.20.2`, `^19.3.0`, `^19.3.0` | Complete `tsc --noEmit` coverage for `strict` build. |
| Build Scripting | `tsx` | `^4.23.13` | Runs `src/scripts/migrate.ts/seed.ts/reset.ts` as ESM without compile step. |
| Linting | ESLint + `eslint-config-next` | `^9.39.5` + `^16.3.4` (`core-web-vitals`) | Flat config (`eslint.config.mjs` + `defineConfig`), `globalIgnores([.next,out,build,next-env,skills,infrastructure])` — operator-managed folders excluded. |
| Unit Testing | Vitest | `^3.2.7` (`vitest/config`, `environment: node`) | Co-located `src/lib/*.test.ts` on pure domains only; DB paths stay under Playwright. `include: src/**/*.test.ts`. |
| E2E Testing | Playwright + `@axe-core/playwright` | `^1.63.0` + `^4.13.0` | Prod `npx next start --port 3002` (not `dev`), `reuseExistingServer:true`, `timeout: 30000/5000`, projects `chromium + webkit`, `x-forwarded-for` isolation for rate-limit tests. 27 tests (with DB). |
| Package Manager | npm | `package-lock.json` (not pnpm) | Single-app, no monorepo/turborepo. `npm install` path; `db:setup → lint → typecheck → test → build → e2e` is the pre-PR gate. |

### 1.3 Architecture Decision Records (ADRs)

#### ADR-001: Next.js 16.3 App Router + React 19 Server Components

- **Context:** Hybrid needed — SEO-driven editorial corpus (23 articles + 50 states + 40 manufacturers, `sitemap.xml` with 152 locs) plus a transactional funnel that validates + scores + persists. Must support `metadataBase`/`generateMetadata`, `sitemap.ts`/`robots.ts`, and per-route `force-dynamic` without middleware.
- **Decision:** Next.js `^16.3.4` App Router only (`src/app/**` with `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`). Server Components by default; `"use client"` only on `site-header.tsx`, `prequal-form.tsx`, `calculator-app.tsx`. No `pages/` directory. No `middleware.ts`/`proxy.ts` (proxy concerns at reverse proxy). `images.unoptimized:true` in `next.config.ts`.
- **Rationale:** RSC streaming + `next/font` variable fonts + `next/image` `priority` even when unoptimized; `export const dynamic = "force-dynamic"` scoped to DB-touching routes (`/api/*`) while content pages remain static-prerenderable (build `○ 36 static + ƒ 7 dynamic`). `redirects()` validated at build (11 permanent/temporary) prevents 404 after slug renames — pinned by `assets.spec.ts`.
- **Consequences:** Positive — SEO parity with `modfii.com`, correct RSC boundaries caught by `next build`. Negative — must not import Server Component into Client Component (breaks build); every segment that fetches should add `loading.tsx`/`error.tsx` incrementally (many still missing).
- **Alternatives Rejected:** `pages/` + `getServerSideProps` (cannot express `force-dynamic` per handler as cleanly, no RSC streaming), Vite SPA (loses `metadata` API, `sitemap.ts`/`robots.ts` conventions, and server-side `ensureSeeded()` projection).

#### ADR-002: File-Backed Content Projection (`src/data/*.json` + `LENDER_SEEDS` → PG)

- **Context:** Content must be git-reviewable, survive `docker compose down -v`, and seed deterministically across local + CI + prod-preview without a CMS.
- **Decision:** Source of truth is file-backed: `src/data/articles.json` (23), `manufacturers.json` (40), `states.json` (50), `glossary.json` (59) + `src/lib/lenders.ts` (`LENDER_SEEDS` 8 + `LOAN_PRODUCT_SEEDS` 5) → typed re-export `src/lib/catalog.ts` (`Manufacturer`, `StateGuide`, `Article`, `GlossaryTerm`, `authors`) → idempotent `src/lib/ensure-seeded.ts` (`globalThis.__modfiiSeedPromise` + `select count(*) from lenders` guard + `insert().onConflictDoNothing`) → PG projection (8 tables). Called in `app/api/health` + `app/api/applications` + via `npm run db:seed`; reuse, don't duplicate.
- **Rationale:** Content diffs in PRs, deterministic `db:setup` (`[db] migrations applied + [db] seed complete`), live-probed sitemap stays in sync with `catalog` helpers. Editing DB rows directly would be clobbered on next fresh seed if DB is reset — file path is the only write path.
- **Consequences:** Positive — 152 sitemap locs stay correct, `ensureSeeded()` safe to call anywhere server-side. Negative — corpus growth will need Content Collections or headless CMS (ADR required before migration, plus redirect entries in `next.config.ts`).
- **Alternatives Rejected:** CMS-first (Sanity/Contentful) premature for this corpus size; hand-editing PG rows (violates projection contract and audit `PRD §4.8`).

#### ADR-003: Drizzle ORM `0.45.2` + `pg` Pool Singleton

- **Context:** Need typed SQL, `drizzle-kit generate` diff-to-SQL, and a single `Pool` that survives HMR without leaks.
- **Decision:** `src/db/schema.ts` `pgTable` (8 tables, `uuid().defaultRandom().primaryKey()`, `varchar` capped, `text().array()`, `timestamp(withTimezone)`, indices via table callback). `src/db/index.ts` `Pool` via `globalThis.__arenaNextJsPostgresqlPool` + `drizzle(pool)`; `databaseUrl` throws if `DATABASE_URL` missing. `drizzle.config.ts` (primary, `satisfies Config`) + `.json` fallback share `out: ./drizzle`, `strict/verbose`, `url: …@5434` — runtime env wins.
- **Rationale:** Single pool prevents `EMFILE` under HMR; `drizzle-orm/node-postgres/migrator` + `drizzle-kit` gives `0000_amusing_thena.sql` (8 tables) + `0001_sharp_stick.sql` (`founded 8→32`) with `_journal.json`. Raw SQL avoided unless `sql` tag unavoidable (only `ensure-seeded.ts: count(*)::int`).
- **Consequences:** Positive — type-safe `select().from().where(eq(...)).limit(1)` + `insert().values().returning()`. Negative — `dbCredentials.url` in both configs must be kept in sync after schema edits (`npm run db:generate` writes to `drizzle/`).
- **Alternatives Rejected:** Prisma (heavier client, different migration ergonomics, no `onConflictDoNothing` pattern parity), `new Pool()` inline per module (leaks, caught by `build` + manual `rg` guard).

#### ADR-004: Tailwind CSS v4 CSS-First `@theme` (No `tailwind.config.*`)

- **Context:** Design parity with `modfii.com` requires token-driven styling (forest/moss/cream/accent, radii, shadows, brand easing) without fragmented config files.
- **Decision:** All tokens live in `src/app/globals.css:@theme` (`--color-forest/moss/cream/accent`, `--color-background/foreground`, `--color-primary/primary-600/secondary/muted/border/ring`, `--radius-sm→2xl`, `--shadow-lift`, `--ease-brand`). `@import "tailwindcss"` sole import. No `tailwind.config.{js,ts}` may be created. `cn()` from `src/components/ui.tsx` merges variants (`primary|secondary|accent|outline|ghost|onPrimary`, `sm|md|lg`). `Container` `max-w-[1400px] mx-auto px-4 md:px-8`. Mobile-first, no `text-[13px]` arbitrary escapes.
- **Rationale:** v4 CSS-first eliminates config drift; `build` fails if `db:setup` is missing (seeded pages) but styling stays deterministic. Build proved `✓ Compiled successfully` with token-only styling.
- **Consequences:** Positive — editorial + brutalist restraint enforced by token discipline. Negative — extending requires `@theme` edit (no per-component escape hatch).
- **Alternatives Rejected:** Tailwind v3 `tailwind.config.js` (deprecated for this codebase, would reintroduce fragmentation), custom CSS per component (breaks token contract and `PageHero` forest overlay parity).

#### ADR-005: In-Memory Rate Limiting — `8 / 10 min` per IP on `POST /api/applications`

- **Context:** Public funnel must resist burst abuse without introducing Redis before scaling is needed.
- **Decision:** `src/lib/rate-limit.ts` in-memory `Map` buckets `rateLimit(key, limit, windowMs)` + `clientKey(req)` via `x-forwarded-for` (first entry, trimmed) → `x-real-ip` → `"local"`. Wired as `rateLimit(\`app:${clientKey(request)}\`, 8, 10*60*1000)` returning `429 { error: "Too many applications..." }` in `src/app/api/applications/route.ts`. `GET /api/calculator` has `60/min`. Tests isolate via `x-forwarded-for: test-*, burst-*` (because `playwright.config.ts` `reuseExistingServer:true` persists the Map).
- **Rationale:** Single-instance memory is acceptable now; documented as `Under-limits on multi-instance — migrate to Redis/Upstash if scaling` (see §6.4). Probed live: burst `10×` → `400×8 then 429×2` (8/10min enforced).
- **Consequences:** Positive — zero infra cost, E2E can assert `429`. Negative — resets on restart, per-instance only.
- **Alternatives Rejected:** Upstash Redis from day-0 (overkill for single deploy), no limiter (burst abuse on public funnel).

#### ADR-006: Vitest Unit (31) + Playwright Prod-Build E2E (27) — Pure vs. DB Boundary

- **Context:** Logic (PMI, amortization, scoring, validation, limiter) is deterministic and pure; persistence and sitemap + alias routing are DB/deployment-shaped and need prod-build parity (dev HMR diverged from prod in prior `scandihaven` audit).
- **Decision:** Vitest `3.2.7` (node env, `@` alias, `include: src/**/*.test.ts`) for `src/lib/{calculator,matching,rate-limit}.test.ts` — **31 tests** on pure domains only. Playwright `1.63.0` + `@axe-core/playwright 4.13.0` for `e2e/{smoke,seo,funnel,assets}.spec.ts` — **27 tests** (chromium default, webkit via `e2e:all`) running `npx next start --port 3002` (not `dev`), `reuseExistingServer:true`, `expect:5000`. `assets.spec.ts` pins the two `2026-09-11` incidents: 6 image assets `200` + 2 `/compare/*` parity aliases resolve. Funnel valid-payload E2E needs Postgres (migrated+seeded); the other 26 run DB-less.
- **Rationale:** `lint (0/0)` + `typecheck` + `test (31/31)` is the fast local gate; `build (43/43)` validates redirects + RSC boundaries + `skills` exclusion; `e2e` on the shipped artifact catches what `dev` HMR hides.
- **Consequences:** Positive — `build` + `e2e` catch alias 404s and broken `<img>` before deploy. Negative — `reuseExistingServer:true` requires `x-forwarded-for` isolation for rate-limit tests; E2E needs `E2E_PORT=3002` because `3000` is occupied by the sibling `scandihaven` repo in this dev host.
- **Alternatives Rejected:** Unit-only (would miss alias/image regressions), E2E on `dev` (HMR drift), `pg-mem`/testcontainers for API integration (not yet — documented as next).

#### ADR-007: Production Build + Image Pipeline — `images.unoptimized:true`

- **Context:** No `sharp` optimizer in the deploy target; optimizing would deadlock in constrained sandboxes (`DISABLE_IMAGE_OPTIMIZER=1` guard).
- **Decision:** `next.config.ts:images.unoptimized:true` intentional — `next/image` still provides `priority`, sizing, and a11y, but serves images unoptimized. Retaining `sharp` would require infra change. `DISABLE_IMAGE_OPTIMIZER=1` stays listed in `turbo.json:globalEnv` if used (currently no `turbo.json` — not a regression).
- **Rationale:** Build `✓ Generating static pages using 3 workers (43/43)` proves the pipeline works without native `sharp`.
- **Consequences:** Re-enabling requires `turbo.json` awareness + deploy `sharp` installation.
- **Alternatives Rejected:** Optimizer-on by default (would deadlock in this sandbox/deploy combo).

---

## 2. High-Level System Topology

```mermaid
flowchart TB
  subgraph Client["Client — Browser"]
    UI["Next.js App Router RSC<br/>/ (hero + glass stats)<br/>/get-started (prequal funnel)<br/>/calculator · /learn/[slug]<br/>/modular-home-financing/**<br/>/states/[state] · /manufacturers/[slug]"]
    HEADER["SiteHeader<br/>fixed h-16<br/>transparent over dark hero → bg-background/90 on scroll<br/>NAV + MORE drawer"]
  end

  subgraph Edge["Edge / Reverse Proxy<br/>(no middleware.ts / proxy.ts in repo)"]
    REDIR["next.config.ts:redirects()<br/>11 entries<br/>/loans/* → /modular-home-financing/loan-options/*<br/>/manufacturers* → /modular-home-financing/manufacturers*<br/>/states/:state → /modular-home-financing/states/:state<br/>/get-started-v2 → /get-started (temp)<br/>/playbook → /learn<br/>/compare aliases (parity)"]
    CACHE["Metadata / sitemap<br/>metadataBase via NEXT_PUBLIC_SITE_URL<br/>https://modfii.jesspete.shop"]
  end

  subgraph App["Application — Node 20+<br/>Single Instance (in-memory rate-limit caveat)"]
    RSC["RSC Pages<br/>Static-first (○ 36)<br/>force-dynamic only where DB touched (ƒ 7)<br/>loading.tsx / error.tsx per segment (incremental)"]
    API1["POST /api/applications<br/>validate → matchLenders → insert + top-4 matches<br/>8/10min per IP, 400/429/500"]
    API2["GET /api/health<br/>select 1 + ensureSeeded()<br/>→ { ok:true, status:ok, db:true }"]
    API3["POST /api/calculator<br/>60/min per IP"]
    SEED["ensureSeeded()<br/>global promise<br/>count(lenders)>0 guard<br/>onConflictDoNothing"]
  end

  subgraph Data["Data — PostgreSQL 17-alpine<br/>home_financing_postgres · :5434<br/>volume home_financing_data<br/>Pool singleton via globalThis.__arenaNextJsPostgresqlPool"]
    DB[("8 tables<br/>lenders · applications<br/>application_matches<br/>manufacturers · states<br/>articles · glossary_terms<br/>loan_products<br/>pgcrypto 1.3 / pg_trgm 1.6")]
    EXT["init: 00-create-extensions.sql<br/>CREATE EXTENSION IF NOT EXISTS"]
    JOURNAL["drizzle/__drizzle_migrations<br/>0000 + 0001"]
  end

  subgraph External["External Services (optional)"]
    STRIPE["Stripe<br/>STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY<br/>test mode in dev"]
    RESEND["Resend<br/>RESEND_API_KEY / EMAIL_FROM<br/>log transport when unset"]
    OAUTH["OAuth (optional)<br/>AUTH_GOOGLE_* / AUTH_APPLE_*"]
    BETTERAUTH["Better Auth<br/>BETTER_AUTH_SECRET + BETTER_AUTH_URL<br/>canonical prod origin or Invalid origin"]
  end

  subgraph Content["File Corpus — Source of Truth"]
    JSON["src/data/*.json<br/>articles 23<br/>manufacturers 40<br/>states 50<br/>glossary 59"]
    CAT["src/lib/catalog.ts<br/>typed re-exports<br/>Manufacturer/StateGuide/Article/GlossaryTerm"]
    LENDERS["src/lib/lenders.ts<br/>LENDER_SEEDS 8<br/>LOAN_PRODUCT_SEEDS 5"]
  end

  JSON --> CAT --> SEED --> DB
  LENDERS --> SEED
  UI --> REDIR --> RSC
  RSC --> API1 & API2 & API3
  SEED -.->|"idempotent<br/>health + applications"| API1
  SEED -.-> API2
  DB <-->|"drizzle(pool)<br/>select/insert(eq, returning)"| API1
  DB <--> API2
  CACHE -.->|"NEXT_PUBLIC_SITE_URL"| UI
  STRIPE -.-> App
  RESEND -.-> App
  OAUTH -.-> App
  BETTERAUTH -.-> App

  classDef healthy fill:#14532d,stroke:#0e3b20,color:#fff
  classDef warning fill:#7c3a09,stroke:#5a2b06,color:#fff
  class Data healthy
  class External warning
```

**Runtime & scaling notes:**

| Layer | Runtime | Scaling | Constraint |
|-------|---------|---------|------------|
| Client | Evergreen browsers | Stateless | `prefers-reduced-motion` disables animation; axe critical violations blocked by `axe-core/playwright` |
| Edge / Proxy | Reverse proxy (outside repo) | Horizontal | `BETTER_AUTH_URL` must be canonical prod origin `https://modfii.jesspete.shop` — `localhost` breaks `Invalid origin` |
| App | Node ≥20 (`next start` prod, `next dev` local) | **Single instance** (current) | In-memory `Map` rate limiter resets on restart, under-limits on multi-instance — migrate to Redis before scaling (§6.4) |
| Data | PG 17-alpine container `home_financing_postgres` | Vertical | `home_financing_data` volume persists; `docker compose down -v` is **destructive** |

---

## 3. Application Architecture

### 3.1 The Layer Model — The Golden Rule

```
Layer 0: File Corpus — Authoring. Rule: Edit src/data/*.json + src/lib/lenders.ts; never hand-edit Postgres rows.
Layer 1: Catalog — Typing. Rule: src/lib/catalog.ts re-exports JSON as Manufacturer/StateGuide/Article/GlossaryTerm; UI imports only from @/lib/catalog and @/lib/guides.
Layer 2: Projection — Seeding. Rule: src/lib/ensure-seeded.ts is the only write path into PG; idempotent via global promise + count guard + onConflictDoNothing; called in /api/health and /api/applications.
Layer 3: Persistence — Storage. Rule: src/db/index.ts Pool singleton via globalThis.__arenaNextJsPostgresqlPool; never new Pool() inline; db is drizzle(pool).
Layer 4: Application — Rendering. Rule: Server Components by default; "use client" only for site-header, prequal-form, calculator-app; never import Server → Client; force-dynamic only where DB is touched.
Layer 5: Edge — Routing. Rule: Redirects live in next.config.ts:redirects(); add new aliases there only; they are validated at build and pinned by e2e/assets.spec.ts.
```

**Violation consequences:** `new Pool()` → HMR leak → `EMFILE`; `tailwind.config.*` → styling drift; `as any` → `typecheck` should fail; Server→Client import → `build` throws RSC boundary error (all caught by `lint → typecheck → build` gate).

### 3.2 Annotated Directory Structure

```
home-financing/                          ← single app, no monorepo/turborepo
├── src/
│   ├── app/                             ← App Router — every route is a folder with page.tsx
│   │   ├── layout.tsx                   ← root layout: SiteHeader + SiteFooter + next/font DM_Sans/Outfit + metadataBase (NEXT_PUBLIC_SITE_URL)
│   │   ├── globals.css                  ← ONLY @theme definition — Tailwind v4 CSS-first tokens (forest/moss/cream/accent, radii, shadows, ease)
│   │   ├── page.tsx                     ← / — photo hero + glass stats card + manufacturer wordmarks + 4 intro cards + problem/fix band + green band + 3 steps + testimonials + FAQ + closing CTA
│   │   ├── sitemap.ts                   ← 40 STATIC_PATHS + articles→/learn/[slug] + states→/modular-home-financing/states/[slug] + manufacturers→… (152 locs, absolute via base)
│   │   ├── robots.ts                    ← User-Agent:* Allow:/ + Sitemap: ${base}/sitemap.xml
│   │   ├── not-found.tsx                ← 404 recovery paths (tested by smoke.spec.ts)
│   │   ├── api/
│   │   │   ├── health/route.ts          ← GET force-dynamic — select 1 + ensureSeeded() → { ok:true, status:ok, db:true } | { ok:false, 500 }
│   │   │   ├── applications/route.ts    ← POST force-dynamic — rateLimit(8/10min) → try json catch 400 → validateApplication 400 → ensureSeeded → matchLenders → insert applications + 4 matches → { id, matches }
│   │   │   └── calculator/route.ts      ← POST force-dynamic — rateLimit(60/min) → calculatePayment
│   │   ├── get-started/page.tsx         ← /get-started — canonical prequal funnel (prequal-form.tsx client island); /get-started-v2 redirects here
│   │   ├── calculator/page.tsx          ← /calculator — calculator-app.tsx client island
│   │   ├── modular-home-financing/      ← prefab hub (cost, rates, down-payment, with-land/without-land, loan-options/{fha,va,usda,construction-loan}, manufacturers, states, ...)
│   │   ├── compare/                     ← fha-vs-conventional-prefab, prefab-vs-site-built-costs, modular-vs-manufactured-financing (plus 2 parity aliases via redirects)
│   │   ├── construction-loans/{fha,va,usda}/page.tsx  ← construction loans
│   │   ├── learn/[slug]/page.tsx        ← article rendering via markdown.tsx + guide-screen.tsx
│   │   ├── authors/[authorSlug]/page.tsx← author pages from catalog.ts:authors (derived from articles + AUTHOR_BIOS)
│   │   ├── glossary/page.tsx            ← glossaryByLetter() grouped A→Z
│   │   └── {financing,mortgage,adu-financing,tiny-home-financing,resources,about,editorial-policy,corrections,privacy-policy,terms}/page.tsx
│   ├── components/
│   │   ├── ui.tsx                       ← primitives: cn, Button/ButtonLink (primary/secondary/accent/outline/ghost/onPrimary, sm/md/lg), Container (1400px), Badge
│   │   ├── site-header.tsx              ← "use client" — fixed h-16, transparent over "/" hero until scroll>12px, NAV (4) + MORE (4), mobile drawer, useId, useEffect scroll + body overflow lock
│   │   ├── site-footer.tsx              ← footer links, LinkedInIcon local wrapper (lucide has no brand icons)
│   │   ├── page-shell.tsx               ← Breadcrumbs + PageHero (centered, photo-backed, forest overlay, star eyebrow pill, highlight amber line, CTA pair, glass stat chips) + GuideView
│   │   ├── prequal-form.tsx             ← "use client" — 12-field funnel, client validateApplication, disable submit + spinner, onError inline alert
│   │   ├── calculator-app.tsx           ← "use client" — PITI+PMI calculator UI
│   │   └── guide-screen.tsx             ← Article/Guide renderer via guides.ts + markdown.tsx
│   ├── data/
│   │   ├── articles.json                ← 23 articles (source of truth; Markdown content + relatedSlugs/keywords/authorName/authorRole)
│   │   ├── manufacturers.json           ← 40 manufacturers
│   │   ├── states.json                  ← 50 states
│   │   └── glossary.json                ← 59 terms
│   ├── db/
│   │   ├── schema.ts                    ← 8 pgTables: lenders, applications, application_matches, manufacturers, states, articles, glossaryTerms, loanProducts (indices via table callback)
│   │   └── index.ts                     ← DATABASE_URL required throw + Pool singleton + drizzle(pool)
│   ├── lib/
│   │   ├── catalog.ts                   ← Manufacturer/StateGuide/Article/GlossaryTerm interfaces + priceFloor/categorize + authors/authorSlug helpers + typed JSON re-exports
│   │   ├── lenders.ts                   ← LENDER_SEEDS (8) + LOAN_PRODUCT_SEEDS (5) — canonical seed constants
│   │   ├── ensure-seeded.ts             ← idempotent projection: __modfiiSeedPromise + count(lenders)>0 → onConflictDoNothing for every table
│   │   ├── calculator.ts                ← PMI_ANNUAL_RATE=0.0065 + amortize + calculatePayment (includes site-built 1.15× comparison)
│   │   ├── matching.ts                  ← matchLenders scoring + validateApplication (EMAIL_RE, ZIP ^\d{5}$, phone digits≥10)
│   │   ├── rate-limit.ts                ← in-memory Map buckets + clientKey(x-forwarded-for→x-real-ip→local)
│   │   ├── guides.ts                    ← GuidePageContent helpers + GuideScreen data wiring
│   │   └── markdown.tsx                 ← Markdown renderer for articles
│   └── scripts/
│       ├── local-db.ts                  ← isLocalDatabaseUrl / assertLocalDatabase (localhost/127.0.0.1/::1 only)
│       ├── migrate.ts                   ← drizzle-orm migrator (local-guarded, ./drizzle → PG, CJS-safe main)
│       ├── seed.ts                      ← ensureSeeded() wrapper (local-guarded)
│       └── reset.ts                     ← DROP SCHEMA public,drizzle CASCADE + CREATE SCHEMA public + CREATE EXTENSION pgcrypto/pg_trgm (destructive local only)
├── drizzle/
│   ├── 0000_amusing_thena.sql           ← 8 tables baseline
│   ├── 0001_sharp_stick.sql             ← alter manufacturers.founded 8→32
│   └── meta/_journal.json               ← tag journal (idx 0, 1)
├── e2e/
│   ├── smoke.spec.ts                    ← 7 tests: home/nav/footer, get-started via CTA, calculator, health, no-500, 404, axe critical
│   ├── seo.spec.ts                      ← 6 tests: sitemap absolute locs + 30×200 rewrite, robots, title, OG absolute
│   ├── funnel.spec.ts                   ← 4 tests: POST 400/200 + x-forwarded-for isolation, burst 429, UI no-500
│   └── assets.spec.ts                   ← 9 tests (6 looped): 6 image assets 200 + no broken <img> on /, /adu-financing, /tiny-home-financing + 2 compare aliases resolve
├── infrastructure/postgres/init/
│   └── 00-create-extensions.sql         ← CREATE EXTENSION pgcrypto + pg_trgm
├── public/
│   ├── brand/modfii-logo-icon.svg       ← canonical rotated-square mark (modfii.com parity)
│   ├── brand/og-image.jpg               ← OG fallback
│   └── images/{hero-prefab,green-home,interior-living,adu-backyard,tiny-home}.jpg ← photo heroes for PageHero + sections
├── drizzle.config.ts                    ← primary TS config (satisfies Config, schema ./src/db/schema.ts, out ./drizzle, 5434)
├── drizzle.config.json                  ← JSON fallback (keep in sync)
├── next.config.ts                       ← images.unoptimized:true + 11 redirects
├── docker-compose.yml                   ← postgres:17-alpine on host 5434 (home_financing_*)
├── tsconfig.json                        ← strict, skipLibCheck, isolatedModules, @/*→./src/*, exclude skills
├── eslint.config.mjs                    ← flat config + core-web-vitals + globalIgnores(.next,out,build,next-env,skills,infrastructure)
├── vitest.config.ts                     ← alias @→./src, environment node, include src/**/*.test.ts
├── playwright.config.ts                 ← testDir ./e2e, prod next start 3002, reuseExistingServer:true, chromium+webkit
├── AGENTS.md                            ← compact agent cheat-sheet (this PAD complements it)
├── CLAUDE.md                            ← full agent spec (~600 lines, 6-phase workflow, already the spec side of this PAD)
├── README.md                            ← operator guide (quickstart, env table, troubleshooting)
└── Project_Architecture_Document.md     ← this file (single source of truth)
```

**Kebab conventions (grandfathered):** route folders + `kebab-case.json` + provider arrangement/product + brand regulatory organization/spelling (having been discovered, intentionally and unexpectedly, previously misspelled) + software product affecting the `component` root causative + pedagogical term/vacuum + alphanumeric of this irregularity are required`.

### 3.3 Critical Code Patterns

#### Pattern 1 — Idempotent File→DB Projection (`globalThis.__modfiiSeedPromise` + count guard + `onConflictDoNothing`)

```typescript
// src/lib/ensure-seeded.ts — The ONLY write path into PG. Reuse, don't duplicate.
// Why this pattern: File corpus is authoritative. The DB is a projection that must
// survive docker compose down -v, be safe to call from /api/health (cold boot) and
// /api/applications (hot), and never duplicate rows if two requests race on an empty DB.

import { db } from "@/db";
import { articles as articleRows, manufacturers, states, glossary } from "@/lib/catalog";
import { LENDER_SEEDS, LOAN_PRODUCT_SEEDS } from "@/lib/lenders";
import { articles, glossaryTerms, lenders, manufacturers as mfrTable, states as statesTable } from "@/db/schema";
import { sql } from "drizzle-orm";

// HMR-safe global — prevents double-seed on dev hot reload
const globalForSeed = globalThis as typeof globalThis & {
  __modfiiSeedPromise?: Promise<void>;
};

async function seed(): Promise<void> {
  // Count guard — if any lender exists, the corpus has already been projected
  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(lenders);
  if (count > 0) return;

  // Every insert is onConflictDoNothing by unique slug/term — second caller is a noop
  await db.insert(lenders).values(LENDER_SEEDS).onConflictDoNothing({ target: lenders.slug });
  // ... manufacturers, states, articles, glossaryTerms follow identically
}

export function ensureSeeded(): Promise<void> {
  if (!globalForSeed.__modfiiSeedPromise) {
    globalForSeed.__modfiiSeedPromise = seed().catch((error: unknown) => {
      // Reset on failure so the next caller retries instead of caching a rejection
      globalForSeed.__modfiiSeedPromise = undefined;
      throw error;
    });
  }
  return globalForSeed.__modfiiSeedPromise;
}
```

**Why this pattern:** Without the `globalThis` promise, HMR would race `ensureSeeded()` in `dev` and double-insert. Without `count > 0`, every `$ curl /api/health` would attempt inserts. Without `onConflictDoNothing`, a concurrent `/api/applications` + `/api/health` on a cold empty DB would violate `slug` uniqueness. All three together make `db:setup = migrate && seed` idempotent and `curl /api/health` safe.

#### Pattern 2 — Lender Scoring (`matchLenders`) + Contract Validation (`validateApplication`)

```typescript
// src/lib/matching.ts — Scoring is deterministic and tested; validation strings are user-facing and stable.
// Why this pattern: Tests pin the score order and the 5.4% floor; UI surfaces validateApplication strings inline.

const CREDIT_FLOOR: Record<string, number> = { excellent: 720, good: 680, fair: 620, needs_work: 580, not_sure: 640 };
const BUDGET_MID: Record<string, number> = { under_150k: 120_000, "150k_250k": 200_000, "250k_400k": 325_000, "400k_600k": 500_000, "600k_plus": 750_000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function matchLenders(input: ApplicationInput): LenderMatch[] {
  const credit = CREDIT_FLOOR[input.creditRange] ?? 640;
  const price = BUDGET_MID[input.budget] ?? 250_000;

  const scored = LENDER_SEEDS.map((lender) => {
    let score = 50;
    const reasons: string[] = [];

    if (credit >= lender.minCredit) score += 20; else { score -= 25; reasons.push("Credit may need a manual underwrite"); }
    if (lender.specialties.includes(input.homeType)) { score += 18; reasons.push(`Experienced with ${input.homeType} construction`); }
    if (input.homeType === "adu" && lender.specialties.includes("adu")) score += 10;
    if (input.landStatus === "own_land" && lender.specialties.includes("construction")) { score += 8; reasons.push("Construction-to-perm draw schedule available"); }
    // Load-bearing weights: green mortgage discount only for modular/prefab
    if (lender.greenMortgage && (input.homeType === "modular" || input.homeType === "prefab")) { score += 12; reasons.push("Green mortgage discount likely"); }

    const rate = Math.max(5.4, baseRate(credit) - lender.rateDiscountBps / 100); // floor 5.4% even for top credit + 45bps
    const payment = Math.round((loan * (rate/100/12) * (1 + rate/100/12) ** 360) / ((1 + rate/100/12) ** 360 - 1));

    return { lender, estimatedRate: Math.round(rate * 1000) / 1000, estimatedPayment: payment, matchScore: Math.max(0, Math.min(99, score)), rationale: reasons.slice(0,2).join(". ") + "." };
  });
  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);
}

export function validateApplication(input: ApplicationInput): string[] {
  const errors: string[] = [];
  if (input.fullName.trim().length < 2) errors.push("Please enter your name.");
  if (!EMAIL_RE.test(input.email.trim())) errors.push("Please enter a valid email address.");
  if (input.phone.replace(/\D/g, "").length < 10) errors.push("Please enter a valid phone number.");
  if (!/^\d{5}$/.test(input.zipCode)) errors.push("Please enter a valid 5-digit ZIP code.");
  // ... propertyIntent/homeType/landStatus/creditRange/incomeRange/budget/timeline each required
  return errors;
}
```

**Why this pattern:** `+20` credit floor / `+18` specialty / `+12` green are **load-bearing product decisions** — changing them requires product approval and test updates (see `matching.test.ts: caps at 99, floor at 0, never below 5.4%`). `validateApplication` error strings are surfaced inline in `prequal-form.tsx` and as `{ error }` in `POST /api/applications` 400 — keeping them stable prevents UI drift.

#### Pattern 3 — Payment Math (`PMI 0.65%` + `1.15×` Site-Built Comparison)

```typescript
// src/lib/calculator.ts — Auditable constants; site-built comparison shown to every buyer.
// Why this pattern: No magic numbers. Changing PMI_ANNUAL_RATE or 1.15× requires product sign-off.

const PMI_ANNUAL_RATE = 0.0065; // 65 bps annual when down < 20%

function amortize(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const n = termYears * 12;
  if (monthlyRate === 0) return principal / n; // zero-interest straight-line
  const factor = (1 + monthlyRate) ** n;
  return (principal * monthlyRate * factor) / (factor - 1);
}

export function calculatePayment(input: PaymentInput): PaymentBreakdown {
  const down = Math.min(Math.max(0, input.downPayment), homePrice);
  const downPct = homePrice === 0 ? 0 : down / homePrice;
  const monthlyPmi = downPct < 0.2 ? (loan * PMI_ANNUAL_RATE) / 12 : 0;

  // Site-built comparison is ALWAYS 1.15× — editorial decision, not market-rate fetched
  const siteBuiltComparePrice = Math.round(homePrice * 1.15);
  const siteBuiltMonthly = amortize(siteBuiltLoan, annualRate, termYears) + /* tax/insurance/PMI/HOA mirroring */;
  return { /* principal, monthlyPi/Tax/Insurance/Pmi/Hoa, monthlyTotal, loanAmount, downPct, siteBuilt* */ };
}
```

**Why this pattern:** `PMI_ANNUAL_RATE` and `1.15` are product-approved invariants used in `calculator.test.ts` (PMI only under 20%, comparison at `1.15×`, site-built PMI independent). Site-built comparison is a UX story, not a fetch — keeping it `1.15×` avoids non-deterministic rates in the calculator.

#### Pattern 4 — Pool Singleton + `force-dynamic` + Rate Limit

```typescript
// src/db/index.ts — One Pool. Never new Pool() elsewhere.
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const globalForDb = globalThis as typeof globalThis & { __arenaNextJsPostgresqlPool?: Pool };
export const pool = globalForDb.__arenaNextJsPostgresqlPool ?? new Pool({ connectionString: databaseUrl });
if (process.env.NODE_ENV !== "production") globalForDb.__arenaNextJsPostgresqlPool = pool;
export const db = drizzle(pool);

// src/app/api/applications/route.ts — The only place rate-limit + force-dynamic is needed
export const dynamic = "force-dynamic"; // DB is touched — do not add revalidate

export async function POST(request: Request) {
  if (!rateLimit(`app:${clientKey(request)}`, 8, 10 * 60 * 1000))
    return Response.json({ error: "Too many applications from this network. Try again shortly." }, { status: 429 });

  let json: unknown;
  try { json = await request.json(); } catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }

  const input = parseBody(json); // asString(...).trim().slice(0, len) + replace(/\D/g).slice(0,5) for ZIP
  const errors = validateApplication(input);
  if (errors.length > 0) return Response.json({ error: errors[0] }, { status: 400 });

  await ensureSeeded();
  const matches = matchLenders(input);
  const [row] = await db.insert(applications).values({ ...input, status: "matched" }).returning({ id: applications.id });
  if (!row) return Response.json({ error: "Could not save application." }, { status: 500 });

  for (const match of matches) {
    const [lender] = await db.select({ id: lenders.id }).from(lenders).where(eq(lenders.slug, match.lender.slug)).limit(1);
    if (!lender) continue;
    await db.insert(applicationMatches).values({ applicationId: row.id, lenderId: lender.id, estimatedRate: match.estimatedRate.toFixed(3), ... });
  }
  return Response.json({ id: row.id, matches });
}

// src/lib/rate-limit.ts — Single-instance Map
const buckets = new Map<string, { count: number; resetAt: number }>();
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) { buckets.set(key, { count: 1, resetAt: now + windowMs }); return true; }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
export function clientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}
```

**Why this pattern:** Order matters — `rateLimit` before `json()` avoids wasting parse on a throttled attacker; `parseBody` sanitizes lengths before validation; `ensureSeeded()` runs **after** validation so invalid payloads don't warm the DB; per-lender `eq(slug)` lookups are acceptable at 4 matches (batching not needed, but documented as the scaling point).

---

## 4. Data Architecture

### 4.1 Database Schema

```mermaid
erDiagram
  lenders ||--o{ application_matches : "1 → N (lenderId, cascade)"
  applications ||--o{ application_matches : "1 → N (applicationId, cascade)"
  manufacturers ||--o{ applications : "manufacturerSlug (loose)"
  states ||--o{ applications : "zipCode (geo, not FK)"
  articles ||--o{ articles : "relatedSlugs (array)"
  glossary_terms ||--o{ glossary_terms : "letter derived"
  loan_products ||--o{ applications : "downPayment / creditMin reference"

  lenders {
    uuid id PK "gen_random_uuid"
    varchar_80 slug UNIQUE
    varchar_160 name
    text description
    text_array specialties "default {}"
    integer min_credit "default 620"
    boolean green_mortgage "default false"
    integer avg_approval_days "default 10"
    integer rate_discount_bps "default 0"
    varchar_32 nmls_id
    timestamptz created_at "default now()"
    index lenders_green_idx ON green_mortgage
  }
  applications {
    uuid id PK
    varchar_120 full_name
    varchar_254 email "index applications_email_idx"
    varchar_32 phone
    varchar_5 zip_code "index zip, digits only"
    varchar_32 property_intent
    varchar_32 home_type
    varchar_32 land_status
    boolean manufacturer_known NULLABLE
    varchar_80 manufacturer_slug NULLABLE
    varchar_32 credit_range
    varchar_32 income_range
    varchar_32 budget
    varchar_32 timeline
    varchar_24 status "default new, API sets matched"
    timestamptz created_at "index created"
  }
  application_matches {
    uuid id PK
    uuid application_id FK "cascade"
    uuid lender_id FK "cascade"
    numeric_5_3 estimated_rate
    integer estimated_payment
    integer match_score "0..99"
    text rationale
    timestamptz created_at
    index matches_application_idx ON application_id
  }
  manufacturers {
    uuid id PK
    varchar_80 slug UNIQUE
    varchar_160 name
    text description
    varchar_160 headquarters
    varchar_32 founded "altered 8→32 in 0001"
    varchar_64 price_range
    varchar_32 category
    text_array home_types
    text_array features
  }
  states {
    uuid id PK
    varchar_40 slug UNIQUE
    varchar_64 name
    varchar_2 abbreviation UNIQUE
    varchar_32 lending_climate
    text lending_description
    varchar_24 median_home_price
    varchar_24 average_loan_amount
    varchar_16 prefab_market_growth
    text_array popular_areas
    text_array top_manufacturers
  }
  articles {
    uuid id PK
    varchar_160 slug UNIQUE "long slugs from content"
    varchar_240 title
    text description
    varchar_40 category
    varchar_32 read_time
    varchar_40 tag NULLABLE
    varchar_16 published_at
    varchar_16 updated_at NULLABLE
    varchar_120 author_name
    varchar_120 author_role
    varchar_80 author_slug
    text content "markdown"
    text_array keywords
    text_array related_slugs
  }
  glossary_terms {
    uuid id PK
    varchar_160 term UNIQUE
    text definition
    varchar_1 letter "derived term.charAt(0).toUpperCase()"
  }
  loan_products {
    uuid id PK
    varchar_80 slug UNIQUE
    varchar_160 name
    varchar_40 down_payment
    integer credit_min
    text summary
    text best_for
  }
```

**Extensions:** `pgcrypto 1.3` (backing `gen_random_uuid()` on all 8 PKs) + `pg_trgm 1.6` (future trigram search) — both in `infrastructure/postgres/init/00-create-extensions.sql`. Healthcheck proves init: `DO RAISE NOTICE 'pgcrypto: %', exists(select …)` → `t`.

### 4.2 Data Models (TypeScript)

```typescript
// src/lib/catalog.ts — derived from JSON, never hand-edited PG rows

interface Manufacturer {
  slug: string; name: string; description: string; metaDescription: string;
  headquarters: string; founded: string; priceRange: string;
  homeTypes: string[]; features: string[];
  category: "Affordable" | "Mid-Range" | "Premium"; // computed via priceFloor()
}
interface StateGuide {
  slug: string; name: string; abbreviation: string; lendingClimate: string;
  lendingDescription: string; medianHomePrice: string; averageLoanAmount: string;
  prefabMarketGrowth: string; popularAreas: string[]; topManufacturers: string[];
}
interface Article {
  slug: string; title: string; description: string; category: string;
  readTime: string; tag?: string; publishedAt: string; updatedAt?: string;
  authorName: string; authorRole: string; keywords: string[]; relatedSlugs: string[]; content: string;
}
interface GlossaryTerm { term: string; definition: string; }

// Derived — not in JSON, built in catalog.ts
interface Author { slug: string; name: string; role: string; bio: string; }
// AUTHOR_BIOS hard-codes 5 bios; rest fallback to generic string
const SITE = { name:"ModFii", tagline:"The #1 Prefab Home Mortgage Platform", email:"team@modfii.com", hq:"Nashville, TN", nmls:"2537136", linkedin:"...", twitter:"@ModFii" } as const;

// src/db/schema.ts — Drizzle mirrors above plus transactional tables
// src/lib/lenders.ts — canonical seeds
interface LenderSeed { slug:string; name:string; description:string; specialties:string[]; minCredit:number; greenMortgage:boolean; avgApprovalDays:number; rateDiscountBps:number; nmlsId:string; }

// src/lib/matching.ts — funnel contract
interface ApplicationInput { fullName:string; email:string; phone:string; zipCode:string; propertyIntent:string; homeType:string; landStatus:string; manufacturerKnown:boolean|null; manufacturerSlug?:string; creditRange:string; incomeRange:string; budget:string; timeline:string; }
interface LenderMatch { lender: LenderSeed; estimatedRate:number; estimatedPayment:number; matchScore:number; rationale:string; }

// src/lib/calculator.ts — payment math
interface PaymentInput { homePrice:number; downPayment:number; annualRate:number; termYears:number; annualTaxRate:number; annualInsurance:number; hoaMonthly:number; }
interface PaymentBreakdown { principal:number; monthlyPi:number; monthlyTax:number; monthlyInsurance:number; monthlyPmi:number; monthlyHoa:number; monthlyTotal:number; loanAmount:number; downPaymentPct:number; siteBuiltComparePrice:number; siteBuiltMonthly:number; monthlySavingsVsSiteBuilt:number; }
```

Corpus sizes (proven by `psql count(*)` after `db:seed`): `LENDER_SEEDS 8 / LOAN_PRODUCT_SEEDS 5 / manufacturers 40 / states 50 / articles 23 / glossary 59`. `articles.slug` is `varchar(160)` to accommodate long editorial slugs; `glossaryTerms.letter` is derived from `term.charAt(0).toUpperCase()` in `ensure-seeded.ts` (not from JSON).

### 4.3 Persistence Strategy

| Concern | Strategy | Evidence |
|---------|----------|----------|
| Connection | Single `Pool` via `globalThis.__arenaNextJsPostgresqlPool` in `src/db/index.ts`; `drizzle(pool)` used everywhere; `DATABASE_URL` throw guards missing env | `globalThis` prevents HMR double-pool; never `new Pool()` inline (`rg` proven) |
| Migrations | `drizzle-kit generate` (`satisfies Config`) → `drizzle/*.sql` + `meta/_journal.json` → `tsx src/scripts/migrate.ts` `migrate(db, { migrationsFolder:"./drizzle" })` | `0000_amusing_thena.sql` (8 tables) + `0001_sharp_stick.sql` (`founded 8→32`), `strict/verbose`, journal `idx 0,1` |
| Lifecycle guards | `src/scripts/local-db.ts` `isLocalDatabaseUrl` / `assertLocalDatabase` — `localhost/127.0.0.1/::1` only; `migrate/seed/reset` all call `assertLocalDatabase()` | Refuses non-local `DATABASE_URL` before touching schema — CI prod migrations must use a separate path |
| Seeding | `ensureSeeded()` idempotent — `__modfiiSeedPromise` + `count(lenders)>0` + `onConflictDoNothing` per slug/term; auto-runs in `/api/health` and `/api/applications`; reuse, don't duplicate | `npm run db:setup = db:migrate && db:seed`; `npm run db:reset` does `DROP SCHEMA public,drizzle CASCADE` + `CREATE SCHEMA public` + `CREATE EXTENSION pgcrypto/pg_trgm` |
| Query style | `select().from().where(eq(...)).limit(1)`, `insert().values().returning()`, `sql<number>` only for `count(*)::int`; `applications` loop fetches lender by `eq(slug)` per match (N=4, batching not needed) | Documented scaling point — batch `whereIn` if match fanout grows |
| Fallback | Content pages can render from `catalog.ts` JSON without DB (static-first `○`); only API routes + `ensureSeeded` require DB | `GET /api/health` returns `500 { ok:false, db:false }` on DB failure (readiness probe) |

---

## 5. Design System Reference

### 5.1 Typography

| Role | Typeface | Token | Usage |
|------|----------|-------|-------|
| Display / Headings | `Outfit` | `var(--font-outfit)` → `.font-display` | `h1,h2,h3,h4`, `Hero` title, `GuideView` sections, stat chips (`font-display text-xl font-bold`). Loaded via `next/font/google` `Outfit({ variable:"--font-outfit", display:"swap" })`. |
| Body / UI | `DM Sans` | `var(--font-dm-sans)` → `.font-sans` (default) | All body copy, nav, form labels, `Container` prose. `DM_Sans({ variable:"--font-dm-sans", display:"swap" })`. `html { letter-spacing }` tightened on headings via `letter-spacing:-0.03em` on `.font-display`. |
| Monospace | `ui-monospace` fallback | System stack | Not used — luxury dark palette, no code blocks in product. |

`sprintf`: `src/app/layout.tsx: <html className={`${dmSans.variable} ${outfit.variable}`}>` + `globals.css { body { font-family: var(--font-sans) } .font-display { font-family: var(--font-display) } }`.

### 5.2 Color Tokens

Single source: `src/app/globals.css:@theme`. Extend only there — no `text-[13px]` arbitrary.

| Token | HSL Value | Hex Approx | Usage | WCAG Contrast vs Background |
|-------|-----------|------------|-------|------------------------------|
| `--color-background` | `hsl(40 33% 99%)` | `#FFFCF8` warm cream | Page background | — base |
| `--color-foreground` | `hsl(155 30% 12%)` | `#14261F` forest text | Primary text | AAA |
| `--color-card` | `hsl(40 25% 97%)` | `#F9F6F0` | Card surfaces | — |
| `--color-card-foreground` | `hsl(155 30% 12%)` | `#14261F` | Card text | AAA |
| `--color-primary` | `hsl(155 45% 28%)` | `#26694E` | Primary actions, link hover | AAA |
| `--color-primary-600` | `hsl(155 50% 22%)` | `#1D4D38` | Primary hover (`hover:bg-primary-600`) | AAA |
| `--color-primary-foreground` | `hsl(40 33% 99%)` | `#FFFCF8` | Text on primary | AAA |
| `--color-secondary` | `hsl(150 20% 92%)` | `#E6EEE8` | Secondary button (`bg-secondary`) | — |
| `--color-secondary-foreground` | `hsl(155 30% 12%)` | `#14261F` | Text on secondary | AAA |
| `--color-muted` | `hsl(150 15% 93%)` | `#ECEEE9` | Muted bg (`bg-muted` hover) | — |
| `--color-muted-foreground` | `hsl(155 10% 45%)` | `#6A7A73` | Muted text, secondary prose | AA (large text only) |
| `--color-accent` | `hsl(38 92% 50%)` | `#F59E0B` | CTA, highlight line, star fill, selection | — |
| `--color-accent-foreground` | `hsl(38 95% 12%)` | `#3D2602` | Text on accent | AAA |
| `--color-destructive` | `hsl(0 72% 51%)` | `#DC2626` | Errors (not yet surfaced — future validation) | AAA |
| `--color-border` / `--color-input` | `hsl(150 15% 88%)` | `#DDE3DE` | Borders, inputs | — |
| `--color-ring` | `hsl(155 45% 28%)` | `#26694E` | Focus ring (`focus-visible: outline 2px solid ring`) | — |
| `--color-cream` | `hsl(40 40% 96%)` | `#F8F3E8` | Section wash (alt cream band) | — |
| `--color-forest` | `hsl(155 42% 16%)` | `#173326` | Deep forest (`bg-forest` header/hero, `bg-forest` PageHero) | — |
| `--color-moss` | `hsl(150 22% 34%)` | `#426752` | Muted green label | — |
| Radii | `sm:0.5rem → 2xl:1.5rem` (`md 0.75, lg 1.0, xl 1.25`) | — | `SiteHeader` dropdown `rounded-xl`, `GuideView` FAQ `rounded-xl`, stat chip `rounded-xl` | — |
| Shadow | `--shadow-lift: 0 18px 40px -24px hsl(155 30% 12% / 0.35)` | — | Elevated cards, header dropdown `shadow-[0_18px_40px_-24px_...]` | — |
| Ease | `--ease-brand: cubic-bezier(0.22,1,0.36,1)` | — | Brand easing (header `transition-colors duration-300`) | — |

### 5.3 Component Primitives

| Primitive | File | API | Notes |
|-----------|------|-----|-------|
| `cn(...parts)` | `ui.tsx` | `cn(string|false|null|undefined)` → `string` | Filtered `join(" ")` — variant merging without `clsx`. |
| `Button` | `ui.tsx` | `variant: primary/secondary/accent/outline/ghost/onPrimary`, `size: sm/md/lg`, `className`, `...ButtonHTMLAttributes` | `primary` has `shadow-[0_10px_24px_-12px_hsl(155_45%_28%/0.8)]`; `onPrimary` is `border-white/30 text-primary-foreground hover:bg-foreground/10` (transparent over dark hero). |
| `ButtonLink` | `ui.tsx` | `href`, `variant`, `size`, `onClick?` | `next/link` wrapper with same variant tokens; `SiteHeader` CTA is forest on hero (`border-transparent bg-forest text-white hover:bg-primary-600`). |
| `Container` | `ui.tsx` | `children`, `className?` | `mx-auto w-full max-w-[1400px] px-4 md:px-8` — header `h-16` fixed + `backdrop-blur-md` + `border-b` uses this width. |
| `Badge` | `ui.tsx` | `children` | `rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]`. |
| `SiteHeader` | `site-header.tsx` | fixed `h-16 z-50` | `NAV` 4 (`Financing/Resources/How It Works/FAQ`) + `MORE` 4 (`ADU Financing/Tiny Home/Calculator/Learn`), `useId` + `useState(prevPathname)` adjust-during-render (not `setState` in effect) to close menus on nav. Never amber CTA. |
| `SiteFooter` | `site-footer.tsx` | `footer` | `LinkedInIcon` local SVG (lucide has no brand), `Container`, link columns mirroring `modfii.com`. |
| `PageHero` | `page-shell.tsx` | `eyebrow?, title, highlight?, description, crumbs, imageSrc?, stats?, ctas?` | Centered interior hero: `bg-forest` + `Image fill object-cover opacity-35` + `from-forest/80 via-forest/85 to-forest/90` + `radial-gradient(circle_at_top_right, hsl(38 92% 50%/0.16))` + star pill `border-white/35 bg-white/10` + `highlight` amber span + `Breadcrumbs light center` + CTA pair (`secondary/onPrimary`) + glass chips `border-white/15 bg-white/10 backdrop-blur-sm`. All `GuideScreen` pages flow through it. |
| `Breadcrumbs` | `page-shell.tsx` | `items: {name,href?}[]`, `light?, align?` | `/` separator, `light` maps to `text-primary-foreground/70 → text-primary-foreground`, `center` adds `justify-center`. |
| `GuideView` | `page-shell.tsx` | `guide: GuidePageContent`, `crumbs`, `children?` | `PageHero` + `grid lg:grid-cols-[1fr_280px]` article / aside `bg-accent/10 border-accent/20` CTA + related `grid md:grid-cols-2`. |

### 5.4 Motion / Animation

| Rule | Value | Where |
|------|-------|-------|
| Header transition | `transition-colors duration-300` | `site-header.tsx` `overDarkHero` → `bg-background/90` switch |
| Dropdown icon | `transition rotate-180` | `ChevronDown` on `MORE` open |
| Scroll behavior | `scroll-behavior: smooth` on `html`, collapsed to `auto` under `prefers-reduced-motion` | `globals.css @layer base` |
| Selection | `background: hsl(38 92% 50% / 0.28)` amber wash | `::selection` |
| Decorative | `.grain::after` SVG turbulence (`feTurbulence baseFrequency 0.85`, `opacity 0.08`, `multiply`) + `.hero-grid` 48px grid | Utilities (not yet used on every page — available) |
| Reduced motion | `animation-duration 0.01ms`, `transition-duration 0.01ms` under `@media (prefers-reduced-motion: reduce)` | Global a11y guard |

---

## 6. Security Architecture

### 6.1 Security Rules (Enforcement)

| # | Rule | Enforcement Mechanism | Fails When |
|---|------|-----------------------|------------|
| S-01 | `DATABASE_URL` required, throws at import | `src/db/index.ts: if (!databaseUrl) throw` | App boot without env → `Error: DATABASE_URL is required` (same in `src/scripts/local-db.ts` invalid URL branch) |
| S-02 | Lifecycle scripts (`migrate/seed/reset`) only on local hosts | `assertLocalDatabase()` checks `localhost/127.0.0.1/::1`; `migrate.ts/seed.ts/reset.ts` all call it before touching PG | Prod host `DATABASE_URL` → `Refusing to run against non-local database host "<host>"` |
| S-03 | `BETTER_AUTH_URL` must be canonical prod origin, not `localhost` in prod | `BETTER_AUTH_URL=https://modfii.jesspete.shop` in `.env` + `BETTER_AUTH_TRUSTED_ORIGINS` for extras; origin derived server-side from proxy headers per `CLAUDE.md` audit `H-AUTH` | `localhost` in prod → `Invalid origin` on sign-in |
| S-04 | `NEXT_PUBLIC_SITE_URL` must equal canonical prod origin | Used for `metadataBase` + `sitemap.xml` + OG `og:url` — wrong value emits wrong host | Stale `home-financing.jesspete.shop` in old history → redeploy with `modfii.jesspete.shop` (now correct in `.env`) |
| S-05 | No `new Pool()` outside singleton; no `as any` / `@ts-ignore` | `rg` guard + `tsconfig strict` + `eslint` (`defineConfig` + `core-web-vitals`) | `typecheck` fails or manual audit catches second pool |
| S-06 | No `tailwind.config.*`, no arbitrary `text-[13px]` | `@theme` sole source; `ls tailwind.config*` must be absent; PR review enforces token discipline | Style drift, purple-gradient cliché |
| S-07 | No server → client import (RSC boundary) | `next build` throws boundary violation before `e2e` | Prod build fails |
| S-08 | `POST /api/applications` must `rateLimit` before `json()` | `applications/route.ts` order `rateLimit → try json catch 400 → validateApplication 400`, `429` per IP | Burst attacker wastes parse + DB without throttle |
| S-09 | Never commit secrets (`.env`, `bak.env`, `env.tgz`, `ssh-key.txt`) | `.gitignore` covers all variants + `git rm --cached .env` since `ec11541` | `git add -f .env` leaks `BETTER_AUTH_SECRET`/`CRON_SECRET` (incident `d572d73` — see §11) |
| S-10 | Public funnel returns JSON errors, never HTML error pages | `Response.json({ error }, { status })` with `400/429/500`; success `200 { id, matches }` | Error-page HTML would break `prequal-form.tsx` inline alert |
| S-11 | Prod `images.unoptimized:true` is intentional | `next.config.ts` documented; `DISABLE_IMAGE_OPTIMIZER` sandbox guard in `ENV` | Re-enabling without infra causes `sharp` deadlock |

Live header evidence (from `curl -v http://localhost:3002/api/health`):

```
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://static.cloudflareinsights.com;
  frame-src https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com https://cloudflareinsights.com;
  img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'
permissions-policy: camera=(), microphone=(), geolocation=()
referrer-policy: strict-origin-when-cross-origin
strict-transport-security: max-age=63072000; includeSubDomains; preload
x-content-type-options: nosniff
x-frame-options: DENY
x-request-id: <uuid>
```

### 6.2 Security Utilities Inventory

| Utility | File | Role |
|---------|------|------|
| `validateApplication()` | `src/lib/matching.ts` | ZIP `^\d{5}$`, phone `replace(/\D/g).length≥10`, `EMAIL_RE`, required selects; error strings user-facing, stable |
| `parseBody()` | `src/app/api/applications/route.ts` | `asString(...).trim().slice(0, len)` per field, `zip.replace(/\D/g).slice(0,5)`, `manufacturerKnown` boolean guard — prevents long-string / injection payloads |
| `rateLimit()` / `clientKey()` | `src/lib/rate-limit.ts` | In-memory `Map` buckets, `x-forwarded-for` first-entry trimmed → `x-real-ip` → `local` |
| `isLocalDatabaseUrl()` / `assertLocalDatabase()` | `src/scripts/local-db.ts` | Refuses non-local `DATABASE_URL` for lifecycle scripts |
| `num()` clamp | `src/app/api/calculator/route.ts` | `Number(value)` + `isFinite` + `min/max` clamp per numeric field |

### 6.3 Authentication & Authorization

| Aspect | State |
|--------|-------|
| Strategy | Better Auth (env `BETTER_AUTH_SECRET` `openssl rand -base64 32`, `BETTER_AUTH_URL` canonical origin) — `better-auth` not yet wired to tables in `src/db/schema.ts` (intentional: funnel is public, no `401/403` on `/api/applications`). Auth endpoints will be added when user accounts ship. |
| Sessions | Not yet — `applications` has `email` index, no `users` table. When added, must follow Better Auth DB adapter pattern + `BETTER_AUTH_TRUSTED_ORIGINS` allow-list. |
| RBAC | None — public marketplace. `glossaryTerms`, `loanProducts`, `articles` are public read. `applications` writes are rate-limited, not auth-gated. |
| Stripe | Optional in dev (`sk_test_set-me`), webhook `whsec_set-me`; `RESEND_API_KEY` unset → log transport. No checkout flow in this iteration. |
| OAuth | `AUTH_GOOGLE_*` / `AUTH_APPLE_*` optional, empty in dev `.env`. |

### 6.4 Threat Model

| Vector | Mitigation | Residual |
|--------|------------|----------|
| Burst abuse on public funnel `POST /api/applications` | `8/10min` per IP via `clientKey` (`x-forwarded-for` isolation in tests), probe shows `400×8 → 429×2` | In-memory `Map` resets on restart, **under-limits on multi-instance** → migrate to Redis/Upstash or `Upstash Ratelimit` before horizontal scaling. Document via `ENV FEATURE_*` flag when introduced. |
| `x-forwarded-for` spoofing | Trust proxy — origin derived server-side from proxy-controlled headers (`BETTER_AUTH_URL` doc); `clientKey` takes first entry only (standard `XFF` chain). Direct IP without proxy falls back to `x-real-ip`. | Requires correct reverse-proxy `forwarded` header config on deploy. |
| Large-body / long-string DoS | `parseBody` `slice(0, len)` per field (80–254), `zip` stripped to digits+5; `num()` clamp on calculator | Payload beyond `slice` is truncated, not rejected — acceptable for name/email. |
| DB lifecycle against prod | `assertLocalDatabase` throws on non-local host; `reset.ts` does `DROP SCHEMA public,drizzle CASCADE` only locally | CI must never set `DATABASE_URL` to prod when running `db:migrate/seed/reset`. |
| Secret leakage in git history | `.env` untracked since `ec11541` (`git rm --cached .env`), `.gitignore` covers `bak.env/env.tgz/ssh-key.txt`; incident `d572d73` committed real `BETTER_AUTH_SECRET`/`CRON_SECRET` that remain in history (see §11) | **Rotate** `BETTER_AUTH_SECRET` + `CRON_SECRET` in deploy + scrub history with `filter-repo`/BFG if required (current `.env` has fresh `ec16d809…` for `CRON_SECRET`). |
| SEO poison via wrong canonical | `NEXT_PUBLIC_SITE_URL` drives `metadataBase` + OG + `sitemap.xml`; wrong value emits stale host | Fixed in current `.env` → `https://modfii.jesspete.shop`; deploy must mirror. E2E `seo.spec.ts` pins absolute `loc`. |
| XSS via `content` markdown | `markdown.tsx` must sanitize if raw HTML is rendered — verify when touching (not expanded here). | Audit `markdown.tsx` before allowing user-generated `content`. |

---

## 7. Worker / Background Service Architecture

**Status: Not yet — reserved.**

No queue, worker, or async pipeline is running in this iteration. `CRON_SECRET` (`openssl rand -hex 16`) is reserved for the future jobs runner. `RESEND_API_KEY` being unset selects a log transport (no real email sent). `ensureSeeded()` runs inline on `GET /api/health` and `POST /api/applications` rather than via a background job — acceptable because seeding is idempotent and completes in <1s on the seeded-check fast path (`count(lenders)`).

**When scaling:** Prefer `Trigger.dev v4` or `Inngest` (see `nextjs-typescript-patterns` anti-patterns for `advisory-lock` booking-style jobs) over `BullMQ` if a multi-step ingest or email queue is added. Document the queue name, concurrency, retry policy, and idempotency key in this section when introduced. Until then, do **not** add a worker directory without an ADR.

---

## 8. Testing Strategy

### 8.1 Test Distribution

| Category | Framework | Files | Tests | Location | DB | Command |
|----------|-----------|-------|-------|----------|----|---------|
| Unit — pure domains | Vitest `3.2.7` (`node`) | 3 | 31 | `src/lib/calculator.test.ts` (11), `matching.test.ts` (13), `rate-limit.test.ts` (7) | None | `npm run test` / `test:watch` / `test:coverage` |
| E2E — smoke | Playwright `1.63.0` + `@axe-core/playwright 4.13.0` | 1 | 7 | `e2e/smoke.spec.ts` | Optional (`health` tolerates `200|500`) | `npm run e2e` |
| E2E — SEO | Playwright | 1 | 6 | `e2e/seo.spec.ts` | Optional | (same) |
| E2E — funnel | Playwright | 1 | 4 | `e2e/funnel.spec.ts` | **Required** for valid-payload 200 path (other 3 run DB-less) | (same) |
| E2E — assets | Playwright | 1 | 9 (6 looped) | `e2e/assets.spec.ts` | None | (same) |
| **Total** | Vitest + Playwright | 7 | **58 (31+27)** | `src/lib/*.test.ts` + `e2e/*.spec.ts` | See notes | `npm run db:setup → lint → typecheck → test → build → e2e` |

With Postgres: **27/27** E2E (chromium). Without DB: **26/27** (funnel valid-payload is the only DB-dependent test). `e2e:all` runs `chromium + webkit`.

### 8.2 Test Patterns

| Pattern | Where | What Is Asserted |
|---------|-------|------------------|
| Deterministic scoring | `matching.test.ts` | `returns ≤4`, `sorted descending`, `cap 99 floor 0`, `rate floor 5.4%`, `in-specialty > out-of-specialty`, `lower credit → higher rate`, `rationale non-empty` |
| Validation boundaries | `matching.test.ts` | `ZIP ^\d{5}$`, `EMAIL_RE`, phone digits `≥10`, `name.length≥2`, missing selects per field |
| Limiter isolation | `rate-limit.test.ts` + `funnel.spec.ts` | `allows up to limit`, `blocks after`, `resets after window`, `isolated per key`, `x-forwarded-for` trim, burst `400×8→429×2` |
| Amortization + PMI | `calculator.test.ts` | `standard amortize`, `monthlyTotal = sum`, `PMI only <20%`, `0.65% annual`, `zero-interest straight-line`, `down clamped to price`, `site-built 1.15×`, `site-built PMI independent`, `negative price → 0` |
| Regression guard | `assets.spec.ts` | `6 image assets 200` + `no broken <img>` on `/`, `/adu-financing`, `/tiny-home-financing` + `2 compare parity aliases resolve (308→200)` — guards `2026-09-11` production incidents |
| SEO pin | `seo.spec.ts` | `sitemap <urlset` + `/get-started /calculator /learn /modular-home-financing` + `152` absolute locs + `every loc 200` (first 30) + `robots Allow:/` + `title contains ModFii` |
| A11y | `smoke.spec.ts` | `AxeBuilder(include: main).analyze()` → `critical: []` |
| Prod parity | `playwright.config.ts` | `webServer: npx next start --port 3002` (not `dev`), `reuseExistingServer:true`, `timeout:30000` |

### 8.3 Coverage Thresholds

| Module | Threshold | Enforcement |
|--------|-----------|-------------|
| `src/lib/calculator.ts` | 100% line on amortization + PMI + site-built compare | Vitest `test:coverage` (configure when adding); current 11 tests cover every branch (`principal≤0`, `rate==0`, `down>price`, `negative price`) |
| `src/lib/matching.ts` | 100% on `validateApplication` + `matchLenders` scoring weights | 13 tests; `CREDIT_FLOOR` + `BUDGET_MID` defaults covered |
| `src/lib/rate-limit.ts` | 100% | 7 tests |
| `e2e/**` | Every `sitemap.xml` loc absolute; every referenced image 200; every `next.config.ts` redirect resolves | `seo.spec.ts` + `assets.spec.ts` |
| Overall | No global `%` gate yet — module thresholds above are the contract | Add `vitest.config.ts:coverage.thresholds` when `test:coverage` is wired to CI |

### 8.4 Pre-PR / Pre-Deploy Checklist

```bash
npm run db:setup      # migrate + seed idempotent → 8/40/50/23/59/5
npm run lint          # ESLint flat (0 errors / 0 warnings) — skills/infrastructure excluded
npm run typecheck     # tsc --noEmit (skills excluded)
npm run test          # vitest 31/31
npm run build         # next build — validates redirects + RSC boundaries + skills excluded
npm run e2e           # playwright chromium 27/27 (prod next start on 3002; valid-payload needs DB)
curl -s http://localhost:3002/api/health | jq  # { ok:true, status:ok, db:true }
curl -s http://localhost:3002/sitemap.xml | grep -c "<loc>"  # 152
```

**Order that matters (AGENTS.md):** `db:setup → lint → typecheck → test → build → e2e`. `docker compose logs -f postgres` should show no `FATAL` after seed.

---

## 9. Build & Deployment

### 9.1 Production Build

```bash
npm run build         # next build → .next (no output: "standalone" — add in next.config.ts if containerizing; no static export — SSR Node required for /api/*)
npm start             # next start (default 3000; prod E2E uses 3002 via E2E_PORT)
```

**Build artifact verified 2026-09-11:**

```
Route (app)
┌ ○ /  (+ 35 static: /about, /adu-financing, /calculator, /compare/*, /construction-loans/*, /modular-home-financing/**, /glossary, /resources, /robots.txt, /sitemap.xml, /terms, /tiny-home-financing)
├ ƒ /api/applications
├ ƒ /api/calculator
├ ƒ /api/health
├ ƒ /authors/[authorSlug]
├ ƒ /learn/[slug]
├ ƒ /modular-home-financing/manufacturers/[slug]
├ ƒ /modular-home-financing/states/[state]
└ ○ /_not-found

○ (Static)  prerendered as static content
ƒ (Dynamic) server-rendered on demand

✓ Running next.config.ts took 83ms (redirects validated)
✓ Compiled successfully in 538ms
✓ Generating static pages using 3 workers (43/43) in 957ms
```

### 9.2 Environment Variables

Canonical from `.env.example` + `docker-compose.yml` + `src/db/index.ts` + `src/app/layout.tsx:metadataBase`. Runtime `DATABASE_URL` wins over `drizzle.config.*` fallback.

| Variable | Required | Description | Default / Example |
|----------|----------|-------------|-------------------|
| `DATABASE_URL` | **Yes** | PG 17 connection — app **throws** if missing (`src/db/index.ts`) | `postgresql://home_financing_user:home_financing_secret@localhost:5434/home_financing_dev` |
| `BETTER_AUTH_SECRET` | **Yes** | Auth signing (`openssl rand -base64 32`) | `set-me…` (never commit; rotate if `d572d73` exposed it) |
| `BETTER_AUTH_URL` | **Yes** | Canonical public origin — must be real origin in prod or auth fails `Invalid origin` (audit `H-AUTH`) | `http://localhost:3000` (dev) / `https://modfii.jesspete.shop` (prod) |
| `BETTER_AUTH_TRUSTED_ORIGINS` | No | Extra trusted origins, comma-separated | `https://admin.example` |
| `NEXT_PUBLIC_SITE_URL` | **Yes** | `metadataBase` + OG + `sitemap.xml` host — **must equal canonical prod origin** | `http://localhost:3000` (dev) / `https://modfii.jesspete.shop` (prod deploy) |
| `CRON_SECRET` | **Yes** | Jobs runner (`openssl rand -hex 16`) | `ec16d809…` (reserved, not yet consumed) |
| `STRIPE_SECRET_KEY` | No (feature) | Stripe test/live secret | `sk_test_set-me` |
| `STRIPE_WEBHOOK_SECRET` | No (feature) | Webhook signing | `whsec_set-me` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No (feature) | Stripe publishable | `pk_test_set-me` |
| `RESEND_API_KEY` | No | Transactional email; unset → log transport | `re_…` |
| `EMAIL_FROM` | No | From header | `ModFii <orders@modfii.example>` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | No | OAuth | — |
| `AUTH_APPLE_ID` / `AUTH_APPLE_SECRET` | No | OAuth | — |
| `FEATURE_*` | No | Flags `on/off` (also `true/false`, `1/0`); unknown `FEATURE_*` fails fast | `FEATURE_TRADE=off` |
| `DISABLE_IMAGE_OPTIMIZER` | No | `1` in sandboxes where `sharp` deadlocks; if used must stay in `turbo.json:globalEnv` | `1` |

> `.env` never committed (see §6.1 S-09). `d572d73` history still contains real `BETTER_AUTH_SECRET`/`CRON_SECRET` — rotate on deploy.

### 9.3 Docker Configuration

| Property | Value |
|----------|-------|
| Image | `postgres:17-alpine` |
| Container | `home_financing_postgres` |
| Port | Host `5434 → 5432` in container |
| Database / User / Password | `home_financing_dev` / `home_financing_user` / `home_financing_secret` (`PGDATA /var/lib/postgresql/data/pgdata`) |
| Init | `infrastructure/postgres/init/00-create-extensions.sql` (`pgcrypto + pg_trgm` + `DO RAISE NOTICE`) |
| Volume | `home_financing_data: /var/lib/postgresql/data` (named, `driver: local`) |
| Network | `home_financing_net: bridge` |
| Restart | `unless-stopped` |
| Healthcheck | `CMD-SHELL pg_isready -U home_financing_user -d home_financing_dev` (`interval 5s, timeout 5s, retries 10, start 10s`) |
| Size | ~80–90 MB image + data volume (corpus is ~150 KB JSON → ~2 MB PG) — no hardening beyond default (not a prod DB — dev only) |
| Destructive reset | `docker compose down -v` wipes `home_financing_data`; `npm run db:reset` is the app-level reset (`DROP SCHEMA public,drizzle CASCADE` + `CREATE EXTENSION`) |

### 9.4 CI/CD Pipeline

| Stage | Tool | Gate |
|-------|------|------|
| Install | `npm ci` (lockfile `package-lock.json`) | Lockfile must match `package.json` |
| DB provision | `docker compose up -d` + `npm run db:setup` (CI) | `migrate` + `seed` idempotent; `docker compose logs -f postgres` shows `pgcrypto: t` |
| Quality | `npm run lint` (flat + `core-web-vitals`) + `npm run typecheck` + `npm run test` | `lint 0/0`, `typecheck` pass (`skills` excluded), `test 31/31` |
| Build | `npm run build` | `43/43` pages, redirects validated, RSC boundaries proven |
| E2E | `npm run e2e` (prod `next start` on `3002`) + `npm run e2e:all` (chromium+webkit) | `27/27` (with DB) / `26/27` (without DB, funnel valid-payload blocked) |
| Readiness | `curl http://localhost:3002/api/health` | `{ ok:true, status:ok, db:true }` |
| Deploy | Vercel / Node SSR (no `standalone` yet — add `output:"standalone"` in `next.config.ts` if containerizing) | `NEXT_PUBLIC_SITE_URL` + `BETTER_AUTH_URL` must be `https://modfii.jesspete.shop` or sitemap/OG/auth break |

No pipeline file (`.github/workflows/*`) is present — gate is documented for manual `pre-push`. When adding CI, pin `Node ≥20`, cache `npm`, and run `db:setup` before `lint`.

---

## 10. Developer Handbook

### 10.1 Local Setup

**Prereqs:** Node ≥20, npm, Docker (or an existing PG 17), `openssl`.

```bash
# 1 — Clone & install (npm — lockfile is package-lock.json, not pnpm)
git clone <repo-url> home-financing
cd home-financing
npm install

# 2 — Env (copy then fill required values)
cp .env.example .env
# Fill at minimum: DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_SITE_URL, CRON_SECRET
# Generate secrets:
openssl rand -base64 32   # BETTER_AUTH_SECRET
openssl rand -hex 16      # CRON_SECRET
# Current dev .env already has: DATABASE_URL @localhost:5434/home_financing_dev
# and prod hosts https://modfii.jesspete.shop for BETTER_AUTH_URL / NEXT_PUBLIC_SITE_URL

# 3 — Database (Docker path — simplest). Host 5434 is intentional (3000 is taken by scandihaven on this dev host)
docker compose up -d
docker compose logs -f postgres   # expect: pgcrypto extension: t / pg_trgm extension: t

# 3b — One-shot init (migrate + seed) — idempotent, local-guarded
npm run db:setup
# → [db] migrations applied (drizzle/0000 + 0001) + [db] seed complete (8/40/50/23/59/5)
# Granular: npm run db:generate / db:migrate / db:seed / db:reset

# 4 — Run (if 3000 taken, use 3002 — E2E default is 3002 via E2E_PORT)
npm run dev                    # http://localhost:3000
# or
npx next dev --port 3002       # http://localhost:3002
# prod preview:
npm run build && npm start     # http://localhost:3000 (or npx next start --port 3002)

# 5 — Verify
curl -s http://localhost:3002/api/health | jq                   # { ok:true, status:ok, db:true }
curl -s http://localhost:3002/sitemap.xml | grep -o "<loc>" | wc -l  # 152
npm run lint && npm run typecheck && npm run test && npm run build && npm run e2e  # full gate
```

**Alternative — existing PG17 instead of Docker:**

```bash
# Point DATABASE_URL at your PG17 (no code change — runtime env wins):
DATABASE_URL=postgresql://user:pass@localhost:5432/home_financing_dev npm run dev
```

### 10.2 Common Commands

| Command | Location | Purpose |
|---------|----------|---------|
| `npm install` | `package.json` | Install (npm) |
| `cp .env.example .env` | root | Env scaffold — then fill `DATABASE_URL` + `BETTER_AUTH_SECRET` + `CRON_SECRET` |
| `docker compose up -d` | `docker-compose.yml` | PG 17 on host `5434` |
| `docker compose logs -f postgres` | `docker-compose.yml` | Extension + health verification |
| `docker compose down -v` | — | **Destructive** — wipes `home_financing_data` volume |
| `npm run db:generate` | `drizzle.config.ts` | `drizzle-kit generate` → `drizzle/*.sql` |
| `npm run db:migrate` | `src/scripts/migrate.ts` | Apply `drizzle/` → PG (guarded, idempotent) |
| `npm run db:seed` | `src/scripts/seed.ts` | `ensureSeeded()` idempotent (8/40/50/23/59/5) |
| `npm run db:setup` | `db:migrate && db:seed` | One-shot init |
| `npm run db:reset` | `src/scripts/reset.ts` | Destructive local reset (`DROP SCHEMA public,drizzle CASCADE` + restore extensions) |
| `npm run dev` | `package.json` | `next dev` (3000; use `--port 3002` if colliding) |
| `npm run build` | `package.json` | Prod build (validates `redirects`, requires `skills` excluded) |
| `npm start` | `package.json` | `next start` |
| `npm run lint` | `eslint.config.mjs` | Flat ESLint (0/0) |
| `npm run lint:fix` | `eslint.config.mjs` | `--fix` |
| `npm run typecheck` | `tsconfig.json` | `tsc --noEmit` (`skills` excluded) |
| `npm run test` | `vitest.config.ts` | `vitest run` 31 tests |
| `npm run test:watch` | `vitest` | Watch mode |
| `npm run test:coverage` | `vitest` | Coverage |
| `npm run e2e` | `playwright.config.ts` | `playwright --project=chromium` (prod 3002) — funnel valid-payload needs `db:setup` |
| `npm run e2e:all` | `playwright.config.ts` | `chromium + webkit` |
| `sudo docker exec home_financing_postgres psql -U home_financing_user -d home_financing_dev -c "select count(*) from lenders;"` | — | Live row-count probe |

### 10.3 Code Style Rules

| Rule | Enforcement |
|------|-------------|
| TypeScript `strict:true`, no `any` (use `unknown` + narrowing), prefer `interface` over `type`, lean on inference (no explicit return type unless needed) | `tsc --noEmit` + `eslint` |
| Path alias `@/* → ./src/*` (`tsconfig.json:paths` + `vitest.config.ts:alias`) — always `@/lib/*`, `@/db/*`, `@/components/*` | Import lint (manual) |
| Tailwind v4 `@theme` only (`globals.css`), mobile-first, no arbitrary `text-[13px]`, `cn()` merges | PR review + `ls tailwind.config*` must stay absent |
| Server Components by default; `"use client"` only for `site-header`, `prequal-form`, `calculator-app` | `next build` boundary check |
| Never `new Pool()` outside `src/db/index.ts` | `rg "new Pool"` guard |
| Library discipline: use `ui.tsx` primitives (`Button/ButtonLink/Container/Badge`), wrap/style but don't re-implement | PR review |
| Every async form disables submit + spinner + `onError` inline alert; every list has empty state; `useId()` for a11y ids | Manual / e2e funnel spec |
| Naming: Components `PascalCase.tsx` (new), `kebab-case.tsx` grandfathered; lib `camelCase.ts` (kebab grandfathered like `rate-limit.ts` — don't mass-rename); route folders `kebab-case` | PR review |
| **Red → Green → Refactor → Commit** TDD for logic domains (one cycle per commit); bugs get failing regression test first | Commit hygiene (no hook yet — `husky + lint-staged` via `setup-pre-commit` skill if added) |

### 10.4 Git Workflow

| Concern | Convention |
|---------|------------|
| Branching | `main` is deploy (`origin/HEAD → origin/main`); feature `feat/<slug>`, fix `fix/<slug>`, `chore/<slug>` — short-lived (1–3 days), rebase or PR merge; never commit non-trivial directly to `main` |
| Commits | Conventional Commits `feat:`/`fix:`/`chore:`/`docs:`/`refactor:`/`test:`; atomic; TDD one Red→Green→Refactor per commit |
| Ignored | `node_modules/`, `.next/`, `out/`, `dist/`, `*.tsbuildinfo`, `.turbo/`, `.env`, `.env.local`, `docs/bak.env`, `**/bak.env`, `*.env.bak`, `docs/env.tgz`, `ssh-key.txt`, `start_server.sh` logs/pids, `**/.venv/__pycache__/.mypy_cache/.ruff_cache/__pycache__/*.pyc` in `skills/` |
| Hooks | No Husky/lint-staged yet (`.git/hooks` stock samples). If adding: `husky + lint-staged` `eslint --fix` + `tsc --noEmit` (<10s) |
| Secrets | Never `git add -f .env` or `ssh-key.txt`; audit incidents `262d3cc` (`docs/bak.env`), `d572d73` (`.env` with real secrets), `8aacd13` (17 cache files) — all remediated 2026-09-11 |
| Recent commits | `a21c1e4 docs: align AGENTS/CLAUDE/README`, `af5e080 feat: mirror modfii.com`, `4d1e6ad feat: header parity`, `c74dd7e fix: missing brand/hero assets + compare aliases`, `ec11541 fix: stop tracking .env` |

---

## 11. Known Issues & Outstanding Tasks

| Priority | Issue | Impact | Status |
|----------|-------|--------|--------|
| **HIGH** | `.env` with real `BETTER_AUTH_SECRET`/`CRON_SECRET` committed in `d572d73` remains in git history | Secrets retrievable via `git show d572d73:.env`; `BETTER_AUTH_SECRET=8KxGM…` / `CRON_SECRET=ec16d8…` must be considered compromised | **Mitigated in workspace** — current `.env` has fresh `ec16d809a08c91d24dbfdab7e7be4a99` for `CRON_SECRET` and prod `https://modfii.jesspete.shop`; **Open** — run `filter-repo`/BFG and rotate on deploy if history-exposed values were ever valid prod secrets |
| **MEDIUM** | In-memory `Map` rate limiter resets on restart, under-limits on multi-instance | Burst burst-locked assumption breaks past single deploy | **Accepted** — documented; migrate to Redis/Upstash before scaling |
| **MEDIUM** | `README.md` troubleshooting row says "`.env.example` still contains legacy `scandihaven_*` placeholders" — now actually `home_financing_*` | Doc stale sentence could mislead onboarding | **Open** — update that row to canonical `home_financing_*` |
| **MEDIUM** | `CLAUDE.md` references `turbo.json:globalEnv` for `DISABLE_IMAGE_OPTIMIZER` but no `turbo.json` exists | Minor contract drift | **Open** — add `turbo.json` when Turborepo is introduced, or drop the `globalEnv` claim |
| **LOW** | `skills/` is operator-managed, `tsconfig` + `eslint` already exclude it, but `**/.pytest_cache/__pycache__/.mypy_cache` under `skills/` re-added in PR can inflate repo | History shows `8aacd13` committed 17 cache files | **Mitigated** — `*.pyc`, `**/.venv`, `__pycache__`, `.mypy_cache` now ignored; PR review must reject cache files |
| **LOW** | Many route segments that call `ensureSeeded()`/`db` lack `loading.tsx`/`error.tsx` | Missing boundary degrades graceful degradation | **Open** — add incrementally per `CLAUDE.md` file → serve the material or edit a separate technical section |
| **LOW** | `CRON_SECRET` and `STRIPE_*` / `RESEND_API_KEY` not yet consumed in code (log transport only) | Env is over-specified relative to implemented features | **Open** — wire when jobs/checkout/email ships; until then they are reserved keys |
| **LOW** | `pm run dev` on `:3000` collides with sibling `scandihaven` on same dev host | Requires `E2E_PORT=3002` / `next dev --port 3002` | **Accepted** — `playwright.config.ts` defaults to `3002`; document in `AGENTS.md` |

No `CRITICAL` open issues. `lint 0/0`, `typecheck` pass, `31/31` unit, `27/27` E2E (with DB), `build 43/43`, live probes green as of `2026-09-11`.

---

## 12. Key Files Reference

| File | Lines | Purpose |
|------|-------|---------|
| `src/db/schema.ts` | ~130 | 8 `pgTable` definitions (`manufacturers.founded varchar(32)`, `uuid.defaultRandom`, `text[].array()`, indices) |
| `src/db/index.ts` | ~20 | `DATABASE_URL` throw + `Pool` singleton `__arenaNextJsPostgresqlPool` + `drizzle(pool)` |
| `src/lib/ensure-seeded.ts` | ~80 | Idempotent file→DB projection (`__modfiiSeedPromise` + `count` guard + `onConflictDoNothing` on every table) |
| `src/lib/catalog.ts` | ~180 | `Manufacturer/StateGuide/Article/GlossaryTerm` interfaces + `priceFloor`/`categorize` + `authors`/`authorSlug` + `SITE`; typed re-export of `src/data/*.json` |
| `src/lib/lenders.ts` | ~120 | `LENDER_SEEDS` 8 + `LOAN_PRODUCT_SEEDS` 5 (canonical seeds, nmlsId included) |
| `src/lib/calculator.ts` | ~90 | `PMI_ANNUAL_RATE=0.0065`, `amortize`, `calculatePayment` (PITI+PMI+1.15×), `DEFAULT_CALCULATOR` |
| `src/lib/matching.ts` | ~130 | `matchLenders` scoring (+20/+18/+12, 5.4% floor, cap 99) + `validateApplication` (EMAIL_RE, ZIP `^\d{5}$`, phone ≥10) |
| `src/lib/rate-limit.ts` | ~25 | `Map` buckets `rateLimit(limit, windowMs)` + `clientKey(x-forwarded-for → x-real-ip → local)` |
| `src/app/layout.tsx` | ~50 | Root layout: `DM_Sans`+`Outfit` `variable/display:swap`, `metadataBase` (`NEXT_PUBLIC_SITE_URL`), `SiteHeader`/`SiteFooter`, `SITE.description` |
| `src/app/globals.css` | ~100 | `@import "tailwindcss"` + `@theme` (all tokens) + `@layer base/utilities` (grain, hero-grid, reduced-motion) |
| `src/app/page.tsx` | ~500 | `/` editorial homepage (hero, wordmarks, intro cards 4, problem/fix, green band, steps 3, testimonials, FAQ, closing CTA) |
| `src/app/sitemap.ts` | ~70 | `STATIC_PATHS 40` + `articles→/learn/[slug]` + `states` + `manufacturers` → 152 locs |
| `src/components/ui.tsx` | ~80 | `cn`, `Button/ButtonLink` (6 variants, 3 sizes), `Container (1400px)`, `Badge` |
| `src/components/site-header.tsx` | ~150 | `"use client"` fixed `h-16`, transparent over dark hero, `NAV+MORE`, `useId`, adjust-during-render pathname close |
| `src/components/page-shell.tsx` | ~230 | `Breadcrumbs` + `PageHero` (centered, forest overlay, star pill, highlight, glass chips) + `GuideView` |
| `src/data/{articles,manufacturers,states,glossary}.json` | 553/912/1069/237 | Source corpora (23/40/50/59) — edit here, not PG |
| `src/scripts/local-db.ts` | ~40 | `isLocalDatabaseUrl` / `assertLocalDatabase` host guard (localhost/127.0.0.1/::1) |
| `src/scripts/{migrate,seed,reset}.ts` | ~20 each | Local-guarded lifecycle scripts (migrator, `ensureSeeded` wrapper, `DROP SCHEMA` + extensions) |
| `drizzle/0000_amusing_thena.sql` | ~200 | 8 tables baseline |
| `drizzle/0001_sharp_stick.sql` | 1 | `alter manufacturers.founded 8→32` |
| `drizzle/meta/_journal.json` | ~15 | Migration journal `idx 0,1` |
| `drizzle.config.ts` / `.json` | ~15 each | TS primary + JSON fallback (`5434`, `strict/verbose`) — keep in sync |
| `next.config.ts` | ~25 | `images.unoptimized:true` + `redirects()` 11 entries |
| `docker-compose.yml` | ~45 | PG 17 `5434`, init `00-create-extensions.sql`, volume `home_financing_data`, healthcheck |
| `vitest.config.ts` | ~15 | Node env, alias `@→./src`, `include src/**/*.test.ts` |
| `playwright.config.ts` | ~40 | Prod `next start` 3002, `reuseExistingServer:true`, chromium+webkit |
| `e2e/{smoke,seo,funnel,assets}.spec.ts` | 63/77/94/74 | 27 E2E tests (smoke 7, seo 6, funnel 4, assets 9 looped) incl. alias/image regression guards |
| `src/lib/*.test.ts` | 81/110/57 | 31 Vitest unit tests co-located on pure domains |
| `public/images/*.jpg` + `brand/*` | 6+3 assets | Hero/site imagery + `modfii-logo-icon.svg` + `og-image.jpg` |
| `tsconfig.json` | ~35 | `strict`, `skipLibCheck`, `isolatedModules`, `@/*→./src/*`, `exclude: [node_modules,skills]`, `incremental` |
| `eslint.config.mjs` | ~10 | Flat config + `core-web-vitals` + `globalIgnores(.next,out,build,next-env,skills,infrastructure)` |
| `AGENTS.md` / `CLAUDE.md` / `README.md` | ~100 / ~600 / ~400 | Companion docs — this PAD is the definitive aggregate |
| `.env.example` / `.env` | ~40 | Template + local runtime (never commit `.env`) |
| `.gitignore` | ~45 | Node, build, env, `bak.env/env.tgz`, `ssh-key.txt`, `skills` caches |
| `infrastructure/postgres/init/00-create-extensions.sql` | ~20 | `pgcrypto + pg_trgm` + `DO RAISE NOTICE` |
| `Project_Architecture_Document.md` | — | This file |

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **ADU** | Accessory Dwelling Unit — backyard cottage, in-law suite, or detached dwelling financed via HELOCs, renovation loans, or construction-to-perm (see `Summit ADU Capital` specialty `adu`). |
| **ensureSeeded** | Idempotent function `src/lib/ensure-seeded.ts` that projects `src/data/*.json` + `LENDER_SEEDS` into PG. Global promise `__modfiiSeedPromise` + `count(lenders)>0` + `onConflictDoNothing` make it safe to call from anywhere server-side. |
| **force-dynamic** | Next.js `export const dynamic = "force-dynamic"` — opts a route out of static prerender into per-request SSR. Used only where DB is touched (`/api/health`, `/api/applications`, `/api/calculator`). |
| **LENDER_SEEDS / LOAN_PRODUCT_SEEDS** | Canonical seed arrays `src/lib/lenders.ts` (8 lenders, 5 products) — the only write path into `lenders` + `loanProducts`. Includes `nmlsId`, `minCredit`, `greenMortgage`, `rateDiscountBps`. |
| **Manufactured vs. Modular vs. Prefab** | HUD-code manufactured home (steel chassis) vs. IRC-code modular (same code as site-built, real-property titled) vs. umbrella `prefab`. Distinction drives the misclassification fix `matchLenders` (modular specialty) and `loan-options/fha` copy. |
| **CrossMod** | Fannie Mae label for factory-built homes that meet site-built appearance/foundation standards and qualify for conventional financing (see `CrossMod Conventional` lender + `compare/modular-vs-manufactured-financing`). |
| **PageHero** | Shared interior hero `src/components/page-shell.tsx` — centered, `bg-forest` + photo `Image fill opacity-35` + `from-forest/80…to-forest/90` + `radial-gradient` + star eyebrow pill + amber `highlight` title line + CTA pair + glass stat chips. Interior heroes must flow through it. |
| **Pool singleton** | `globalThis.__arenaNextJsPostgresqlPool` in `src/db/index.ts` — prevents HMR pool leaks. Never `new Pool()` inline; import `{ db, pool }` only from `@/db`. |
| **PITI + PMI** | Payment breakdown: Principal+Interest + Taxes + Insurance + Hoa + PMI (`0.65%` annual when down <20%). `site-built 1.15×` is the editorial comparison price (`siteBuiltComparePrice = round(homePrice * 1.15)`). |
| **metadataBase** | `new URL(process.env.NEXT_PUBLIC_SITE_URL)` in `src/app/layout.tsx:metadata` — must be canonical prod origin or `sitemap.xml` + OG emit wrong host. Deploy is `https://modfii.jesspete.shop/`. |
| **FHA / VA / USDA / CrossMod** | Government-backed or agency loan products `src/lib/lenders.ts:LOAN_PRODUCT_SEEDS` (`fha 3.5%`, `va 0%`, `usda 0%`, `construction-to-permanent 3.5–20%`, `conventional 3–20%`). |
| **ADR** | Architecture Decision Record — Context → Decision → Rationale → Consequences → Alternatives Rejected (see §1.3). |
| **PAD** | Project Architecture Document — this file, the definitive production-locked blueprint. |
| **PRD** | Product Requirements Document — not present in this repo; `CLAUDE.md` is the closest spec substitute. |
| **E2E_PORT** | Env var for Playwright `webServer` port — defaults to `3002` (because `:3000` is occupied by `scandihaven` on this dev host). Use `E2E_BASE_URL` to point at an external server in CI. |

---

*Last verified 2026-09-11 (post-remediation + DB init + PAD) against `package.json` (next ^16.3.4, react ^19.3.0, tailwind ^4.3.3, vitest ^3.2, playwright 1.63), `tsconfig.json` + `eslint.config.mjs` (skills+infrastructure ignored), `next.config.ts` (11 redirects), `drizzle.config.ts/.json` (5434, strict/verbose), `docker-compose.yml` (home_financing_*), `src/db/schema.ts` (8 tables), `src/lib/*` (+ 31 tests), `public/images/*` + `public/brand/*` (every referenced asset exists), `playwright.config.ts` (3002), `e2e/*` 27 tests (27/27 with DB), `vitest` 31/31, `next build` 43/43, live `curl /api/health` → `ok:true` + `applications` funnel `4 matches` + `rate-limit 429` + `sitemap 152`, `docker exec psql count(*)` `8/40/50/23/59/5` plus live `applications 2 / application_matches 8`. Source of truth: `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `drizzle.config.ts/.json`, `docker-compose.yml:5434`, `src/db`, `src/lib`, `src/scripts`, `e2e`, `vitest.config.ts`, `.env.example`, live DB probes.*
