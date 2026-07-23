import { describe, it, expect } from "vitest";
// The verifier is a read-only .mjs script that also exports its analyzer for testing.
import { analyzeCloudflareConfig } from "../../scripts/verify-cloudflare-config.mjs";

/**
 * Phase 3A (§H) — the read-only Cloudflare production-readiness verifier. It must (a) never take an
 * action (this test never passes runBundleDryRun), (b) prove the repo-checkable facts locally
 * (binding names + OpenNext consistency + no KV + the rate-limit name matching the code), and (c)
 * classify the account-side facts (real resource ids, secrets) as external-verification-required —
 * with the shipped D1 id flagged as the LOCAL placeholder. With the repo config valid, there are no
 * blockers.
 */

describe("analyzeCloudflareConfig (static, read-only)", () => {
  const report = analyzeCloudflareConfig();
  const byId = new Map(report.checks.map((c) => [c.id, c]));

  it("returns a well-formed report with no blockers for the current repo config", () => {
    expect(report.ok).toBe(true);
    expect(report.summary.blockers).toBe(0);
    expect(report.summary.verifiedLocally).toBeGreaterThan(0);
    expect(report.summary.externalRequired).toBeGreaterThan(0);
  });

  it("verifies the binding names and OpenNext consistency locally", () => {
    for (const id of [
      "worker-main",
      "compat-nodejs",
      "assets-binding",
      "r2-inc-cache",
      "d1-tag-cache",
      "no-kv",
      "rate-limiter-binding",
    ]) {
      expect(byId.get(id)?.status, id).toBe("verified-locally");
    }
  });

  it("flags the shipped D1 database_id as the local placeholder needing external verification", () => {
    const d1 = byId.get("d1-id-real");
    expect(d1?.status).toBe("external-verification-required");
    expect(d1?.detail).toMatch(/placeholder/i);
  });

  it("classifies resource existence, the rate-limit namespace id and secrets as external", () => {
    for (const id of ["r2-bucket-exists", "rate-limit-namespace", "worker-secrets"]) {
      expect(byId.get(id)?.status, id).toBe("external-verification-required");
    }
    // Secrets guidance must name APP_ENV=production and warn the bypass flag off.
    expect(byId.get("worker-secrets")?.detail).toContain("APP_ENV=production");
    expect(byId.get("worker-secrets")?.detail).toContain("FORMS_ALLOW_INSECURE_BYPASS must NOT");
  });

  it("uses only the three documented statuses", () => {
    const allowed = new Set(["verified-locally", "external-verification-required", "blocker"]);
    for (const c of report.checks) expect(allowed.has(c.status), `${c.id}:${c.status}`).toBe(true);
  });
});
