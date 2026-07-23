import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

/**
 * The adapter loads `@opennextjs/cloudflare` dynamically to reach the Worker env, so we mock that
 * module to simulate: (a) no Worker context, (b) a bound Rate Limiting rule, and (c) a binding that
 * throws. Phase 3A adds a fail-closed policy: in production/preview the binding is REQUIRED — a
 * missing or faulting limiter returns `unavailable` (the route fails closed with a 503) instead of
 * silently degrading to the per-isolate in-memory Map. In dev/test the in-memory guard remains the
 * accepted fallback. Every call must resolve — never throw.
 */
const getCloudflareContext = vi.fn();
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext }));

import { rateLimit } from "@/lib/forms/rate-limit-adapter";
import { _resetRateLimitForTests } from "@/lib/forms/rate-limit";

beforeEach(() => {
  _resetRateLimitForTests();
  getCloudflareContext.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("rateLimit adapter — dev/test (in-memory fallback allowed)", () => {
  it("falls back to the in-memory limiter when no binding is present", async () => {
    getCloudflareContext.mockReturnValue({ env: {} });
    const key = "contact:1.2.3.4";
    const first = await rateLimit(key, { max: 2, windowMs: 60_000 });
    expect(first.disposition).toBe("allowed");
    expect(first.backend).toBe("in-memory");
    expect((await rateLimit(key, { max: 2, windowMs: 60_000 })).disposition).toBe("allowed");
    const third = await rateLimit(key, { max: 2, windowMs: 60_000 });
    expect(third.disposition).toBe("limited");
    // A blocked decision advises a positive Retry-After.
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("falls back when the Worker context is unavailable (getCloudflareContext throws)", async () => {
    getCloudflareContext.mockImplementation(() => {
      throw new Error("no request context");
    });
    expect((await rateLimit("contact:5.6.7.8", { max: 1 })).disposition).toBe("allowed");
    expect((await rateLimit("contact:5.6.7.8", { max: 1 })).disposition).toBe("limited");
  });

  it("uses the Cloudflare binding when bound and honours its verdict", async () => {
    const limit = vi.fn().mockResolvedValue({ success: false });
    getCloudflareContext.mockReturnValue({ env: { FORM_RATE_LIMITER: { limit } } });
    const r = await rateLimit("growth-plan:9.9.9.9");
    expect(limit).toHaveBeenCalledWith({ key: "growth-plan:9.9.9.9" });
    expect(r.disposition).toBe("limited");
    expect(r.backend).toBe("cloudflare");
    expect(r.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("allows when the bound limiter reports success", async () => {
    const limit = vi.fn().mockResolvedValue({ success: true });
    getCloudflareContext.mockReturnValue({ env: { FORM_RATE_LIMITER: { limit } } });
    const r = await rateLimit("growth-plan:9.9.9.9");
    expect(r.disposition).toBe("allowed");
    expect(r.backend).toBe("cloudflare");
  });

  it("degrades to the in-memory limiter if the binding throws (dev/test only)", async () => {
    const limit = vi.fn().mockRejectedValue(new Error("limiter down"));
    getCloudflareContext.mockReturnValue({ env: { FORM_RATE_LIMITER: { limit } } });
    const r = await rateLimit("contact:degraded", { max: 1 });
    expect(r.disposition).toBe("allowed"); // in-memory allowed the first hit
    expect(r.backend).toBe("in-memory");
  });
});

describe("rateLimit adapter — production/preview (binding REQUIRED, fail closed)", () => {
  it("returns 'unavailable' (no in-memory fallback) when the binding is missing in production", async () => {
    vi.stubEnv("APP_ENV", "production");
    getCloudflareContext.mockReturnValue({ env: {} });
    const r = await rateLimit("contact:1.2.3.4", { max: 1 });
    expect(r.disposition).toBe("unavailable");
    expect(r.backend).toBeNull();
    expect(r.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("returns 'unavailable' when the Worker context can't be resolved in production", async () => {
    vi.stubEnv("APP_ENV", "production");
    getCloudflareContext.mockImplementation(() => {
      throw new Error("no request context");
    });
    expect((await rateLimit("contact:1.2.3.4")).disposition).toBe("unavailable");
  });

  it("fails CLOSED as 'unavailable' when the bound limiter throws in production", async () => {
    vi.stubEnv("APP_ENV", "production");
    const limit = vi.fn().mockRejectedValue(new Error("limiter down"));
    getCloudflareContext.mockReturnValue({ env: { FORM_RATE_LIMITER: { limit } } });
    const r = await rateLimit("contact:degraded", { max: 1 });
    expect(r.disposition).toBe("unavailable");
    expect(r.backend).toBeNull();
  });

  it("still honours the bound limiter's verdict when it works in production", async () => {
    vi.stubEnv("APP_ENV", "production");
    const limit = vi.fn().mockResolvedValue({ success: true });
    getCloudflareContext.mockReturnValue({ env: { FORM_RATE_LIMITER: { limit } } });
    const r = await rateLimit("contact:1.2.3.4");
    expect(r.disposition).toBe("allowed");
    expect(r.backend).toBe("cloudflare");
  });

  it("applies the same fail-closed policy in preview", async () => {
    vi.stubEnv("APP_ENV", "preview");
    getCloudflareContext.mockReturnValue({ env: {} });
    expect((await rateLimit("contact:1.2.3.4")).disposition).toBe("unavailable");
  });
});
