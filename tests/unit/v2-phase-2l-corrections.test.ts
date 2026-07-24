import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2M §A — regression guards for the Phase 2L corrections. The legacy cosmic/starfield
 * dependency chain these once pinned was proven dead and removed in Phase 2S; this now asserts the
 * whole chain is gone, and still proves the Phase 2L report + tests were corrected.
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const missing = (rel: string) => {
  try {
    read(rel);
    return false;
  } catch {
    return true;
  }
};

describe("the legacy cosmic hero dependency chain was removed in Phase 2S", () => {
  it("CosmicPageHero, CosmicBackground, StarfieldLazy and Starfield no longer exist", () => {
    for (const rel of [
      "../../src/components/routes/CosmicPageHero.tsx",
      "../../src/components/viz/CosmicBackground.tsx",
      "../../src/components/viz/StarfieldLazy.tsx",
      "../../src/components/viz/Starfield.tsx",
      "../../src/components/viz/GlobeArc.tsx",
    ]) {
      expect(missing(rel), `${rel} removed`).toBe(true);
    }
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
