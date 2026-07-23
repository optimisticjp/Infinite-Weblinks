import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { legalPages } from "@/lib/content/data/legal";
import type { LegalReviewStatus } from "@/lib/content/types";

/**
 * Phase 3B §B — legal-review status is EXPLICIT and separate from the render (ContentStatus) gate.
 * Renderability and legal approval are different facts: a legal page can render (status "verified")
 * while its wording is still a draft awaiting professional review. Nothing here marks a page
 * professionally reviewed (that needs owner-supplied confirmation), and no draft loses its notice.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const VALID: LegalReviewStatus[] = ["draft", "professionallyReviewed"];

describe("legal pages — explicit review status", () => {
  it("every legal page declares an explicit legalReviewStatus", () => {
    expect(legalPages.length).toBeGreaterThan(0);
    for (const p of legalPages) {
      expect(VALID, `${p.slug} status`).toContain(p.legalReviewStatus);
    }
  });

  it("NO current legal page is marked professionally reviewed", () => {
    for (const p of legalPages) {
      expect(p.legalReviewStatus, `${p.slug}`).toBe("draft");
      // A draft must never carry a review reference / date that would imply approval.
      expect(p.reviewedAt, `${p.slug} reviewedAt`).toBeUndefined();
      expect(p.reviewReference, `${p.slug} reviewReference`).toBeUndefined();
    }
  });

  it("every draft page carries a visible review notice", () => {
    for (const p of legalPages.filter((x) => x.legalReviewStatus === "draft")) {
      expect(p.reviewNote, `${p.slug} reviewNote`).toBeTruthy();
      expect(p.reviewNote).toMatch(/professional legal review/i);
    }
  });

  it("review status CANNOT be inferred from ContentStatus (the two are independent)", () => {
    // Every page renders (verified) yet is a legal DRAFT — proving the fields are decoupled.
    for (const p of legalPages) {
      expect(p.status).toBe("verified");
      expect(p.legalReviewStatus).toBe("draft");
    }
    // The type is a distinct union, not ContentStatus.
    const t = read("../../src/lib/content/types.ts");
    expect(t).toContain('export type LegalReviewStatus = "draft" | "professionallyReviewed"');
  });
});

describe("LegalPageView — represents the review state, never silently drops the notice", () => {
  const view = read("../../src/components/routes/LegalPageView.tsx");
  it("branches on the explicit legalReviewStatus and renders an accessible notice", () => {
    expect(view).toContain('page.legalReviewStatus === "professionallyReviewed"');
    expect(view).toContain("Legal review status:");
    expect(view).toContain('role="note"');
    // The draft branch surfaces the reviewNote (or a draft default) — never nothing.
    expect(view).toContain("page.reviewNote ??");
  });
});

describe("stale 'lawyer-reviewed' comments are corrected", () => {
  it("no source comment claims the legal pages are lawyer-reviewed", () => {
    for (const rel of [
      "../../src/lib/content/index.ts",
      "../../src/lib/sanity/seed-transform.ts",
    ]) {
      expect(read(rel), rel).not.toMatch(/lawyer-reviewed/i);
    }
  });
});
