import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 3B §A — the contained Phase 3A corrections, locked at the source:
 *  - the client preview/skip notice is TRUTHFUL (never implies an unverified submission is accepted);
 *  - the Cloudflare dry-run evidence wording does not claim account resources exist.
 * The strict Turnstile action/hostname behaviour itself is exercised in forms.test.ts.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

describe("truthful preview / Turnstile-unavailable messaging (§A3)", () => {
  for (const rel of [
    "../../src/components/forms/ContactForm.tsx",
    "../../src/components/builder/PlanBuilder.tsx",
  ]) {
    const src = read(rel);
    it(`${rel} tells the truth when human verification can't run`, () => {
      // The honest wording: verification is unavailable, with the support-email fallback.
      expect(src).toContain("Human verification is currently unavailable");
      expect(src).toContain("mailto:${supportEmail}");
      // The old misleading claim (that an unverified submission is still accepted) is gone.
      expect(src).not.toContain("isn't active in this preview");
      expect(src).not.toContain("still checked");
      expect(src).not.toContain("server-side");
      // No environment/config internals are exposed to the visitor.
      expect(src).not.toMatch(/APP_ENV|TURNSTILE_SECRET|FORMS_ALLOW_INSECURE_BYPASS/);
    });
  }
});

describe("strict Turnstile outcome model (§A1/§A2)", () => {
  const src = read("../../src/lib/forms/turnstile.ts");
  it("distinguishes missing from mismatched action and hostname (behaviour tested in forms.test.ts)", () => {
    for (const outcome of [
      "action-missing",
      "action-mismatch",
      "hostname-missing",
      "hostname-mismatch",
    ]) {
      expect(src, outcome).toContain(`"${outcome}"`);
    }
    // The strict checks reject non-string / blank values (not just a wrong value).
    expect(src).toContain('typeof data.action !== "string" || data.action.length === 0');
    expect(src).toContain('typeof data.hostname !== "string" || data.hostname.length === 0');
  });
});

describe("corrected Cloudflare dry-run evidence wording (§A4)", () => {
  const report = read("../../docs/security/phase-3a-implementation-report.md");
  it("does not claim the dry-run resolved account resources, and records the true limits", () => {
    expect(report).toContain("remain externally unverified");
    expect(report).toContain("binding declarations");
    // The overstated bare claim must not stand as a plain statement of fact.
    expect(report).not.toMatch(/all 4 bindings resolve \(ASSETS/);
  });
  it("records the accurate Phase 3A branch comparison (151 ahead, 0 behind)", () => {
    expect(report).toContain("151 ahead of `main`, 0 behind");
  });
});
