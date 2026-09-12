const buckets = new Map<string, { count: number; resetAt: number }>();

// Memory guard (pass-6 audit A-01): unique-key floods (spoofed x-forwarded-for)
// used to grow the map without bound — one entry per request, never evicted.
// When the cap is exceeded we sweep expired entries before inserting a new key.
// Active-window buckets are never touched, so the hot path stays O(1) amortized.
const MAX_BUCKETS = 10_000;

function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    if (buckets.size >= MAX_BUCKETS) sweepExpired(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

/** Test-only hook for the eviction regression tests (pass-6 A-01). */
export function __bucketSizeForTest(): number {
  return buckets.size;
}
