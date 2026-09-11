import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="pt-32 pb-24">
      <Container className="max-w-xl text-center">
        <p className="text-sm font-semibold tracking-wider text-primary uppercase">404</p>
        <h1 className="mt-3 font-display text-4xl font-bold">That page isn&apos;t on the lot.</h1>
        <p className="mt-4 text-muted-foreground">
          The link may be outdated. Start from resources, or get pre-qualified in two minutes.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/">Home</ButtonLink>
          <ButtonLink href="/resources" variant="outline">
            Resources
          </ButtonLink>
        </div>
      </Container>
    </main>
  );
}
