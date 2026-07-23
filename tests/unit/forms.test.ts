import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { contactSchema, growthPlanSchema } from "@/lib/validation/forms";
import { checkRateLimit, _resetRateLimitForTests } from "@/lib/forms/rate-limit";

describe("contactSchema", () => {
  const base = {
    name: "Jordan Rivers",
    email: "jordan@example.com",
    message: "I'd like to talk about your services please.",
  };

  it("accepts a valid submission", () => {
    expect(contactSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a name under 2 characters", () => {
    expect(contactSchema.safeParse({ ...base, name: "A" }).success).toBe(false);
  });

  it("rejects a name over 80 characters", () => {
    expect(contactSchema.safeParse({ ...base, name: "A".repeat(81) }).success).toBe(false);
  });

  it("rejects an invalid email address", () => {
    expect(contactSchema.safeParse({ ...base, email: "not-an-email" }).success).toBe(false);
  });

  it("rejects header-injection attempts in the email field", () => {
    const result = contactSchema.safeParse({
      ...base,
      email: "jordan@example.com\r\nBcc: attacker@evil.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a comma or semicolon smuggled into the name field", () => {
    expect(contactSchema.safeParse({ ...base, name: "Jordan, Rivers" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...base, name: "Jordan; Rivers" }).success).toBe(false);
  });

  it("rejects a newline smuggled into the name field", () => {
    expect(contactSchema.safeParse({ ...base, name: "Jordan\nRivers" }).success).toBe(false);
  });

  it("rejects a message under 10 characters", () => {
    expect(contactSchema.safeParse({ ...base, message: "short" }).success).toBe(false);
  });

  it("rejects a message over 1000 characters", () => {
    expect(contactSchema.safeParse({ ...base, message: "a".repeat(1001) }).success).toBe(false);
  });

  it("accepts a message at the boundary lengths (10 and 1000 chars)", () => {
    expect(contactSchema.safeParse({ ...base, message: "a".repeat(10) }).success).toBe(true);
    expect(contactSchema.safeParse({ ...base, message: "a".repeat(1000) }).success).toBe(true);
  });

  it("accepts optional business-type / stage / goal slugs", () => {
    expect(
      contactSchema.safeParse({
        ...base,
        businessType: "ecommerce",
        currentStage: "get-discovered",
        mainGoal: "turn-visitors-into-buyers",
      }).success,
    ).toBe(true);
  });

  it("treats an empty or missing context select as 'no answer'", () => {
    expect(contactSchema.safeParse({ ...base, businessType: "" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...base, mainGoal: undefined }).success).toBe(true);
    expect(contactSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a malformed context slug", () => {
    expect(contactSchema.safeParse({ ...base, mainGoal: "Not A Slug!" }).success).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(contactSchema.safeParse({ ...base, _gotcha: "I am a bot" }).success).toBe(false);
  });

  it("accepts an empty or missing honeypot", () => {
    expect(contactSchema.safeParse({ ...base, _gotcha: "" }).success).toBe(true);
    expect(contactSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a company name over 120 characters", () => {
    expect(contactSchema.safeParse({ ...base, company: "a".repeat(121) }).success).toBe(false);
  });

  it("accepts an optional website, whether a bare domain or a full URL", () => {
    expect(contactSchema.safeParse({ ...base, website: "acme.com" }).success).toBe(true);
    expect(
      contactSchema.safeParse({ ...base, website: "https://acme.co.uk/pricing" }).success,
    ).toBe(true);
  });

  it("accepts a missing or empty website", () => {
    expect(contactSchema.safeParse(base).success).toBe(true);
    expect(contactSchema.safeParse({ ...base, website: "" }).success).toBe(true);
  });

  it("rejects a website over 200 characters", () => {
    expect(
      contactSchema.safeParse({ ...base, website: `https://${"a".repeat(200)}.com` }).success,
    ).toBe(false);
  });

  it("rejects newline-smuggling in the website field", () => {
    expect(
      contactSchema.safeParse({ ...base, website: "acme.com\r\nBcc: attacker@evil.com" }).success,
    ).toBe(false);
  });
});

describe("growthPlanSchema", () => {
  const base = {
    businessType: "ecommerce",
    currentStage: "get-discovered",
    mainGoal: "convert-visitors",
    existingSetup: "I have a website or store" as const,
    engagement: "Not sure yet" as const,
    timeline: "Just exploring for now" as const,
    name: "Jordan Rivers",
    email: "jordan@example.com",
  };

  it("accepts a valid submission with no message", () => {
    expect(growthPlanSchema.safeParse(base).success).toBe(true);
  });

  it("accepts a valid submission with an optional message", () => {
    expect(growthPlanSchema.safeParse({ ...base, message: "Some extra context." }).success).toBe(
      true,
    );
  });

  it("rejects an existingSetup value outside the locked, neutral options", () => {
    expect(
      growthPlanSchema.safeParse({ ...base, existingSetup: "Something else entirely" }).success,
    ).toBe(false);
  });

  it("rejects an engagement value outside the neutral, currency-free ranges", () => {
    expect(growthPlanSchema.safeParse({ ...base, engagement: "$5,000/month" }).success).toBe(false);
  });

  it("rejects a timeline value that isn't one of the locked options", () => {
    expect(growthPlanSchema.safeParse({ ...base, timeline: "Whenever, I guess" }).success).toBe(
      false,
    );
  });

  it("rejects a malformed slug for businessType", () => {
    expect(growthPlanSchema.safeParse({ ...base, businessType: "Not A Slug!" }).success).toBe(
      false,
    );
  });

  it("rejects an empty businessType", () => {
    expect(growthPlanSchema.safeParse({ ...base, businessType: "" }).success).toBe(false);
  });

  it("rejects header injection in the email field", () => {
    expect(
      growthPlanSchema.safeParse({ ...base, email: "jordan@example.com\r\nBcc: evil@example.com" })
        .success,
    ).toBe(false);
  });

  it("rejects a filled honeypot", () => {
    expect(growthPlanSchema.safeParse({ ...base, _gotcha: "spam" }).success).toBe(false);
  });

  it("rejects a name under the 2-character minimum", () => {
    expect(growthPlanSchema.safeParse({ ...base, name: "A" }).success).toBe(false);
  });
});

describe("verifyTurnstile (Phase 3A — fail-closed, typed, action + hostname pinned)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
    vi.useRealTimers();
    vi.resetModules();
  });

  it("fails CLOSED as 'missing-config' (unavailable) when keys are absent and no bypass is set", async () => {
    // Default test env: no FORMS_ALLOW_INSECURE_BYPASS ⇒ the not-configured state is NOT trusted.
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.stubEnv("FORMS_ALLOW_INSECURE_BYPASS", "");
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { verifyTurnstile } = await import("@/lib/forms/turnstile");
    const result = await verifyTurnstile("any-token", { expectedAction: "contact" });

    expect(result.ok).toBe(false);
    expect(result.outcome).toBe("missing-config");
    expect(result.disposition).toBe("unavailable");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("bypasses ONLY when explicitly opted in (dev/test) — outcome 'dev-bypass', still no network", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    vi.stubEnv("FORMS_ALLOW_INSECURE_BYPASS", "true");
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { verifyTurnstile } = await import("@/lib/forms/turnstile");
    const result = await verifyTurnstile(undefined, { expectedAction: "contact" });

    expect(result.ok).toBe(true);
    expect(result.outcome).toBe("dev-bypass");
    expect(result.disposition).toBe("pass");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("verifies a token when configured and the action matches (fetch mocked)", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-key");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: "contact", hostname: "infiniteweblinks.com" }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { verifyTurnstile } = await import("@/lib/forms/turnstile");
    const result = await verifyTurnstile("good-token", { expectedAction: "contact", ip: "1.2.3.4" });

    expect(result.ok).toBe(true);
    expect(result.outcome).toBe("verified");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("challenges.cloudflare.com/turnstile/v0/siteverify");
    expect(init.method).toBe("POST");
    // The visitor IP is forwarded as remoteip.
    expect((init.body as URLSearchParams).get("remoteip")).toBe("1.2.3.4");
  });

  it("rejects a token minted for a DIFFERENT action (replay across forms) as human-failed", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-key");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: "growth-plan" }),
    }) as unknown as typeof fetch;

    const { verifyTurnstile } = await import("@/lib/forms/turnstile");
    const result = await verifyTurnstile("token", { expectedAction: "contact" });

    expect(result.ok).toBe(false);
    expect(result.outcome).toBe("action-mismatch");
    expect(result.disposition).toBe("human-failed");
  });

  it("rejects a token solved on a hostname we don't allow when hostname enforcement is on", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-key");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://infiniteweblinks.com");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, action: "contact", hostname: "evil.example" }),
    }) as unknown as typeof fetch;

    const { verifyTurnstile } = await import("@/lib/forms/turnstile");
    const result = await verifyTurnstile("token", { expectedAction: "contact" });

    expect(result.ok).toBe(false);
    expect(result.outcome).toBe("hostname-mismatch");
    expect(result.disposition).toBe("human-failed");
  });

  it("fails as 'invalid-token' (human-failed) when Cloudflare rejects the token", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-key");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }),
    }) as unknown as typeof fetch;

    const { verifyTurnstile } = await import("@/lib/forms/turnstile");
    const result = await verifyTurnstile("bad-token", { expectedAction: "contact" });

    expect(result.ok).toBe(false);
    expect(result.outcome).toBe("invalid-token");
    expect(result.disposition).toBe("human-failed");
    expect(result.errorCodes).toContain("invalid-input-response");
  });

  it("fails as 'missing-token' (human-failed) when configured but no token is supplied", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-key");
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { verifyTurnstile } = await import("@/lib/forms/turnstile");
    const result = await verifyTurnstile(undefined, { expectedAction: "contact" });

    expect(result.ok).toBe(false);
    expect(result.outcome).toBe("missing-token");
    expect(result.disposition).toBe("human-failed");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fails as 'http-failure' (unavailable) on a non-2xx siteverify response", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-key");
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 502 }) as unknown as typeof fetch;

    const { verifyTurnstile } = await import("@/lib/forms/turnstile");
    const result = await verifyTurnstile("token", { expectedAction: "contact" });

    expect(result.ok).toBe(false);
    expect(result.outcome).toBe("http-failure");
    expect(result.disposition).toBe("unavailable");
    expect(result.errorCodes).toContain("http-502");
  });

  it("fails as 'network' (unavailable) when the request throws before a response", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-key");
    global.fetch = vi.fn().mockRejectedValue(new Error("network down")) as unknown as typeof fetch;

    const { verifyTurnstile } = await import("@/lib/forms/turnstile");
    const result = await verifyTurnstile("token", { expectedAction: "contact" });

    expect(result.ok).toBe(false);
    expect(result.outcome).toBe("network");
    expect(result.disposition).toBe("unavailable");
  });

  it("fails as 'malformed' (unavailable) when siteverify returns an unexpected body", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-key");
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ unexpected: "shape" }),
    }) as unknown as typeof fetch;

    const { verifyTurnstile } = await import("@/lib/forms/turnstile");
    const result = await verifyTurnstile("token", { expectedAction: "contact" });

    expect(result.ok).toBe(false);
    expect(result.outcome).toBe("malformed");
    expect(result.disposition).toBe("unavailable");
  });

  it("fails CLOSED as 'timeout' (unavailable) when siteverify exceeds the bounded timeout", async () => {
    vi.stubEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", "site-key");
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret-key");
    vi.useFakeTimers();
    // A fetch that never resolves on its own — it only settles when our AbortController fires.
    global.fetch = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("The operation was aborted.", "AbortError")),
          );
        }),
    ) as unknown as typeof fetch;

    const { verifyTurnstile } = await import("@/lib/forms/turnstile");
    const { TURNSTILE_TIMEOUT_MS } = await import("@/lib/forms/config.server");
    const pending = verifyTurnstile("token", { expectedAction: "contact" });
    await vi.advanceTimersByTimeAsync(TURNSTILE_TIMEOUT_MS + 10);
    const result = await pending;

    expect(result.ok).toBe(false);
    expect(result.outcome).toBe("timeout");
    expect(result.disposition).toBe("unavailable");
  });
});

describe("forwardToFormspree", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("reports not-configured (never a false positive) when no Formspree id is set", async () => {
    vi.stubEnv("FORMSPREE_CONTACT_ID", "");
    vi.stubEnv("FORMSPREE_GROWTH_PLAN_ID", "");
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { forwardToFormspree } = await import("@/lib/forms/formspree");
    const result = await forwardToFormspree("contact", { name: "A", email: "a@example.com" });

    expect(result).toEqual({ delivered: false, reason: "not-configured" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("delivers successfully when configured and Formspree accepts the payload", async () => {
    vi.stubEnv("FORMSPREE_CONTACT_ID", "abcd1234");
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { forwardToFormspree } = await import("@/lib/forms/formspree");
    const result = await forwardToFormspree("contact", {
      name: "A",
      email: "a@example.com",
      message: "hi",
    });

    expect(result).toEqual({ delivered: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://formspree.io/f/abcd1234",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("reports failure when Formspree responds with a non-2xx status", async () => {
    vi.stubEnv("FORMSPREE_CONTACT_ID", "abcd1234");
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;

    const { forwardToFormspree } = await import("@/lib/forms/formspree");
    const result = await forwardToFormspree("contact", { name: "A", email: "a@example.com" });

    expect(result.delivered).toBe(false);
    expect(result.reason).toContain("500");
  });

  it("reports failure on a network error rather than claiming delivery", async () => {
    vi.stubEnv("FORMSPREE_CONTACT_ID", "abcd1234");
    global.fetch = vi.fn().mockRejectedValue(new Error("down")) as unknown as typeof fetch;

    const { forwardToFormspree } = await import("@/lib/forms/formspree");
    const result = await forwardToFormspree("contact", { name: "A", email: "a@example.com" });

    expect(result.delivered).toBe(false);
  });

  it("rejects header injection in an email-like field before ever calling fetch", async () => {
    vi.stubEnv("FORMSPREE_CONTACT_ID", "abcd1234");
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const { forwardToFormspree } = await import("@/lib/forms/formspree");
    const result = await forwardToFormspree("contact", {
      name: "A",
      email: "a@example.com\nBcc: evil@example.com",
    });

    expect(result.delivered).toBe(false);
    expect(result.reason).toBe("invalid-field");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("checkRateLimit", () => {
  beforeEach(() => {
    _resetRateLimitForTests();
  });

  it("allows requests up to the configured maximum", () => {
    const key = "test:1.1.1.1";
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(key, { max: 3, windowMs: 60_000 }).allowed).toBe(true);
    }
  });

  it("blocks once the limit is exceeded within the same window", () => {
    const key = "test:2.2.2.2";
    checkRateLimit(key, { max: 2, windowMs: 60_000 });
    checkRateLimit(key, { max: 2, windowMs: 60_000 });
    const third = checkRateLimit(key, { max: 2, windowMs: 60_000 });
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets the counter once the window elapses", () => {
    vi.useFakeTimers();
    try {
      const key = "test:3.3.3.3";
      expect(checkRateLimit(key, { max: 1, windowMs: 1000 }).allowed).toBe(true);
      expect(checkRateLimit(key, { max: 1, windowMs: 1000 }).allowed).toBe(false);
      vi.advanceTimersByTime(1001);
      expect(checkRateLimit(key, { max: 1, windowMs: 1000 }).allowed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it("tracks separate keys (e.g. different forms or IPs) independently", () => {
    checkRateLimit("form-a:1.1.1.1", { max: 1 });
    const other = checkRateLimit("form-b:1.1.1.1", { max: 1 });
    expect(other.allowed).toBe(true);
  });
});
