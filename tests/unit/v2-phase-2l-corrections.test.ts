import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2M §A — regression guards for the Phase 2L corrections. These pin the real legacy
 * starfield dependency chain (so the corrected performance narrative cannot drift while those
 * components remain in the repo), and prove the Phase 2L report + tests were corrected.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");

describe("legacy cosmic hero dependency chain (client starfield boundary + canvas)", () => {
  it("CosmicPageHero renders CosmicBackground", () => {
    const src = read("../../src/components/routes/CosmicPageHero.tsx");
    expect(src).toMatch(/import\s*\{\s*CosmicBackground\s*\}/);
    expect(src).toMatch(/<CosmicBackground/);
  });

  it("CosmicBackground renders the StarfieldLazy boundary by default (stars defaults to true)", () => {
    const src = read("../../src/components/viz/CosmicBackground.tsx");
    expect(src).toMatch(/import\s*\{\s*StarfieldLazy\s*\}/);
    expect(src).toMatch(/stars\s*=\s*true/);
    expect(src).toMatch(/stars\s*\?\s*<StarfieldLazy/);
  });

  it("StarfieldLazy is a client boundary that dynamically loads the Starfield", () => {
    const src = read("../../src/components/viz/StarfieldLazy.tsx");
    expect(src.trimStart().startsWith('"use client"'), "StarfieldLazy is a client component").toBe(true);
    expect(src).toMatch(/dynamic\(\(\)\s*=>\s*import\(".\/Starfield"\)/);
  });

  it("Starfield is a client component that paints a <canvas>", () => {
    const src = read("../../src/components/viz/Starfield.tsx");
    expect(src.trimStart().startsWith('"use client"'), "Starfield is a client component").toBe(true);
    expect(src).toMatch(/<canvas/);
  });
});

describe("Phase 2L report was corrected", () => {
  const report = read("../../docs/design/phase-2l-implementation-report.md");

  it("no longer claims the legacy routes had zero canvas / zero client boundaries", () => {
    // The corrected report must acknowledge the starfield chain rather than asserting 0/0.
    expect(report).toMatch(/StarfieldLazy/);
    expect(report).toMatch(/starfield/i);
    expect(report).not.toMatch(/already \*\*fully server-rendered with zero route-level client components and zero/);
  });

  it("states exact JS-byte / LCP / CLS reductions were not measured", () => {
    expect(report).toMatch(/not\s+measured|were not run|no invented/i);
  });

  it("its next-scope statement includes ServiceDomainTemplate (not out of scope)", () => {
    expect(report).toMatch(/ServiceDomainTemplate/);
    expect(report).toMatch(/16 current service categories (delegate to|use)[\s\S>`]{0,12}ServiceDomainTemplate/i);
  });
});

describe("test corrections landed", () => {
  it("the homepage above-fold test measures a computed support line-height", () => {
    const spec = read("../../tests/e2e/homepage.spec.ts");
    expect(spec).toMatch(/getComputedStyle\(el\)/);
    expect(spec).toMatch(/lineHeight/);
    expect(spec).not.toMatch(/supportBox!\.y \+ 20/); // the hard-coded approximation is gone
  });

  it("the brand no-JS blocks assert route-specific full content", () => {
    const spec = read("../../tests/e2e/brand-ownership-connected.spec.ts");
    expect(spec).toMatch(/\/about — without JavaScript/);
    expect(spec).toMatch(/\/account-ownership — without JavaScript/);
    expect(spec).toMatch(/\/connected-growth — without JavaScript/);
    expect(spec).toMatch(/We help build the system\. You keep control of it\./); // ownership closing
    expect(spec).toMatch(/Rewards unlocked/); // a connected-growth screen heading
  });

  it("the DeliveryModelsExplainerSection comment documents the conditional card ids", () => {
    const src = read("../../src/components/sections/DeliveryModelsExplainerSection.tsx");
    expect(src).toMatch(/CONDITIONAL on `cardFragmentTargets`/);
  });
});
