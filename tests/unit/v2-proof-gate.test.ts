import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { isPublishableProof, type ProofItem, type ProofVerification } from "@/lib/content/types";
import { caseStudies, testimonials, examples } from "@/lib/content/data/proof";
import {
  getCaseStudies,
  getTestimonials,
  getExamples,
  getCaseStudy,
  getExample,
} from "@/lib/content";

/**
 * Phase 3B §D — the strengthened proof publication gate. A proof item renders ONLY with a renderable
 * status AND complete, affirmative verification metadata (consent + identity + claims + owner approval
 * + a non-empty evidence reference). The seed placeholders stay hidden by BOTH gates; no placeholder
 * is converted into real proof.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

const fullVerification: ProofVerification = {
  consentConfirmed: true,
  identityApproved: true,
  claimsVerified: true,
  approvedForPublication: true,
  evidenceReference: "INTERNAL-REF-001",
};

describe("isPublishableProof — status AND verification both required", () => {
  it("hides a placeholder even with complete verification (render gate wins)", () => {
    const item: ProofItem = { status: "placeholder", verification: fullVerification };
    expect(isPublishableProof(item)).toBe(false);
  });

  it("hides draft / approvalRequired even with complete verification", () => {
    for (const status of ["draft", "approvalRequired"] as const) {
      expect(isPublishableProof({ status, verification: fullVerification })).toBe(false);
    }
  });

  it("hides a renderable item with NO verification metadata", () => {
    expect(isPublishableProof({ status: "verified" })).toBe(false);
    expect(isPublishableProof({ status: "readyToPublish" })).toBe(false);
  });

  it("requires EVERY verification flag — any single missing flag hides it", () => {
    const flags = [
      "consentConfirmed",
      "identityApproved",
      "claimsVerified",
      "approvedForPublication",
    ] as const;
    for (const missing of flags) {
      const v = { ...fullVerification, [missing]: false };
      expect(isPublishableProof({ status: "verified", verification: v }), missing).toBe(false);
    }
  });

  it("requires a non-empty evidence reference", () => {
    for (const evidenceReference of ["", "   "]) {
      const v = { ...fullVerification, evidenceReference };
      expect(isPublishableProof({ status: "verified", verification: v })).toBe(false);
    }
  });

  it("publishes ONLY when the status is renderable AND all verification is complete", () => {
    expect(isPublishableProof({ status: "verified", verification: fullVerification })).toBe(true);
    expect(isPublishableProof({ status: "readyToPublish", verification: fullVerification })).toBe(
      true,
    );
  });
});

describe("seed proof stays hidden (placeholders, no verification)", () => {
  it("no seed proof item is publishable", () => {
    for (const item of [...caseStudies, ...testimonials, ...examples]) {
      expect(isPublishableProof(item)).toBe(false);
      // Belt and braces: placeholders carry no verification metadata.
      expect(item.verification).toBeUndefined();
      expect(item.status).toBe("placeholder");
    }
  });

  it("the public getters return nothing, and single-item lookups 404 (undefined)", async () => {
    expect(await getCaseStudies()).toEqual([]);
    expect(await getTestimonials()).toEqual([]);
    expect(await getExamples()).toEqual([]);
    expect(await getCaseStudy("placeholder-case-study-one")).toBeUndefined();
    expect(await getExample("placeholder-example-one")).toBeUndefined();
  });
});

describe("the gate is applied in both modes (seed + live Sanity)", () => {
  it("proof getters pass isPublishableProof to fromSanityOrSeed (seed + live)", () => {
    const idx = read("../../src/lib/content/index.ts");
    // Each proof getter gates seed with .filter(isPublishableProof) and live with gate:isPublishableProof.
    expect((idx.match(/gate: isPublishableProof/g) ?? []).length).toBe(3);
    expect((idx.match(/\.filter\(isPublishableProof\)/g) ?? []).length).toBe(3);
  });

  it("the live GROQ filters on approval and projects the verification object", () => {
    const q = read("../../src/lib/sanity/queries.ts");
    expect(q).toContain("proofVerification.approvedForPublication == true");
    expect(q).toContain('"verification": proofVerification{');
    for (const field of [
      "consentConfirmed",
      "identityApproved",
      "claimsVerified",
      "approvedForPublication",
      "evidenceReference",
    ]) {
      expect(q, field).toContain(field);
    }
  });

  it("fromSanityOrSeed honours a custom gate (defaults to isRenderable)", () => {
    const f = read("../../src/lib/sanity/fetch.ts");
    expect(f).toContain("gate?: (item: TOut) => boolean");
    expect(f).toContain("opts.gate ?? isRenderable");
  });
});
