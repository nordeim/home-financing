**Task type: Code audit + remediation (Modes C → A/B)**. Starting with the repo clone:
Repo cloned. Now let me look at the top-level structure and read the three key docs.
Now the CLAUDE.md (the full spec):
Docs read. Now let me validate the documented claims against the actual codebase (Task 3 — Audit).
Key version drift found already (docs say Next 16.2.6, package.json says ^16.3.4). Let me check for security issues (is `.env` tracked?) and examine the core code:
**CRITICAL FINDING**: `.env` is tracked in git — this contradicts the docs' claim that it's gitignored. Let me investigate:
Confirmed: real secrets committed. Now let me examine the core lib files and app code:
Core domain logic matches docs. Let me examine the app routes and components:
Code aligns with docs so far. Let me kick off `npm install` in the background while reviewing remaining files:
Seed counts match docs (23/40/50/59, 8 lenders, 5 products) ✓. Let me check the e2e specs and remaining components:
Background install didn't survive the session. Running in foreground with extended timeout:
Typecheck passes. Now lint and build:
Build passes. Key audit findings so far:

| # | Finding | Severity |
|---|---------|----------|
| A1 | `.env` **tracked in git** with real `BETTER_AUTH_SECRET`+`CRON_SECRET` (committed in d572d73) despite gitignore | Critical |
| A2 | `eslint.config.mjs` does NOT ignore `skills/` → 12 lint warnings leak from `skills/kimi-pdf/scripts/paged.polyfill.js`; docs claim skills excluded from all checks | Medium |
| A3 | Doc drift: package.json says next `^16.3.4`, react `^19.3.0`, tailwind `^4.3.3`, pg `^8.23.0` — docs say 16.2.6 / 19.2 / 4.1.17 / 8.20.0 | Low |
| A4 | `/api/calculator` is POST-only; CLAUDE.md says GET/POST, README says `*` | Low |
| A5 | Pre-existing lint error `react-hooks/set-state-in-effect` in site-header.tsx:31 | Medium |

Now let me set up the database and check Docker availability:
No Docker/Postgres available. Let me try installing PostgreSQL directly (needed for full local E2E), and in parallel start examining the live sites:
No root access — can't run local Postgres. The local E2E suite tolerates missing DB for most tests (only valid-payload funnel test needs DB). Priority per the user is the **live-site browser E2E**. Let me check the live sites first:
Both live. The source site serves only 2KB — let me inspect what modfii.com actually is:
The source `modfii.com` is a client-side rendered SPA (Vite/React, originally a Lovable app) — visual comparison requires real browser rendering. Let me load the browser automation skill:
Source site rendered — dark forest-green hero, glassmorphism stats card, amber accents. Let me capture the full source page and then the clone:
The full-page shot shows blank areas (scroll-triggered animations). Let me scroll through section by section:
Source has rich sections. Continuing the scroll capture:
Source site fully mapped (11 sections). Now let me capture the clone site:
Clone is structurally close but I can see visual gaps (header color, logo, hero background image, badges). Let me capture the clone's full page:
Found a **broken image** on the clone (alt text "Bright living room inside a modern prefab home" showing). Let me see the rest:
Now I have the complete picture. Let me read the repo's homepage code to understand what's implemented vs what's deployed:
The homepage references 3 images under `/images/`. Let me check what actually exists in `public/`:
**Confirmed**: 6 referenced images are missing from `public/` (hero-prefab, green-home, interior-living, adu-backyard, tiny-home, **and og-image.jpg** used in metadata). Let me verify these 404 on the live site and check the other affected pages:
All 6 images 404. Now let me map the source site's routes to compare navigation and key pages:
Source footer confirms identical route architecture. Let me compare the key interior pages — first check source's Get Started href:
The source's funnel is a multi-step wizard. Let me see the clone's version:
Clone's funnel works but visual styling differs (no icons in options, light left panel vs green glass cards). Let me E2E test the clone's wizard flow:
Full funnel works — matched successfully. Let me verify the results screen and check console errors:
Funnel E2E passes with 4 matches, no console errors. Let me check the source's funnel post-submit state for comparison:
Source uses a 5-step focused takeover wizard (site nav hides); clone keeps standard layout with 4 steps. Let me now crawl all clone routes for errors and broken images:
Let me test the clone's calculator functionality and the pages with broken images:
Calculator math is correct. Let me check pages with broken images and mobile view:
Mobile menu works. Let me compare the financing hub pages between sites:
Major parity gap on the financing hub. Let me check the loan-options and learn pages on both:
Consistent pattern identified: source uses centered photo-backed heroes everywhere; clone uses left-aligned gradient heroes. Now let me run the local E2E suite against the local build:
Playwright browsers need installing:
15/16 pass locally — the single failure is the DB-dependent funnel test (no Postgres in this environment; live-site funnel verified working earlier). Let me review remaining core files:
Confirmed logo mismatch. Let me check font families used by both sites:
Fonts match. Let me verify the source's scroll animations (the blank sections in full-page shots):
Fonts match (Outfit + DM Sans). The source also lazy-renders sections via IntersectionObserver. I now have a complete audit picture. Let me record the worklog and compile the remediation plan:
Before executing, let me validate the plan against the repo's skills catalog as the user requested:
Plan validated against repo skills (`tdd-workflow`, `frontend-ui-engineering`, `image-generation`, `agents-md`, `claude-md`). Let me grab the source's footer + More-menu details for the parity work:
Source footer fully mapped (7 columns). Now executing the remediation plan.

## P0 — Security & hygiene
P0 committed — lint now 0 warnings (1 known header error remains, fixed in P3).

## P1 — TDD: install vitest + write tests first
Now writing unit tests for the three pure domains:
31 unit tests green. Now the E2E regression tests (TDD RED phase — must fail before fixes):
RED confirmed — 11 failures exactly where expected. Committing the test-first state:
## P2 — Bug fixes: generate missing images, adopt source logo, add redirects
Let me generate the 6 missing images with the z-ai CLI (matching the source site's aesthetic):
Size must be multiples of 32 (512–2880). Adjusting:
CLI's allowed list conflicts with API validation. Using the SDK directly with API-valid sizes (multiples of 32):
All 5 images generated. Now composing the branded OG image and converting PNGs → JPGs:
OG image has text overflow — fixing:
OG image is clean. Let me spot-check the generated images:
Hero image matches the source aesthetic. Now adopting the source's exact logo SVG and adding redirects:
Now fixing `.env.example` (legacy scandihaven creds → real dev values):
GREEN — all 11 regression tests pass. Committing P2:
P3a — Header parity. First let me check the source's More-menu contents:
The dropdown is interaction-gated; I'll keep the clone's MORE items (sensible) and restyle the header. Rewriting `site-header.tsx` with parity + lint fix:
`ButtonLink` doesn't accept `onClick` — extending it:
Lint fully clean — header error resolved. Committing P3a:
## P3b — Homepage rebuild to match modfii.com section-for-section
Fixing a nested-Container issue in the Standards section:
## P3c — Footer parity + PageHero redesign
Now the PageHero redesign. Checking current callers first for compatibility:
All interior pages flow through `GuideView` → `PageHero` — one redesign lifts them all. Rewriting `page-shell.tsx`:
Now adding the `highlight` field to the guide type and hub content:
26 pages auto-upgrade via GuideScreen. Making Breadcrumbs alignment opt-in to avoid breaking bespoke pages:
Now adding the `highlight` field to the guide type and enriching the hub guide entries:
lucide 1.44 dropped brand icons. Using a local SVG component wrapper (per project convention):
All green. Converting the 3 bespoke-hero pages to the new PageHero:
No bespoke dark heroes remain. Let me run the full local verification and visual check:
Dramatic parity improvement. Checking the scroll state and remaining sections:
Excellent parity. Checking deeper sections and the financing hub:
Nearly pixel-parity on steps and testimonials. Checking the financing hub:
Hub pages now closely match. Now P3d — get-started wizard restyle:
Targeted wizard restyle to match the source (green progress bar, % complete, 2-col grids, icon tiles, radio circles):
The page served is stale — the old server still owns port 3003. Restarting cleanly:
Found a contrast bug: the form card inherits white text from the new dark panel. Fixing:
Get-started now mirrors the source. Running the full verification suite and funnel test:
The smoke test asserts the old "Get Pre-Qualified" label — the header now says "Get Started" (source-faithful). Updating the test to the intentional new label:
## P4 — Final verification gate (Definition of Done)
All gates green. ## P5 — Documentation alignment

Updating AGENTS.md first:
Now CLAUDE.md:
Stack line already updated. Adding the remediation footer note:
Now README.md:
Surrogate-pair literals broke the heredoc. Writing a proper script file instead:
## P6 — Push via SSH wrapper
`/usr/bin/python3` has paramiko. Setting up the key and pushing:
**Pushed successfully** — `81ab837..a21c1e4 main -> main` (6 commits). Let me clean up the key copy, update the worklog, and verify the live deployment:
Live site hasn't redeployed yet (deployment pipeline is outside this session). Waiting once more before concluding:
All done. Here's the complete picture:

## ✅ Session complete — 6 commits pushed to `main` (`81ab837..a21c1e4`)

**Audit → Remediation → Verification, all evidence-backed:**

| Phase | Highlights |
|---|---|
| **Audit** | `.env` found **tracked with real secrets** (critical); 6 images 404 on live; eslint leaked `skills/` warnings; lint error in header; stale docs (versions, redirect count, calculator method); sitemap emitting wrong host |
| **TDD** | 11 e2e regression tests written **red-first** (assets + aliases), then made green; **31 vitest unit tests** added (calculator/matching/rate-limit) |
| **Bugs fixed** | 5 AI-generated photos + branded OG image + canonical modfii.com logo adopted; `/compare/*` parity redirects; `.env` untracked |
| **Visual parity** | Header (transparent→cream + "Get Started"), homepage rebuilt section-for-section, `PageHero` redesign lifting 26+ pages, 7-column footer, get-started wizard restyle — verified side-by-side vs `modfii.com` via browser screenshots |
| **Gates** | lint **0/0** · typecheck ✓ · vitest **31/31** · build ✓ · e2e **26/27** (1 needs Postgres, unavailable here; live funnel verified manually) · axe clean |
| **Docs** | AGENTS/CLAUDE/README fully realigned with the remediated codebase |

**⚠️ Two follow-ups only you can do:**
1. **Rotate `BETTER_AUTH_SECRET` + `CRON_SECRET`** — they remain in git history.
2. Set `NEXT_PUBLIC_SITE_URL=https://modfii.jesspete.shop` in the deploy env — the live site hasn't auto-redeployed yet; once your pipeline runs, sitemap/OG will emit the correct host and the new visuals go live.
