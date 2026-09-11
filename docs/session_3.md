All validation gates pass: 
 
┌───────────────────┬─────────────────────────────────────────────┐ 
│ Gate              │ Result                                      │ 
├───────────────────┼─────────────────────────────────────────────┤ 
│ npm run lint      │ ✅ 0 errors / 0 warnings                    │ 
├───────────────────┼─────────────────────────────────────────────┤ 
│ npm run typecheck │ ✅ clean                                    │ 
├───────────────────┼─────────────────────────────────────────────┤ 
│ npm run test      │ ✅ 37/37 (11+13+7+6)                        │ 
├───────────────────┼─────────────────────────────────────────────┤ 
│ npm run build     │ ✅ 43/43 static, 11 redirects validated     │ 
├───────────────────┼─────────────────────────────────────────────┤ 
│ npm run e2e       │ ✅ 55/55 chromium (prod next start on 3002) │ 
└───────────────────┴─────────────────────────────────────────────┘ 
 
──────────────────────────────────────────────────────────────────────────────── 
 
### Summary of Changes 
 
Code: 
- src/app/error.tsx — Migrated to Next 16.3 stable retry prop with reset alias (retry ?? reset), added useEffect(() => console.error(error), [error]) logging, Try again button uses doRetry with 
  disabled={!doRetry} guard. 
 
Docs (allow-list updated in all three): 
- AGENTS.md — Added error.tsx to client island list with note: "Next.js 16 error.md — error boundaries must be Client Components; retry stable since 16.3, reset kept as alias for back-compat; global-error.tsx  
  would also be client if added" 
- CLAUDE.md — Updated both Server Components section and Errors/Loading section with detailed props shape and retry ?? reset pattern 
- README.md — Updated architecture table and Components convention with same note 
 
Timestamps updated to 2026-09-13 in all three docs + validation report. 
 
──────────────────────────────────────────────────────────────────────────────── 
 
### Final Status 
 
┌────────────────┬────────────────────────────────────────────────────────────────────────────────┐ 
│ Dimension      │ Status                                                                         │ 
├────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ Code quality   │ ✅ Clean (lint 0, typecheck 0, tests 37/37)                                    │ 
├────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ Architecture   │ ✅ Aligned (singleton pool, file-backed seeds, RSC default, force-dynamic API) │ 
├────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ Visual parity  │ ✅ All 19 pass-3 parity checks green in parity.spec.ts                         │ 
├────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ Error boundary │ ✅ Correctly implements Next 16.3 error.md convention                          │ 
├────────────────┼────────────────────────────────────────────────────────────────────────────────┤ 
│ Documentation  │ ✅ Allow-list complete, timestamps current                                     │ 
└────────────────┴────────────────────────────────────────────────────────────────────────────────┘ 
 
Verdict: ✅ SHIPPABLE — No blockers, no regressions, full pre-push gate green.

---

```bash
$ git diff src/app/error.tsx
diff --git a/src/app/error.tsx b/src/app/error.tsx
index 6f8baf0..07b22da 100644
--- a/src/app/error.tsx
+++ b/src/app/error.tsx
@@ -1,14 +1,22 @@
 "use client";
 
 import { Button, ButtonLink, Container } from "@/components/ui";
+import { useEffect } from "react";
 
 export default function Error({
   error,
+  retry,
   reset,
 }: {
   error: Error & { digest?: string };
-  reset: () => void;
+  retry?: () => void;
+  reset?: () => void;
 }) {
+  const doRetry = retry ?? reset;
+
+  useEffect(() => {
+    console.error(error);
+  }, [error]);
   return (
     <main className="pb-20 pt-32">
       <Container className="max-w-xl text-center">
@@ -25,7 +33,7 @@ export default function Error({
           <p className="mt-3 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>
         ) : null}
         <div className="mt-8 flex justify-center gap-3">
-          <Button onClick={reset}>Try again</Button>
+          <Button onClick={doRetry} disabled={!doRetry}>Try again</Button>
           <ButtonLink href="/" variant="outline">
             Home
           </ButtonLink>

$ ls -l src/app/debug-error-probe/
total 4
-rw-rw-r-- 1 pete pete 128 Sep 12 05:31 page.tsx
```
