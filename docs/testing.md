### IMPLEMENT — Executed 
 
```bash 
  npm install --save-dev @playwright/test@1.63.0 @axe-core/playwright@4.13.0 
  npx playwright install chromium 
  # package.json: added lint:fix, e2e, e2e:all 
  # playwright.config.ts created (3002, prod build) 
  # e2e/smoke.spec.ts, seo.spec.ts, funnel.spec.ts created 
  npm run db:setup && npm run build  # ensure prod artifact 
  E2E_PORT=3002 npm run e2e           # first run hit 3000 collision → fixed to 3002 + title/sitemap/rate-limit fixes 
``` 
 
### VERIFY — Evidence 
 
```bash 
  npm run lint       # 1 pre-existing error site-header setState-in-effect + 12 warnings (unchanged) 
  npm run typecheck  # 0 errors (skills excluded) 
  npm run build      # ✓ Compiled (Turbopack), all routes prerendered 
  npm run e2e        # 16 passed (5.8s) — chromium 
    funnel API 400, 200, 429, UI ✓ 
    sitemap absolute + 30×200 via host-rewrite ✓ 
    robots/title/OG ✓ 
    smoke hero/nav/footer, get-started, calculator, health, 404, axe critical ✓ 
  # second run 16/16 stable after rate-limit isolation + host-rewrite 
``` 
 
### DELIVER — Usage 
 
```bash 
  npm run lint         # flat ESLint 
  npm run lint:fix     # auto-fix 
  npm run typecheck    # tsc --noEmit 
  npm run e2e          # chromium, needs prior: npm run db:setup && npm run build 
  npm run e2e:all      # chromium + webkit (install webkit: npx playwright install webkit) 
  E2E_BASE_URL=http://127.0.0.1:3002 npm run e2e  # reuse external server (CI: set to avoid webServer start) 
```
