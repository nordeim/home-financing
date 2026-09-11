import { Container } from "@/components/ui";

export default function Loading() {
  return (
    <main className="pb-20 pt-32">
      <Container>
        <div className="mx-auto max-w-3xl animate-pulse">
          <div className="mx-auto h-6 w-32 rounded-full bg-muted" />
          <div className="mx-auto mt-6 h-10 w-3/4 rounded-lg bg-muted" />
          <div className="mx-auto mt-4 h-10 w-2/3 rounded-lg bg-muted" />
          <div className="mx-auto mt-6 h-5 w-full max-w-xl rounded bg-muted" />
          <div className="mx-auto mt-3 h-5 w-5/6 max-w-xl rounded bg-muted" />
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl border border-border bg-card p-5">
                <div className="h-4 w-1/2 rounded bg-muted" />
                <div className="mt-3 h-3 w-full rounded bg-muted" />
                <div className="mt-2 h-3 w-5/6 rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}
