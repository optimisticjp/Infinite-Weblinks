import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2J §B homepage safety. The /how-it-works migration must NOT change the homepage: it uses
 * new, separately-named V2 sections rather than a shared default. This guards the homepage source
 * so a future edit that swaps its legacy sections for the V2 ones fails a test.
 */
const homepage = readFileSync(
  fileURLToPath(new URL("../../src/app/(marketing)/page.tsx", import.meta.url)),
  "utf8",
);

describe("homepage composition is untouched by the how-it-works migration", () => {
  it("still imports and renders the legacy home sections", () => {
    for (const legacy of ["ConnectedGrowthSection", "OneSystemSection", "DeliveryModelsSection"]) {
      expect(homepage, `homepage keeps ${legacy}`).toContain(legacy);
    }
  });

  it("does NOT import any of the V2 how-it-works replacement sections", () => {
    for (const v2 of [
      "GrowthJourneyOverviewSection",
      "ConnectedSystemExplainerSection",
      "WorkProcessSection",
      "DeliveryModelsExplainerSection",
    ]) {
      expect(homepage, `homepage must not use ${v2}`).not.toContain(v2);
    }
  });

  it("still renders a single homepage Hero (the H1 source) and its own metadata", () => {
    expect(homepage).toContain("<Hero hero={hero} />");
    expect(homepage).toMatch(/canonical\("\/"\)/);
  });
});
