import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2P API-safety guard. The growth-plan route is a PROTECTED file — the V2 migration is
 * presentation-only and must not touch the server contract. These source-lock checks pin the parts
 * a future edit could quietly weaken: the six response codes, the honeypot + timing + rate-limit +
 * Turnstile gates, the deterministic recompute, and the support-inbox forwarding of the
 * recommendation summary + matched rule id. The matched rule id goes ONLY to the team's inbox — it
 * is never returned to the client (the success body is exactly {ok:true}).
 */
const route = readFileSync(
  fileURLToPath(new URL("../../src/app/api/forms/growth-plan/route.ts", import.meta.url)),
  "utf8",
);

describe("growth-plan API route — preserved contract", () => {
  it("validates with growthPlanSchema and recomputes with the deterministic engine", () => {
    expect(route).toContain("growthPlanSchema.safeParse");
    expect(route).toMatch(/resolve\(\s*\{[\s\S]*?\},\s*growthPlanRuleSet,?\s*\)/);
  });

  it("keeps every response code (the six original + the Phase 3A request-boundary codes)", () => {
    for (const code of [
      "unsupported-media-type",
      "payload-too-large",
      "invalid-json",
      "validation-error",
      "rate-limited",
      "turnstile-failed",
      "delivery-unavailable",
      "delivery-failed",
    ]) {
      expect(route, code).toContain(`code: "${code}"`);
    }
  });

  it("reads the body through the bounded reader and returns a request id on every response", () => {
    expect(route).toContain("readJsonBody(req)");
    expect(route).toContain("newRequestId()");
    expect(route).toContain('"X-Request-ID": requestId');
    // No direct req.json() — the bounded reader replaces it (§C).
    expect(route).not.toContain("req.json()");
  });

  it("keeps the bot gates (honeypot, human-timing, rate limit, Turnstile)", () => {
    expect(route).toContain("values._gotcha");
    expect(route).toMatch(/MIN_HUMAN_MS\s*=\s*1500/);
    expect(route).toContain("elapsedMs < MIN_HUMAN_MS");
    expect(route).toContain("rateLimit(");
    expect(route).toContain("verifyTurnstile(");
  });

  it("forwards the recommendation summary and matched rule id to the support inbox", () => {
    expect(route).toContain("forwardToFormspree(");
    expect(route).toContain("recommendationSummary: formatRecommendationForEmail(result)");
    expect(route).toContain("matchedRuleId: result.matchedRuleId");
  });

  it("never leaks the matched rule id to the client — it appears only in server→inbox code", () => {
    // Three references, all server→inbox: the email body line, and the forward payload key + value.
    // A client NextResponse.json(...) referencing it would push this higher.
    expect((route.match(/matchedRuleId/g) ?? []).length).toBe(3);
    // The delivered response carries no plan/rule payload — it is exactly {ok:true} (via the
    // request-id `respond` helper, which is the only place that builds a NextResponse).
    expect(route).toContain("return respond({ ok: true });");
    expect(route).not.toMatch(/respond\(\{[^}]*matchedRuleId/);
    expect(route).not.toMatch(/NextResponse\.json\(\{[^}]*matchedRuleId/);
  });

  it("never claims success when delivery is not configured or fails", () => {
    expect(route).toContain('deliveryEnabled("growth-plan")');
    expect(route).toContain("!delivery.delivered");
  });
});
