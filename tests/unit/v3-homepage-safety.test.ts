import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * V3 "Instrument" homepage-safety guard. The homepage is the dark-first V3 spine: a split hero whose
 * right column is the reused PlanPanel, a goal-router DataTable, and the sticky Growth Roadmap, with
 * the problem / delivery / trust / learning / final-CTA sections kept and restyled. The eight spine
 * sections keep their component names and order — only their internals changed — so this locks the
 * migrated source so a future edit cannot quietly re-introduce the cosmic engine, a page-wide 8-stage
 * router, a services constellation, fabricated proof, or the legacy homepage sections, and so the
 * server contract (canonical, JSON-LD, seed opening) is preserved.
 */
const homepage = readFileSync(
  fileURLToPath(new URL("../../src/app/(marketing)/page.tsx", import.meta.url)),
  "utf8",
);

describe("homepage renders the V3 dark-first spine", () => {
  it("imports the eight spine sections in order", () => {
    const spine = [
      "HomepageHeroSection",
      "HomepageProblemSection",
      "HomepageGoalRouterSection",
      "HomepageConnectedSystemSection",
      "DeliveryModelsExplainerSection",
      "HomepageTrustSection",
      "HomepageLearningSection",
      "FinalCtaSection",
    ];
    const positions = spine.map((name) => homepage.indexOf(`<${name}`));
    for (let i = 0; i < spine.length; i++) {
      expect(positions[i], `${spine[i]} is rendered`).toBeGreaterThan(-1);
      if (i > 0) {
        expect(positions[i], `${spine[i]} follows ${spine[i - 1]}`).toBeGreaterThan(positions[i - 1]);
      }
    }
  });

  it("configures the reused delivery section for the homepage (id + no ownership)", () => {
    expect(homepage).toMatch(/DeliveryModelsExplainerSection[^/]*id="ways-of-working"/s);
    expect(homepage).toMatch(/DeliveryModelsExplainerSection[^/]*showOwnership=\{false\}/s);
  });

  it("keeps the single dark final CTA pointed at the growth plan", () => {
    expect(homepage).toMatch(/<FinalCtaSection[\s\S]*id="get-started"/);
    expect(homepage).toMatch(/href:\s*"\/growth-plan"/);
  });
});

describe("homepage never re-introduces the heavy legacy or cosmic sections", () => {
  it("does NOT render the cosmic hero engine or legacy homepage sections", () => {
    for (const banned of [
      "HeroUniverse",
      "GoalBentoSection",
      "ConnectedGrowthSection",
      "OneSystemSection",
      "ServicesConstellationSection",
      "EditorialStatement",
      "LearningResourcesSection",
      "FinalCtaBannerSection",
      "DeliveryModelsSection",
    ]) {
      expect(homepage, `homepage must not render ${banned}`).not.toContain(`<${banned}`);
    }
  });

  it("does NOT render a page-wide 8-stage router or stage timeline", () => {
    for (const banned of [
      "GrowthJourneyOverviewSection",
      "GrowthJourneyList",
      "StageTimeline",
      "ConnectedSystemExplainerSection",
      "WorkProcessSection",
    ]) {
      expect(homepage, `homepage must not render ${banned}`).not.toContain(`<${banned}`);
    }
  });
});

describe("homepage preserves its server contract", () => {
  it("keeps the self-canonical, both JSON-LD graphs and the seed opening", () => {
    expect(homepage).toMatch(/canonical\("\/"\)/);
    expect(homepage).toContain("organizationJsonLd()");
    expect(homepage).toContain("websiteJsonLd()");
    expect(homepage).toContain("getHomepageOpening()");
  });

  it("is an async server component with no client boundary", () => {
    expect(homepage).not.toContain('"use client"');
    expect(homepage).toMatch(/export default async function HomePage/);
  });
});
