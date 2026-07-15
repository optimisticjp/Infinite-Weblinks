import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * The adapter loads `@opennextjs/cloudflare` dynamically to reach the Worker env, so we
 * mock that module to simulate: (a) no Worker context, (b) a bound Rate Limiting rule,
 * and (c) a binding that throws. In every case the adapter must resolve — never throw —
 * and must degrade to the in-memory limiter when the binding is unavailable.
 */
const getCloudflareContext = vi.fn();
vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext }));

import { rateLimit } from "@/lib/forms/rate-limit-adapter";
import { _resetRateLimitForTests } from "@/lib/forms/rate-limit";

beforeEach(() => {
  _resetRateLimitForTests();
  getCloudflareContext.mockReset();
});

describe("rateLimit adapter", () => {
  it("falls back to the in-memory limiter when no binding is present", async () => {
    getCloudflareContext.mockReturnValue({ env: {} });
    const key = "contact:1.2.3.4";
    expect((await rateLimit(key, { max: 2, windowMs: 60_000 })).allowed).toBe(true);
    expect((await rateLimit(key, { max: 2, windowMs: 60_000 })).allowed).toBe(true);
    expect((await rateLimit(key, { max: 2, windowMs: 60_000 })).allowed).toBe(false);
  });

  it("falls back when the Worker context is unavailable (getCloudflareContext throws)", async () => {
    getCloudflareContext.mockImplementation(() => {
      throw new Error("no request context");
    });
    const r = await rateLimit("contact:5.6.7.8", { max: 1 });
    expect(r.allowed).toBe(true);
    const r2 = await rateLimit("contact:5.6.7.8", { max: 1 });
    expect(r2.allowed).toBe(false);
  });

  it("uses the Cloudflare binding when bound and honours its verdict", async () => {
    const limit = vi.fn().mockResolvedValue({ success: false });
    getCloudflareContext.mockReturnValue({ env: { FORM_RATE_LIMITER: { limit } } });
    const r = await rateLimit("growth-plan:9.9.9.9");
    expect(limit).toHaveBeenCalledWith({ key: "growth-plan:9.9.9.9" });
    expect(r.allowed).toBe(false);
  });

  it("allows when the bound limiter reports success", async () => {
    const limit = vi.fn().mockResolvedValue({ success: true });
    getCloudflareContext.mockReturnValue({ env: { FORM_RATE_LIMITER: { limit } } });
    expect((await rateLimit("growth-plan:9.9.9.9")).allowed).toBe(true);
  });

  it("degrades to the in-memory limiter if the binding throws", async () => {
    const limit = vi.fn().mockRejectedValue(new Error("limiter down"));
    getCloudflareContext.mockReturnValue({ env: { FORM_RATE_LIMITER: { limit } } });
    const r = await rateLimit("contact:degraded", { max: 1 });
    expect(r.allowed).toBe(true); // in-memory allowed the first hit
  });
});
