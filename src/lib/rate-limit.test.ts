import { afterEach, describe, expect, it, vi } from "vitest";
import { __bucketSizeForTest, clientKey, rateLimit } from "./rate-limit";

afterEach(() => {
  vi.useRealTimers();
});

describe("rateLimit", () => {
  it("allows requests up to the limit within the window", () => {
    const key = `allow-${Math.random()}`;
    const results = Array.from({ length: 5 }, () => rateLimit(key, 5, 60_000));
    expect(results).toEqual([true, true, true, true, true]);
  });

  it("blocks the request after the limit is exhausted", () => {
    const key = `block-${Math.random()}`;
    for (let i = 0; i < 8; i += 1) rateLimit(key, 8, 60_000);
    expect(rateLimit(key, 8, 60_000)).toBe(false);
  });

  it("resets the bucket after the window expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const key = `window-${Math.random()}`;
    for (let i = 0; i < 3; i += 1) rateLimit(key, 3, 1_000);
    expect(rateLimit(key, 3, 1_000)).toBe(false);
    vi.setSystemTime(1_500);
    expect(rateLimit(key, 3, 1_000)).toBe(true);
  });

  it("keeps buckets isolated per key", () => {
    const a = `iso-a-${Math.random()}`;
    const b = `iso-b-${Math.random()}`;
    for (let i = 0; i < 4; i += 1) rateLimit(a, 4, 60_000);
    expect(rateLimit(a, 4, 60_000)).toBe(false);
    expect(rateLimit(b, 4, 60_000)).toBe(true);
  });
});

describe("rateLimit bucket eviction (pass-6 A-01)", () => {
  it("evicts expired buckets once the map exceeds the cap", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    // Fill the map past the cap with short-window keys that all expire.
    for (let i = 0; i < 12_000; i += 1) {
      rateLimit(`spoofed-${i}`, 1, 100);
    }
    vi.setSystemTime(200);
    // One more unique key after expiry should sweep the stale entries and
    // keep the map bounded instead of growing without limit.
    rateLimit(`spoofed-next`, 1, 100);
    const size = __bucketSizeForTest();
    expect(size).toBeGreaterThan(0);
    expect(size).toBeLessThan(1_000);
  });

  it("never evicts buckets that are still inside their window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const active = `active-${Math.random()}`;
    rateLimit(active, 2, 60_000);
    for (let i = 0; i < 12_000; i += 1) {
      rateLimit(`churn-${i}`, 1, 100);
    }
    vi.setSystemTime(200);
    rateLimit(`churn-next`, 1, 100);
    // The active long-window bucket must survive the sweep and keep counting.
    expect(rateLimit(active, 2, 60_000)).toBe(true);
    expect(rateLimit(active, 2, 60_000)).toBe(false);
  });
});

describe("clientKey", () => {
  function reqWith(headers: Record<string, string>): Request {
    return new Request("https://modfii.example/api", { headers });
  }

  it("prefers the first x-forwarded-for entry", () => {
    expect(clientKey(reqWith({ "x-forwarded-for": "1.1.1.1, 2.2.2.2" }))).toBe("1.1.1.1");
  });

  it("trims whitespace around the forwarded entry", () => {
    expect(clientKey(reqWith({ "x-forwarded-for": " 3.3.3.3 , 4.4.4.4" }))).toBe("3.3.3.3");
  });

  it("falls back to x-real-ip, then local", () => {
    expect(clientKey(reqWith({ "x-real-ip": "5.5.5.5" }))).toBe("5.5.5.5");
    expect(clientKey(reqWith({}))).toBe("local");
  });
});
