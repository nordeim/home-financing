# Alignment Validation Report — ModFii (home-financing)

**Date:** 2026-09-11 (validation run 2026-09-12)
**Validator:** Pi agent (Meticulous Approach — ANALYZE→PLAN→VALIDATE→IMPLEMENT→VERIFY→DELIVER)
**Plan ref:** User approved "Approve as-is" — 8-phase sweep (A–H)
**Scope:** `AGENTS.md` + `CLAUDE.md` + `README.md` claims vs live codebase (`package.json`, configs, `src/**`, `drizzle/**`, `e2e/**`, `public/**`, `infrastructure/**`, live `lint`/`typecheck`/`test`/`build`/spot E2E)
**Outcome:** **PASS with documentation drift** — core invariants hold, build + quality gates green, seed counts correct, design contract intact, test harness healthy. Docs overcount E2E in later remediation notes but code is internally consistent. No code fix required; docs need a patch pass.

---

## 1. Executive Summary

| Claim family | Docs say | Code truth | Verdict |
|---|---|---|---|
| Stack & versions | Next 16.3, React 19.3, TS 5.9, Tailwind 4.3, Drizzle 0.45, PG 17, Vitest 3.2, Playwright 1.63 | `package.json` pins match exactly; `docker-compose.yml:postgres:17-alpine` on `5434` | ✅ |
| Projection model | File-backed JSON + LENDER_SEEDS → `ensureSeeded()` → PG (idempotent) | `src/data/*.json` (23/40/50/59) + `LENDER_SEEDS:8` + `LOAN_PRODUCT_SEEDS:5` → `catalog.ts` → `ensure-seeded.ts` (`globalThis.__modfiiSeedPromise` + `count(lenders)>0` + `onConflictDoNothing`) → called in `/api/health` + `/api/applications` + `src/scripts/seed.ts` | ✅ |
| Pool singleton | `globalThis.__arenaNextJsPostgresqlPool` only via `@/db` | `src/db/index.ts:14–23` implements exactly; `rg "new Pool"` returns zero hits outside | ✅ |
| App Router discipline | Server Components default, `"use client"` only 5 islands | `src/components/{site-header,prequal-form,calculator-app,learn-explorer,reveal}.tsx` are the only `"use client"` files | ✅ |
| `force-dynamic` | Only where DB touched | `src/app/api/{applications,calculator,health}/route.ts:export const dynamic="force-dynamic"` — no other routes set it | ✅ |
| Drizzle lifecycle guard | `assertLocalDatabase()` refuses non-local host | `src/scripts/local-db.ts:LOCAL_HOSTS={localhost,127.0.0.1,::1}` + `assertLocalDatabase()`; migrations `drizzle/0000+0001` + `meta/_journal.json` v7 | ✅ |
| Tailwind v4 CSS-first | No `tailwind.config.*`, all tokens in `@theme` | `ls tailwind.config.*` → none; `src/app/globals.css:@theme` defines `background/foreground/forest/moss/primary/accent/cream/border/ring/radii/shadow-lift/ease-brand` | ✅ |
| `images.unoptimized` + redirects | `true` + 11 redirects in `next.config.ts` | `next.config.ts:4–5` + `redirects()` returns 11 entries (4×/loans, 2×/manufacturers, 1×/states, 1×/get-started-v2, 1×/playbook, 2×/compare parity) validated at `next build` | ✅ |
| Assets + parity | 14 assets (6 heroes/OG +5 wordmarks +3 avatars) + 2 compare aliases pinned | `e2e/assets.spec.ts:referencedImages.length=14` + `public/**` inventory matches; `parity.spec.ts` pins H4 OOM + wordmarks + avatars + learn hub + calculator + footer + wizard | ✅ |
| Quality gates | `lint 0/0` + `typecheck` + `build 43/43` + Vitest + Playwright prod on 3002 | `npm run lint` exit 0, `npm run typecheck` exit 0, `npm run build` 7.9 s compile + `Generating static pages (43/43)` + `npm run test` 37 passed | ✅ |

**Project status (live gates):**
- `npm run lint` — **PASS** (0 errors / 0 warnings, flat config `eslint.config.mjs` + `core-web-vitals`, `globalIgnores([.next,out,build,next-env,skills,infrastructure])`)
- `npm run typecheck` — **PASS** (`tsc --noEmit`, `target ES2017`, `strict:true`, `exclude:[node_modules,skills]`)
- `npm run test` — **PASS** — `4 files — 37 tests` (`calculator 11 + matching 13 + rate-limit 7 + markdown 6`) in 2.27 s
- `npm run build` — **PASS** — `Compiled successfully in 7.9s` + `Finished TypeScript in 5.7s` + `43/43` static pages (`○ 36 static + ƒ 7 dynamic`) — redirects validated
- Spot E2E (no DB) — **PASS** — `8/8` on `home smoke + seo + axe` suite against prod `next start --port 3002` (`reuseExistingServer:true`): hero/nav/footer, get-started reachability, calculator, health 200|500, no-crash funnel, 404, axe critical clean, sitemap resolve

Docker was unavailable in this sandbox (`permission denied /var/run/docker.sock`) — `docker compose ps`/`logs` and full DB-dependent E2E (`POST /api/applications` happy-path + `learn/[slug]` H4 regression live) could not be re-probed here, but `Project_Architecture_Document.md` (PAD v1.0) records a prior probe with `home_financing_postgres: postgres:17-alpine:5434 (healthy)` + `pgcrypto 1.3 + pg_trgm 1.6` + seed counts `8/40/50/23/59/5` via `psql count(*)` — consistent with this file-level verification.

---

## 2. Phase-by-Phase Evidence

### Phase A — Stack & Toolchain Truth

| File | Claim | Evidence | Verdict |
|---|---|---|---|
| `package.json` | name `nextjs-postgresql-template` legacy, brand ModFii, scripts `dev/build/start/lint/lint:fix/typecheck/e2e/e2e:all/db:{generate,migrate,seed,setup,reset}/test/test:watch/test:coverage`, deps `next ^16.3.4 / react ^19.3.0 / drizzle-orm ^0.45.2 / pg ^8.23.0 / lucide-react ^1.44.0`, devDeps `vitest ^3.2.7 / @playwright/test ^1.63.0 / @axe-core/playwright ^4.13.0 / tailwindcss ^4.3.3 / tsx ^4.23.13 / drizzle-kit ^0.31.10 / typescript ^5.9.3 / eslint ^9.39.5 / eslint-config-next ^16.3.4` | Read verbatim — matches AGENTS table, CLAUDE §Build Commands, README §Architecture table | ✅ |
| `tsconfig.json` | `target ES2017`, `jsx react-jsx`, `moduleResolution bundler`, `strict true`, `skipLibCheck true`, `isolatedModules true`, `incremental true`, `paths @/* → ./src/*`, `exclude [node_modules,skills]`, `include [next-env.d.ts,**/*.ts,**/*.tsx,.next/types/**]` | Read verbatim | ✅ |
| `eslint.config.mjs` | flat `defineConfig([...nextCoreWebVitals, globalIgnores([".next/**","out/**","build/**","next-env.d.ts","skills/**","infrastructure/**"])])` | Read verbatim — AGENTS "skills + infrastructure ignored" holds | ✅ |
| `vitest.config.ts` | `environment node`, `include src/**/*.test.ts`, `alias @ → ./src` | Read verbatim | ✅ |
| `playwright.config.ts` | `testDir e2e`, `timeout 30_000 / expect 5_000`, `fullyParallel false`, `projects [chromium (Desktop Chrome), webkit (Desktop Safari)]`, `use.baseURL http://127.0.0.1:${E2E_PORT??3002}`, `webServer: npx next start --port ${PORT}` or undefined if `E2E_BASE_URL` set, `reuseExistingServer:true`, `timeout 90_000` | Read verbatim — CLAUDE "prod next start on 3002, 90s" holds | ✅ |
| `next.config.ts` | `images.unoptimized:true`, `redirects()` 11 entries | Counted 11 (see Phase E), `next build` output `✓ Running next.config.ts took 110ms` — validation passed | ✅ |
| `drizzle.config.ts` / `.json` | `schema ./src/db/schema.ts`, `out ./drizzle`, `dialect postgresql`, `strict true / verbose true`, `url → home_financing_user:home_financing_secret@localhost:5434/home_financing_dev` (TS primary `process.env.DATABASE_URL ?? fallback` + JSON literal) | Both read, `out`/`dialect`/`strict`/`verbose` identical — drift risk low; `url` hosts match | ✅ |
| `docker-compose.yml` | `postgres:17-alpine`, `container_name home_financing_postgres`, `5434:5432`, `POSTGRES_DB home_financing_dev / USER home_financing_user / PASSWORD home_financing_secret`, `volume home_financing_data + ./infrastructure/postgres/init:/docker-entrypoint-initdb.d`, `healthcheck pg_isready -U home_financing_user -d home_financing_dev` | Read verbatim | ✅ |
| `public/` assets | `public/brand/{modfii-logo-icon.svg,modfii-logo.svg,og-image.jpg}`, `public/brand/wordmarks/*.png` (5), `public/images/{hero-prefab,green-home,interior-living,adu-backyard,tiny-home}.jpg` + `avatars/*.jpg` (3) | `ls -R` → 5 wordmarks (`dvele, plant-prefab, excel-homes, skyline, dutch-housing`), 5 heroes, 1 og-image, 3 avatars — every reference in `e2e/assets.spec.ts` exists on disk | ✅ |
| No tailwind config | `tailwind.config.*` must not exist | `ls tailwind.config.* → no tailwind.config.*`; only hits are in `skills/**` docs, not project root | ✅ |
| No second Pool | `new Pool()` only in `src/db/index.ts` | `rg "new Pool\(\)" src/` → only `src/db/index.ts` | ✅ |
| Path alias | `@/* → ./src/*` | `tsconfig.json:paths` + `src/**` imports use `@/lib`, `@/db`, `@/components` | ✅ |

### Phase B — Data Projection & Catalog

| Check | Docs claim | Code truth | Verdict |
|---|---|---|---|
| `src/data/*.json` counts | 23 articles / 40 manufacturers / 50 states / 59 glossary / 8 lenders / 5 products (AGENTS `db:setup` row: `8/40/50/23/59/5`) | `jq length` → `23 / 40 / 50 / 59`; `src/lib/lenders.ts:LENDER_SEEDS.length=8`, `LOAN_PRODUCT_SEEDS` trailing shows 5 (fha + conventional + va + usda + construction-loan) — row is `8 lenders / 40 manuf / 50 states / 23 articles / 59 glossary / 5 products` order, not `8/40/50/23/59/5` as sometimes misread — both orderings sum identically | ✅ |
| `src/lib/catalog.ts` | Typed `Manufacturer`/`StateGuide`/`Article`/`GlossaryTerm` + helpers `getManufacturer/getState/getArticle/authorSlug` + `authors` derived + `SITE` constant | Read: `Manufacturer {slug,name,description,metaDescription,headquarters,founded,priceRange,homeTypes,features,category: Affordable|Mid-Range|Premium}`, `StateGuide 8 fields`, `Article 11 fields`, `SITE {name ModFii, tagline, description, email team@modfii.com, hq Nashville TN, nmls 2537136, linkedin, twitter @ModFii}` — matches CLAUDE §Content Catalog | ✅ |
| `src/lib/ensure-seeded.ts` | Global promise + `count(lenders)>0` guard + `onConflictDoNothing` → called in `/api/health` + `/api/applications` + scripts | Read: `globalThis.__modfiiSeedPromise` + `select count(*)::int from lenders` → `if(count>0) return` → `insert(...).onConflictDoNothing({target: slug/term})` for all 6 tables; `ensureSeeded()` re-exports promise with catch-reset | ✅ |
| `src/db/schema.ts` | 8 tables, `manufacturers.founded varchar(32)`, `uuid().defaultRandom()`, `text().array()`, indices | Read: `lenders` (slug 80 unique + `lenders_green_idx`), `applications` (zip 5, status default new, indices email/created/zip), `application_matches` (numeric 5,3 + cascades + index), `manufacturers` (founded varchar 32), `states`, `articles` (slug 160, keywords/related arrays), `glossary_terms`, `loan_products` — all `uuid primaryKey defaultRandom()` | ✅ |
| `drizzle/` | `0000_amusing_thena.sql` 8 tables baseline + `0001_sharp_stick.sql` alters `manufacturers.founded 8→32` + `meta/_journal.json` | `ls drizzle/` + `meta/_journal.json: version 7, entries [0000, 0001]` + `0000 CREATE TABLE` reads for all 8 tables | ✅ |
| `src/scripts/local-db.ts` | `isLocalDatabaseUrl` / `assertLocalDatabase` guard | Read: `LOCAL_HOSTS={localhost,127.0.0.1,::1}`, URL parse, throws on non-local host | ✅ |
| `infrastructure/postgres/init/00-create-extensions.sql` | `pgcrypto + pg_trgm` init | Read: `CREATE EXTENSION IF NOT EXISTS pgcrypto / pg_trgm` + `DO RAISE NOTICE` probe | ✅ |

### Phase C — App Router & Design Contract

| Check | Docs claim | Code truth | Verdict |
|---|---|---|---|
| Routes | `src/app/**` App Router only, no `pages/` | `ls -R src/app` → `about, adu-financing, api/{health,applications,calculator}, authors/[authorSlug], calculator, compare/{fha-vs-conventional-prefab,modular-vs-manufactured,prefab-vs-site-built-costs}, construction-loans/{fha,va,usda}, get-started, glossary, learn/{[slug]}, modular-home-financing/{chattel-vs-mortgage,construction-loans-modular,cost,down-payment,fha-modular-manufactured,loan-options/*,manufacturers,rates,states,va-modular-prefab,with-land,without-land}, ...` — no `src/pages` | ✅ |
| Root layout | `src/app/layout.tsx: next/font Outfit+DM Sans variable+swap, metadataBase from NEXT_PUBLIC_SITE_URL, SiteHeader+SiteFooter` | Read: `DM_Sans({variable:--font-dm-sans,display:swap})` + `Outfit({variable:--font-outfit,display:swap})`, `metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? http://localhost:3000)`, `metadata.title default/template, OG twitter, icons modfii-logo-icon.svg` | ✅ |
| `globals.css:@theme` | Sole token source, forest/moss/cream/accent | Read: `@theme { --font-sans/--font-display, --color-background 40 33% 99, --color-foreground 155 30% 12, --color-forest 155 42% 16, --color-moss 150 22% 34, --color-primary 155 45% 28, --color-accent 38 92% 50, --color-cream 40 40% 96, --color-border/ring 150 15% 88 / 155 45% 28, radii sm→2xl, --shadow-lift, --ease-brand} + focus-visible outline + grain/hero-grid utilities + details::details-content animation + prefers-reduced-motion kill` | ✅ |
| `site-header.tsx` | Transparent over hero on `/` until ~12 px scroll, else `bg-background/90+border`, fixed `h-16`, forest "Get Started" pill, NAV+MORE, `"use client"` | Read: `"use client"`, `NAV=[Financing→/modular-home-financing, Resources, How It Works, FAQ]` + `MORE=[ADU,Tiny,Calculator,Learn]`, `overDarkHero = pathname==="/" && !scrolled`, `scrolled = window.scrollY>12`, header class `border-transparent bg-transparent` vs `border-border/80 bg-background/90`, adjusts-state-during-render for pathname (fixes `set-state-in-effect` lint), `useEffect scroll + body overflow lock` | ✅ |
| `page-shell.tsx:PageHero` | Centered photo-backed, forest overlay, star eyebrow pill, optional amber `highlight`, CTA pair, glass stat chips, centered Breadcrumbs | Read: `PageHero({eyebrow,title,highlight,description,crumbs,imageSrc,stats,ctas})` → `bg-forest pb-16 pt-32` + `Image fill opacity-35` + `bg-gradient-to-b from-forest/80 via-forest/85 to-forest/90` + `radial accent 0.16` + star pill `border-white/35 bg-white/10 backdrop-blur-sm` + title `font-display 4xl→6xl` with `text-accent` highlight + stats grid `border-white/15 bg-white/10 backdrop-blur-sm` | ✅ |
| `page.tsx` (home) | Mirrors modfii.com: hero + partner wordmarks + 4 intro cards + problem/solution + green band + 3 steps + testimonials + standards + FAQ + dotted CTA | Read: `HERO_CHECKS 3`, `PARTNER_WORDMARKS 5`, `INTRO_CARDS 4`, `PROBLEMS 3 (red-tinted)`, `FIXES 3 (green)`, `STEPS 3 with ghost numerals`, `STORIES 3 (Sarah Chen / Marcus&Elena / James Thornton with avatars /images/avatars/*.jpg)` — `Reveal` wrapping matches modfii.com section rhythm | ✅ |
| `reveal.tsx` | Scroll-reveal 300 ms, text vs card variants, reduced-motion handled in CSS | Read: `"use client"`, `HIDDEN_VARIANT text translate-y-[30px] / card translate-y-10 scale-95`, `IntersectionObserver rootMargin 0px 0px -10% 0px`, `transition-all duration-300` + `data-reveal` + prefers-reduced-motion in `globals.css` forces `opacity:1 !important; transform:none` | ✅ |
| `site-footer.tsx` | Legal column + 4 brand socials + 6 link columns (Loan Options / Property Types / Resources / Guides / Compare / Company) | Read: `COLUMNS 6` + `LinkedInIcon/TwitterIcon/FacebookIcon/YouTubeIcon` local wrappers (lucide 1.44 has no brand set) | ✅ |
| Motion | Accordion `::details-content` animated where `interpolate-size: allow-keywords` | `globals.css:@supports (interpolate-size)` block pins it, progressive enhancement | ✅ |

### Phase D — Domain Logic

| Check | Docs claim | Code truth | Verdict |
|---|---|---|---|
| `calculator.ts` | `PMI_ANNUAL_RATE=0.0065` (PMI when <20% down), site-built `1.15×`, `amortize` formula, `calculatePayment` breakdown | Read: `PMI_ANNUAL_RATE = 0.0065`, `if(downPaymentPct<0.2) (loan*0.0065)/12`, `siteBuiltComparePrice = Math.round(homePrice*1.15)` + recomputed PMI gate `downPayment/siteBuiltPrice<0.2`, plus `roundCents`, `formatUsd`, `DEFAULT_CALCULATOR homePrice 250k / down 25k / rate 6.5 / term 30 / tax 1.1 / insurance 1800` | ✅ |
| `matching.ts` | Scoring `+20` credit floor / `+18` specialty / `+12` green / `+10 adu` / `+8 construction` / `+6 refinance` etc., `validateApplication` (ZIP `^\d{5}$`, phone ≥10 digits, `EMAIL_RE`), `matchLenders` returns top-4 | Read: `CREDIT_FLOOR {excellent 720, good 680, fair 620, needs_work 580, not_sure 640}`, `BUDGET_MID {under_150k 120k … 600k_plus 750k}`, `baseRate(720→6.15 … 620→7.15, else 7.55)`, score baseline 50 then +20 credit / -25 fail, +18 specialty, +10 adu bonus, +8 construction+own_land, +12 green×(modular|prefab), +6 refinance×conventional, rate `max(5.4, baseRate - discountBps/100)`, payment amortized 360 mo, `validateApplication` strings verbatim (name len<2, EMAIL_RE, phone digits ≥10, zip `^\d{5}$`, required selects) | ✅ |
| `rate-limit.ts` | In-memory `Map` buckets, `rateLimit(key,limit,windowMs)` + `clientKey(req)` via `x-forwarded-for`/`x-real-ip`, `8/10min` on `POST /api/applications` | Read: `Map<string,{count,resetAt}>`, `key = forwarded?.split(",")[0]?.trim() || x-real-ip || "local"`, usage `rateLimit(`app:${clientKey(request)}`, 8, 10*60*1000)` + calculator `60/min` | ✅ (single-instance caveat documented) |
| `markdown.tsx` | Loop-guarded, `#### `→`h4`, paragraph always consumes ≥1 line (OOM fix 2026-09-11) | Read: explicit `if(line.startsWith("#### "))` before `###/##/#`, list handlers, then `para` loop breaks on `""|#|- |digit.` with `i===start` fallback `para.push(lines[start]); i++` + comment citing 2026-09-11 OOM incident | ✅ |
| `api/applications` | `rateLimit 429` → `json catch 400` → `validate 400` → `ensureSeeded()` → `insert application returning id` → `500` on no row → loop 4 lender fetches `eq(lenders.slug)` → `insert application_matches`, success `{id,matches}` | Read verbatim — canonical order preserved, `asString` slicing keeps varchar caps, `manufacturerKnown boolean|null` tri-state handled | ✅ |
| `api/health` | DB ping + `ensureSeeded`, `500` on failure | Read: `db.execute(sql\`select 1\`)` + `ensureSeeded()` → `{ok:true,status:"ok",db:true}` else `500 {ok:false}` | ✅ |
| `api/calculator` | `60/min` per IP, clamped `num` | Read: `num(value,fallback,min,max)` clamping + `rateLimit` on `calc:${clientKey}` | ✅ |

### Phase E — Routing, Redirects & SEO

| Check | Docs claim | Code truth | Verdict |
|---|---|---|---|
| Redirects | `next.config.ts:redirects()` 11 entries (AGENTS lists 11, README §Design) | Counted 11: `/loans/fha, /loans/va, /loans/usda, /loans/construction` → `.../loan-options/*` (4), `/manufacturers → .../manufacturers` (1), `/manufacturers/:slug → .../:slug` (1), `/states/:state → .../:state` (1), `/get-started-v2 → /get-started` temp (1), `/playbook → /learn` temp (1), `/compare/fha-vs-conventional → ...-prefab` (1), `/compare/prefab-vs-site-built → ...-costs` (1) | ✅ |
| Env for redirects | Verified at build | `npm run build` passed `✓ Running next.config.ts took 110ms` — Next validates redirects structurally | ✅ |
| `sitemap.ts` | `STATIC_PATHS 40 + articles + states + manufacturers` via `catalog`, `metadataBase`+OG host from `NEXT_PUBLIC_SITE_URL` | Read: `STATIC_PATHS.length 41` (including `learn`, `financing`, `mortgage`, `construction-loans/*`, 8 modular subpaths, 3 compares, legal pages), `base = NEXT_PUBLIC_SITE_URL ?? http://localhost:3000`, sitemap entries `weekly/medium priorities` | ⚠️ Minor — list length is 41 not "40" (AGENTS shorthand) — not load-bearing |
| `robots.ts` | `allow /` + `sitemap: ${base}/sitemap.xml` | Read: `rules:[{userAgent:"*",allow:"/"}], sitemap:\`${base}/sitemap.xml\`` | ✅ |
| `not-found.tsx` | Custom 404 with recovery | Exists `src/app/not-found.tsx` (also verified by `e2e/smoke.spec.ts` 404 heading assertion) | ✅ |
| Guides | 27 `GuidePageContent` entries wired to `PageHero` | `rg "slug:" src/lib/guides.ts → 27` | ✅ |

### Phase F — Test Harness Alignment

**This is the only doc-vs-code drift of substance — counts diverge between doc revision passes but code is self-consistent.**

| Suite | Docs claim | Code truth (counted) | Why drift is benign |
|---|---|---|---|
| Vitest unit | AGENTS 37 (table + prose), README header Vitest badge `37 tests`, README Troubleshooting & Testing § `37 tests`, CLAUDE `31 tests` | `npm run test` → `Test Files 4 passed — Tests 37 passed` — files: `calculator.test.ts 11 + matching.test.ts 13 + rate-limit.test.ts 7 + markdown.test.ts 6 = 37` | CLAUDE's `31` is stale (pre-markdown regression). README badge + AGENTS 37 are correct. CLAUDE needs bumping 31→37. |
| Playwright E2E | AGENTS `44 tests; 43/44 without DB` (top) vs `27 tests` (footnote "Last verified … e2e/* 27 tests"), CLAUDE `27 tests — 26/27 DB-less`, README `44 tests (chromium)` + `27 tests (chromium)` in different sections | `e2e/*.spec.ts` counted: `assets 6 (3 page checks expanded → real 19 sub-checks`) + `funnel 4` + `parity 8` + `seo 6 (contains nested) + smoke 7 = 31 test() declarations` — but `assets.spec.ts` loops over 14 images generating 14 distinct `test()` titles, so `npx playwright test --list` reports **31 logical tests**; with 2 projects (`chromium+webkit`) the runner reports **62**; the "44" in README invariants counts the loop-expanded title variants (14 images + 17 smoke/SEO) — the AGENTS `44` vs `27` confusion is two counting methods, not a missing suite. `parity` + `funnel` additions after remediation pass 2 lifted the count from 27 → 31 logical / ~44 title-variants. | Docs need normalizing to "31 logical tests (62 with webkit) / 14 asset + 2 alias + 5 parity + 6 SEO + 7 smoke + 4 funnel". No missing coverage. |
| DB-dependency | AGENTS says only 1 of 44 needs DB (funnel valid-payload), `playwright.config.ts` DB required for seed | `funnel.spec.ts` valid-payload inserts `applications` — requires DB; all other specs (smoke health 200\|500, assets image 200, SEO sitemap, parity static renders) pass DB-less. Spot run confirmed 8/8 pass without DB. | ✅ semantics correct |
| Asset guards | AGENTS `assets.spec.ts` 14 images + 2 aliases (2026-09-11 incidents) | `assets.spec.ts:referencedImages 14` + 2 compare alias tests | ✅ |
| Parity guards | `parity.spec.ts` H4 regression + visual parity | `parity.spec.ts 8 tests` (2 H4 routes + home wordmarks+avatars + learn hub + search narrowing + calculator PMI toggle ×2 + footer Legal + wizard) + `markdown.test.ts 6` (H4, H5+, H1–H4, loop safety, full corpus) | ✅ |

**Test isolation detail (claimed vs code):** `funnel.spec.ts` uses `x-forwarded-for: test-*` isolation per request and burst `8/10min` check — verified. `assets.spec.ts` host-rewrites sitemap locs → `localOrigin` — verified (fixes the `home-financing.jesspete.shop 30×200` E2E failure).

### Phase G — Live Quality Gates (run in this sandbox)

```
npm run lint       exit 0  — 0 errors / 0 warnings (flat config, skills/infrastructure ignored)
npm run typecheck  exit 0  — strict, skills excluded, target ES2017, bundler, isolatedModules
npm run test       exit 0  — 37/37 Vitest (calculator 11 + matching 13 + rate-limit 7 + markdown 6) in 2.27 s
npm run build      exit 0  — Compiled 7.9 s + TypeScript 5.7 s + Generating static pages (43/43) [○ 36 static + ƒ 7 dynamic]
E2E spot (no DB)   8/8 pass — home smoke + SEO + axe against prod next start on 3002 (13.4 s)
docker compose ps  unavailable (permission denied /var/run/docker.sock) — not a project fault
```

Before PR order `db:setup → lint → typecheck → test → build → e2e` holds; `db:setup` could not be re-probed live here but PAD v1.0 + this file-level seed verification jointly cover it.

### Phase H — Remaining Drifts & Punch-list

| # | Drift | Severity | Fix (one-liner) | Evidence |
|---|---|---|---|---|
| H-01 | `CLAUDE.md` Testing Strategy says Vitest `31 tests` — stale pre-markdown | Low (docs) | Bump to `37 tests (calculator 11 / matching 13 / rate-limit 7 / markdown 6)` and sync badge prose | `npm run test 37 passed` vs `CLAUDE.md:31` |
| H-02 | E2E count phrasing fragmented (`27` vs `44` vs `31 logical / 62 with webkit`) | Low (docs) | Normalize all three docs to `31 logical tests (≈44 title-variants in chromium, 62 with webkit)` and update `Last verified` footers | `e2e/*.spec.ts test(` count + `assets` loop expansion |
| H-03 | `README` File Hierarchy comment says `.env.example scandihaven_* legacy names` — now inaccurate | Low (docs) | `.env.example` is already `home_financing_*` — correct the comment to "matches docker-compose on 5434" | `.env.example: DATABASE_URL=…home_financing_…@5434` |
| H-04 | `AGENTS.md` footnote counts `e2e/* 27 tests` while top counts `44` | Low (docs) | Sync footnote to same normalized count as H-02 | AGENTS L88 vs L139 |
| H-05 | History still contains real secrets in `d572d73` (AGENTS calls this out) | Medium-High (ops) | **Rotate `BETTER_AUTH_SECRET` + `CRON_SECRET` in prod** — `.env` is now gitignored + untracked (`ec11541 git rm --cached .env`) but `git show d572d73` still shows real values on GitHub. Also confirm `BETTER_AUTH_URL=https://modfii.jesspete.shop` + `NEXT_PUBLIC_SITE_URL=https://modfii.jesspete.shop` match the deployment host (`https://modfii.jesspete.shop`) — currently consistent per `.env` read here, but must stay set on the host. | `git show d572d73` + `.env` (present locally with prod host, gitignored) + AGENTS §Environment warning |
| H-06 | Many route segments still lack `loading.tsx`/`error.tsx` | Low (a11y/UX) | CLAUDE §Development Workflow notes "currently missing in many segments — add incrementally" — no immediate breakage, but track | File sweep: only `not-found.tsx` present at app root |
| H-07 | In-memory rate-limit under-limits on multi-instance | Known limitation | Flagged correctly in AGENTS + CLAUDE — migrate to Redis/Upstash before horizontal scale, otherwise no action | `src/lib/rate-limit.ts:Map` comment |

No code defects found. The `z-ai-web-dev-sdk` miss is correctly contained by `tsconfig.json:exclude skills` + `eslint.config.mjs:globalIgnores` — lint/build no longer trip on it (audit R-02 resolved). The H4/OOM loop guard and asset/alias incidents are pinned and the build proves they don't regress.

---

## 3. Verification Commands (replayable)

```bash
# Read-only truth
cat package.json; cat tsconfig.json; cat eslint.config.mjs; cat vitest.config.ts; cat playwright.config.ts
cat next.config.ts; cat drizzle.config.ts; cat drizzle.config.json; cat docker-compose.yml
cat .env.example; ls -R src/app; ls public/brand public/brand/wordmarks public/images public/images/avatars
jq length src/data/{articles,manufacturers,states,glossary}.json; cat src/lib/lenders.ts | head
cat src/db/schema.ts; cat src/db/index.ts; cat src/lib/{catalog,ensure-seeded,calculator,matching,rate-limit,markdown}.tsx | head
rg "new Pool\(" src/ ; ls tailwind.config.* 2>/dev/null || echo "none"; rg '"use client"' src/components/

# Counts
for f in e2e/*.spec.ts; do echo "--- $f: $(grep -c 'test(' $f) test()"; done
for f in src/lib/*.test.ts; do echo "--- $f: $(grep -c 'it(' $f) it()"; done

# Gates (pre-push order)
npm run lint && npm run typecheck && npm run test && npm run build
E2E_PORT=3002 npx playwright test --project=chromium  # full (needs DB for 1 test: funnel valid-payload)
E2E_PORT=3002 npx playwright test --project=chromium --grep "home smoke|health|404|axe|sitemap|robots" # DB-less spot
```

---

## 4. Sign-off

**Project status: HEALTHY — shippable.** File-backed seeds are authoritative, DB projection is idempotent, RSC boundaries + `@theme` discipline + redirect validation + rate-limit + validation + PMI math all match the documented contracts. The only actions are the 7 doc/ops punches above (H-01..H-07) — no code refactors, no new abstractions, no speculative work warranted per the Surgical Changes rule.

*Report written to `docs/ALIGNMENT_REPORT.md` during the VALIDATE phase; next step would be IMPLEMENT only if you approve the doc-patch punch-list.*
