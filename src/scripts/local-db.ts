/**
 * Local-host guard — mirrors scandihaven/packages/db/src/local-db.ts
 * Lifecycle scripts (generate is safe everywhere, but migrate/seed/reset
 * must never run against a shared/staging/prod host).
 */
const LOCAL_HOSTS: ReadonlySet<string> = new Set(["localhost", "127.0.0.1", "::1"]);

export function isLocalDatabaseUrl(url: string): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname.replace(/^\[/, "").replace(/\]$/, "");
    return LOCAL_HOSTS.has(host);
  } catch {
    return false;
  }
}

export function assertLocalDatabase(url: string = process.env.DATABASE_URL ?? ""): void {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^\[/, "").replace(/\]$/, "");
  } catch {
    throw new Error(
      `DATABASE_URL is not a valid connection string (got: "${url.replace(/:[^:@]*@/, ":***@")}").`,
    );
  }
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(
      `Refusing to run against non-local database host "${host}". ` +
        "Lifecycle scripts (migrate/seed/reset) are for local development only — see AGENTS.md.",
    );
  }
}
