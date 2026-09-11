import { afterEach, describe, expect, it, vi } from "vitest";
import { clientKey, rateLimit } from "./rate-limit";

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
