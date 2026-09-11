All documentation files exist. Let me read them, starting with AGENTS.md and README.md.
Now let me read CLAUDE.md (the full spec).
Now let me review the Project_Architecture_Document.md — it's large (98KB), so I'll read it in sections.
I've now internalized the PAD. Let me review the home-financing_SKILL.md structure (1594 lines).
I now have a strong understanding of the documented architecture. Let me update my todos and start validating against the actual codebase. First, let me check the skills catalog as instructed, and validate key claims.
Relevant skills identified. Let me read the key skill files I'll need for browser testing and TDD.
TDD skill internalized. Now let me validate documentation claims against the codebase — checking package.json, configs, and running the verification gate.
package.json and next.config.ts match the docs exactly. Now let me install dependencies and run the verification gate.
Lint and typecheck both pass clean. Now unit tests:
37/37 unit tests pass exactly as documented. Now the production build:
Build succeeds (43/43 pages). Docker is unavailable in this environment — let me check for alternative Postgres options and run the E2E suite (43/44 are DB-less per docs).
No local Postgres/Docker — I'll run the documented DB-less E2E mode (43/44). Let me ensure Playwright browsers are installed first.
42/44 passed. Failure #1 (funnel valid-payload) is the documented DB-less exception, but failure #2 (calculator PMI alert) is a **real, undocumented failure** — an actual bug finding. Let me investigate.
Now let me examine the calculator-app component to find the root cause:
The component logic looks correct. Let me check DEFAULT_CALCULATOR to understand the test's 62500 value:
Found the logic: 62500/250000 = 25% down → PMI should be 0 → "No PMI." should appear. The logic seems right, so the failure is likely in the event-dispatch interaction. Let me reproduce it with a debug script:
Root cause is emerging: DOM value became 63000 (browser snapped to step 1000) but React state never updated (summary still shows $25,000 / 10%). The React 19 prototype-level value tracker is likely swallowing the native-setter trick. Let me verify:
The prototype setter IS native — so this isn't classic tracker interception. Let me test real user interactions (keyboard) vs synthetic events empirically:
Revealing! `fill()` works, native-setter worked at 125000, but keyboard arrows did NOT move the slider (possible a11y bug!) and 62500 failed earlier. Let me isolate exactly why 62500 fails and whether keyboard operability is broken:
Scenario A now PASSES with identical code! The difference must be timing — in the failing test, the dispatch fires before React finishes hydrating. Let me verify this hydration-race hypothesis rigorously:
**Root cause confirmed with evidence**: the parity test dispatches the input event immediately after `goto`, racing React hydration — 2/5 immediate dispatches lost (before React attaches listeners), 100% pass after hydration settles. The app math is correct; this is a **test-determinism bug**. Keyboard operability is also confirmed working (scenario D).

Now let me proceed to the live-site E2E comparison: `https://modfii.jesspete.shop/` vs source `https://modfii.com/`.
The audit ran but my script has issues to clean up: the source site has 2 meta descriptions (script bug — needs `.first()`), and `net::ERR_ABORTED` on `_rsc=` prefetches is normal Next.js behavior (not real failures). Let me check the clean JSON data:
All 14 routes are healthy on both sites (200s, no console errors, no broken images — the aborted `_rsc` prefetches are normal Next.js behavior). Now let me do the visual comparison of the screenshots:
This is the source site. Now the clone:
The clone is very close structurally. I can spot several differences to verify precisely. The huge cream gap on the source is likely scroll-reveal content that didn't trigger in the full-page screenshot. Let me capture detailed section-by-section comparisons with progressive scrolling:
**Major finding**: the source homepage has 4 sections the clone is missing — "How Financing Works", "Loan Types Available", "Who We Help", and "Why Prefab Financing Is Different" — and different section headings. Let me examine the source's sections:
Now I see the source hero in detail. Let me examine the four missing source sections:
The source intro is a 2×2 card grid (How Financing Works / Loan Types Available / Who We Help / Why Prefab Financing Is Different) + "Explore All Loan Options" CTA. Let me compare with the clone's equivalent:
The clone's card content matches the source, but the clone ADDS an extra "Modular & Prefab Home Loans" heading section the source doesn't have. Let me check the remaining source sections:
Let me capture precise close-ups of the clone hero vs source hero for detailed comparison:
Rich data! The source dump reveals the full structure — the 4 cards DO exist on both sites (source renders card titles as h2). Now let me do a precise text-level diff of both homepages to find all remaining parity gaps:
Only 2 text gaps found! Let me check the reverse direction (clone-only content) to complete the parity picture:
The reverse diff shows the clone has extra content (green sustainability band, richer FAQ answers, "NMLS #" in copyright). Let me verify the testimonial values and compare headers/footers precisely:
Testimonials match perfectly. Two eyebrow differences found: clone lacks "Your Prefab Financing Partner" and has "How it works" (wrong case) instead of "FAQ" for the FAQ section. Let me examine the homepage source code:
Now I have the full homepage picture. Let me examine the header and footer for the logo split and nav comparison:
Let me compare the header logos and More dropdowns closely:
Header comparison reveals logo differences: source has a **circle** icon + two-tone "ModFii" (Mod dark, Fii green); clone has a rounded-square icon + single-color wordmark. Let me fetch the actual source logo:
The SVG files are identical — but the source header renders a circle icon, so the source must use different markup. Let me extract the source's actual header logo HTML:
The source is a client-rendered SPA (2KB shell). Let me extract the rendered DOM via browser:
Now I can see the source's More dropdown has only 2 items (clone has 4 — extra), and the logo is clearly a **circle icon with two-tone "ModFii"**. Let me check the footers:
Footers are near-identical (same 7 columns). Differences: logo (same as header), clone adds "NMLS #2537136" to copyright, and clone's legal line is missing the trailing "NMLS Consumer Access" link. Now let me compare the key conversion pages:
Key finding: the source's `/get-started` has an extra "Get Financing in 3 Easy Steps" section the clone lacks, and icon-tile shapes differ (rounded-square vs circle). Let me check calculator and learn pages:
Calculator structure matches well. Notable: the source uses **warm amber/peach section backgrounds** below the fold and has $-input boxes next to sliders. Let me check the learn pages:
Learn pages match closely. Let me do a quick mobile viewport check, then compile the findings:
Mobile reveals another difference: the source's **mobile header is light sage** even over the hero, while the clone's is transparent. Let me check the source mobile menus:
The source's mobile header is light (desktop is transparent-over-dark); the clone is transparent at all widths — a parity fix to note. Now let me verify the live funnel API works end-to-end on the deployment:
Live deployment is fully functional (health ok, funnel persists + returns matches, sitemap 152 locs, robots correct host). Now let me read the remaining files I'll need to modify — get-started page and footer:
The get-started page code shows icon tiles already use `rounded-xl` — good. Now the footer:
I now have complete evidence. Let me check where the logo SVG is referenced, then write the audit + remediation plan document:
All prerequisites verified (`Handshake`/`Sparkles` icons exist; logo referenced in 3 places). Let me save the worklog and write the remediation plan document:
Plan saved. Let me validate the last file in the plan — the calculator page:
Before implementing, I need to resolve one ambiguity about the source's desktop header behavior — let me inspect its computed styles directly:
**Major correction from evidence**: the source header is **always light** (`rgba(253,253,252,0.8)` + `blur(16px)`) — at top, scrolled, and mobile. The clone's transparent-over-dark-hero behavior (documented as "modfii.com behavior") doesn't match the live source at all. P7 becomes: remove the transparent-over-dark logic entirely. Let me check what the existing tests pin about the header:
No tests pin the old header behavior — safe. Now executing **TDD Step 1 (RED)**: updating the parity specs with the PMI fix and the new pass-3 tests that must fail against current code:
Now let me add the new pass-3 parity test block (RED — these must fail against current code):
Now let me run the new specs against the old build to confirm RED:
**RED confirmed** — all 11 new tests fail exactly as predicted (the 11 parity gaps), and the PMI fix already passes. Now **Step 2 (GREEN)** — implementing. First, the circle brand mark:
Now the header — two-tone wordmark, always-light behavior, source-matched dropdown:
Header done. Now the footer — two-tone wordmark, copyright fix, legal-line NMLS link:
Now the homepage — eyebrow, trust line, remove green band + steps CTA, case fix:
Homepage done. Now the get-started page — add the source's 3-step band and sparkle eyebrow:
I spot a structural issue: the hero's `fill` image and gradient overlay are positioned against `<main>` — adding a section inside main would put them behind it too. Let me restructure so the hero is its own section:
Now the calculator page amber bands:
Let me fix the indentation in get-started for a clean diff, then run the gates:
Lint, typecheck, and unit tests all pass. Now rebuild and run the full E2E suite (GREEN):
11 failures — suspicious. Let me check whether a stale server served the old build:
The stale server (pid 2420, started 17:19 pre-changes) survived `pkill` — Next renames its process to "next-server". Kill it properly and re-run:
Major progress — all 11 pass-3 parity tests now pass (GREEN). 4 failures remain: 1 expected (DB-less funnel), but 3 need investigation — likely strict-mode issues from the now-duplicated NMLS link and get-started structure changes:
Root causes identified: my new "Get Matched" card title collides with the h1 in two heading-matching tests (strict mode), and the NMLS link now appears twice in the footer. These tests need disambiguation — the code is correct per source:
**GREEN!** 54/55 passed — the only failure is the documented DB-dependent funnel test (no Postgres in this sandbox). Now let me prove the PMI flake fix with 10 consecutive runs:
Output is ambiguous — let me re-run with precise pass/fail capture:
The toPass retry is insufficient — 8/10 still fail. My hydration theory is incomplete: the retry dispatches should eventually work but don't. Let me instrument precisely what happens across time:
**Real root cause found** (deeper than hydration race): a pre-hydration dispatch **poisons React's value tracker** — hydration preserves the DOM value (63000) and initializes the tracker to it, so identical re-dispatches read as "no change" and are swallowed forever. Retries can't recover; each attempt must start from a **fresh navigation**. Let me fix the test accordingly:
**10/10 PASS** — flake eliminated deterministically. Now the full verification gate:
All gates green. Let me rebuild with the final source state and verify the parity improvements with a local text-diff:
**Perfect parity**: 0 source nodes missing (was 2); only the 5 accepted-deviation FAQ answers remain (questions match). Let me visually confirm the final state:
The header now matches the source exactly (light frosted bar, circle mark, two-tone wordmark). Let me verify get-started and calculator:
Get-started now matches the source including the new 3-step band. Calculator check:
All visual fixes verified. Now cleaning up scratch artifacts and updating documentation:
All clean — only intentional changes. Now updating documentation. First AGENTS.md:
AGENTS.md done. Now CLAUDE.md:
MultiEdit is atomic — the invalid edit blocked all. Re-running without the PAD-only line:
The first MultiEdit partially applied. Let me check which sections are already updated:
CLAUDE.md complete. Now README.md:
Partial applications again — let me check remaining stale spots in README:
README done. Now home-financing_SKILL.md — let me find the stale claims:
Let me fix the SKILL.md version header and verify the spec counts in its tree:
SKILL.md done. Now the PAD — let me find all stale spots:
Now the PAD's final footer note:
All docs updated. Final verification sweep for stale counts across all five docs:
The remaining references are in historical audit records (correct to leave as point-in-time). Only my own plan doc needs its P7 row amended to reflect the upgraded finding:
All documentation aligned. Final full gate before commit:
All gates green (54/55 — only the documented DB-dependent test fails locally; the deployed DB was verified working). Now let me update the worklog and prepare the SSH push:
paramiko installed. Now committing the work in logical atomic units (code+tests first, then docs):
Now setting up the SSH key and pushing via the wrapper script:
**Push successful** — `f269f43..d683f31 main -> main`. Let me verify the final state and clean up:
All done — remediation pass 3 is pushed to `main` (`d87a15f` feat + `d683f31` docs, verified `f269f43..d683f31 main -> main`).

**What happened:**
- **Validated every doc claim against the codebase** — lint 0/0, typecheck, 37/37 unit, build 43/43, live deploy fully healthy (health/funnel/sitemap/robots).
- **Live E2E audit** (clone vs modfii.com, desktop + mobile): found the PMI test flake and 12 visual parity gaps.
- **Root-caused the flake with instrumentation**: a pre-hydration dispatch poisons React's value tracker — fixed with a fresh-navigation retry, now 10/10 stable.
- **Fixed all 12 parity gaps via TDD** (RED→GREEN): circle brand mark + two-tone wordmark, always-light header (the live source never goes transparent — a documented claim I disproved by probe), homepage eyebrow + trust line, removed two clone-only sections, get-started 3-step band, calculator amber wash, footer legal line, 2-item dropdown.
- **Aligned all five docs**; evidence lives in `docs/REMEDIATION_PLAN_pass3.md`.

**Next steps:** redeploy `modfii.jesspete.shop` from main to see the parity fixes live, and consider rotating `BETTER_AUTH_SECRET`/`CRON_SECRET` (still flagged in history).
