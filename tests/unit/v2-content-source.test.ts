import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 3B §H/§I — the content-source model + Sanity fallback visibility, and the release-blocker /
 * publishing docs. Seed is the production default; live Sanity is flag-gated; a failure degrades to
 * seed VISIBLY but logs only a short reason (never the query, params, or a document body); a
 * successful empty live result stays authoritative.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

describe("sanityFetch fallback logging is visible but redacted", () => {
  const src = read("../../src/lib/sanity/fetch.ts");
  it("logs a visible warn on failure, with only a reason (no query/params/body)", () => {
    expect(src).toContain("console.warn(`[sanity] live query failed");
    expect(src).toContain("falling back to seed content");
    // Only a short reason is logged — not the raw error object, query, or params.
    expect(src).toContain("err instanceof Error ? err.name");
    expect(src).not.toMatch(/console\.warn\([^)]*,\s*err\s*\)/); // never logs the raw err object
  });
  it("keeps the flag-gated, empty-authoritative, fail-to-seed semantics", () => {
    expect(src).toContain(
      "if (!sanityLiveContentEnabled || !isSanityConfigured || !opts.query) return opts.seed",
    );
    expect(src).toContain("if (docs === null) return opts.seed");
  });
});

describe("content docs cover the model and the blockers", () => {
  it("the publishing runbook documents seed-default, flag-gating, fallback, proof + legal + approvals", () => {
    const rb = read("../../docs/content/content-publishing-runbook.md");
    for (const needle of [
      "Production default",
      "NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED",
      "authoritative",
      "isPublishableProof",
      "legalReviewStatus",
      "Rollback",
      "Who must approve",
    ]) {
      expect(rb, needle).toContain(needle);
    }
  });
  it("the release-blocker register classifies every required category", () => {
    const bl = read("../../docs/content/phase-3b-release-blockers.md");
    for (const cls of ["[repo]", "[owner]", "[legal]", "[proof]", "[cloudflare]", "[3C]"]) {
      expect(bl, cls).toContain(cls);
    }
    for (const item of [
      "Professional review of all 5 legal pages",
      "retention",
      "Real case studies",
      "Account-ownership policy confirmation",
      "Pricing model decision",
      "Production secrets",
      "Next.js security patch",
      "visual certification",
      "Merge to `main`",
    ]) {
      expect(bl, item).toContain(item);
    }
  });
});
