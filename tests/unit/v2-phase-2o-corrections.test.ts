import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2P — the contained Phase 2O corrections: the report-accuracy fixes (a FinalCtaSection was
 * ADDED, not a banner replaced; behavior-for-behavior, not byte-for-byte) and the compatibility-safe
 * V2 invalid-control border (V2 appearance → --v2-danger, legacy appearance → --danger, exactly one
 * applied, no !important).
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const readCss = (rel: string) => read(rel).replace(/\/\*[\s\S]*?\*\//g, "");

describe("Phase 2O report accuracy corrections", () => {
  const report = read("../../docs/design/phase-2o-implementation-report.md");

  it("states the contact FinalCtaSection was added, not that a banner was replaced", () => {
    expect(report).toMatch(/old route had no `?FinalCtaBannerSection/);
    expect(report).toMatch(/a \*\*new\*\* single reserved-night FinalCtaSection/);
  });

  it("describes the ContactForm preservation as behavior-for-behavior, not byte-for-byte", () => {
    expect(report).toContain("behavior-for-behavior");
    expect(report).not.toMatch(/byte-for-byte intact/);
  });

  it("describes the contact no-JS select coverage as exhaustive", () => {
    expect(report).toMatch(/all three selects'? options[\s\S]{0,30}exact value, label[\s\S]{0,10}and order/i);
  });
});

describe("V2 invalid-control border (compatibility-safe)", () => {
  const v2 = readCss("../../src/components/forms/FormFieldV2.module.css");
  const legacy = readCss("../../src/components/forms/FormField.module.css");
  const formField = read("../../src/components/forms/FormField.tsx");

  it("the V2 module gives invalid controls a --v2-danger border and error text", () => {
    expect(v2).toMatch(/\.hasError[\s\S]*?border-color:\s*var\(--v2-danger\)/);
    expect(v2).toMatch(/\.error[\s\S]*?color:\s*var\(--v2-danger\)/);
  });

  it("the legacy module still uses --danger (unchanged for its consumers)", () => {
    expect(legacy).toMatch(/\.hasError[\s\S]*?border-color:\s*var\(--danger\)/);
  });

  it("FormField applies the V2 error wrapper only for the v2 appearance, and never both", () => {
    // Exactly one wrapper class is chosen by appearance — no specificity fight, no !important.
    expect(formField).toMatch(/error \? \(appearance === "v2" \? v2\.hasError : styles\.hasError\) : ""/);
    expect(formField).not.toContain("!important");
    // The error text also switches to the V2 ink on the v2 appearance.
    expect(formField).toMatch(/appearance === "v2" \? v2\.error : styles\.error/);
  });

  it("ContactForm opts into the V2 appearance, so its invalid fields use the V2 danger path", () => {
    const contactForm = read("../../src/components/forms/ContactForm.tsx");
    expect((contactForm.match(/appearance="v2"/g) ?? []).length).toBe(8);
  });
});
