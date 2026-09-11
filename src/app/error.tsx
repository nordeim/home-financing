"use client";

import { Button, ButtonLink, Container } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="pb-20 pt-32">
      <Container className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">Something went wrong</p>
        <h1 className="mt-3 font-display text-4xl font-bold">We hit a snag loading this page.</h1>
        <p className="mt-4 text-muted-foreground">
          This is usually transient. Try again — your data is safe. If the problem persists, contact{" "}
          <a href="mailto:team@modfii.com" className="text-primary underline-offset-4 hover:underline">
            team@modfii.com
          </a>
          .
        </p>
        {error.digest ? (
          <p className="mt-3 font-mono text-xs text-muted-foreground">Ref: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/" variant="outline">
            Home
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
