import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { faqJsonLd } from "@/lib/seo/jsonld";
import { pricingFaqs } from "@/lib/content/data/pricing";

/**
 * Phase 2N — the migrated /pricing route contract. Source-level guards (the page is an async Server
 * Component) that it preserves metadata, canonical, both JSON-LD graphs, the exact fragment order and
 * source order; reads all content from the centralised module (no route-local arrays remain); uses
 * explicit V2 surfaces with exactly one dark section; and carries none of the removed cosmic/legacy
 * constructs. Plus the FAQPage structured-data contract and the legacy-route safety net.
 */

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const readCode = (rel: string) =>
  read(rel)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

const PAGE = "../../src/app/(marketing)/pricing/page.tsx";
const FRAGMENTS = [
  "pricing-hero",
  "why-quotes",
  "what-shapes-a-quote",
  "delivery-cost",
  "engagement-shapes",
  "how-to-get-a-quote",
  "pricing-faq",
  "get-started",
];

describe("/pricing route — preservation contract", () => {
  const page = read(PAGE);
  const code = readCode(PAGE);

  it("preserves the metadata, canonical path and both JSON-LD graphs", () => {
    expect(page).toMatch(/title:\s*"How pricing works"/);
    expect(page).toContain("We quote each piece of work after we understand it");
    expect(page).toMatch(/path:\s*"\/pricing"/);
    expect(code).toContain("breadcrumbJsonLd");
    expect(code).toContain("faqJsonLd(pricingFaqs)");
  });

  it("renders all eight fragment ids exactly once, in source order", () => {
    const ids = [...code.matchAll(/id="([a-z0-9-]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual(FRAGMENTS);
  });

  it("reads every section's content from the centralised pricing module (no route-local arrays)", () => {
    // The route imports the four datasets it renders directly; the delivery cost notes are derived
    // inside PricingDeliveryCard, so the route no longer imports pricingDeliveryCostNotes.
    for (const named of ["pricingFactors", "pricingEngagementShapes", "pricingQuoteSteps", "pricingFaqs"]) {
      expect(code, `imports ${named}`).toContain(named);
    }
    expect(code, "delivery notes derived in the card, not imported by the route").not.toContain("pricingDeliveryCostNotes");
    // The old route-local constants must be gone.
    expect(code).not.toMatch(/const\s+(FACTORS|COST_NOTE|SHAPES|STEPS|FAQS)\b/);
  });

  it("uses the V2 building blocks and the four delivery models", () => {
    for (const used of ["PageHeader", "SectionShell", "PricingFactorCard", "PricingDeliveryCard", "EngagementShapeCard", "QuoteProcessList", "PricingFaqList", "FinalCtaSection", "LinkChip"]) {
      expect(code, `uses ${used}`).toContain(used);
    }
    // All four delivery models come from the getter; each card derives its own exact cost note
    // internally (the route no longer threads pricingDeliveryCostNotes through a costNote prop).
    expect(code).toContain("getDeliveryModels");
    expect(code).toContain("<PricingDeliveryCard");
    expect(code).not.toContain("costNote=");
  });

  it("uses explicit V2 surfaces with exactly one dark section and no gradient word", () => {
    const surfaces = [...code.matchAll(/surface="(\w+)"/g)].map((m) => m[1]);
    expect(surfaces.length, "every SectionShell/PageHeader names its surface").toBeGreaterThan(0);
    expect(surfaces.every((s) => s === "light" || s === "alt")).toBe(true);
    // The only dark band is the single FinalCtaSection (which owns theme-night internally).
    expect((code.match(/<FinalCtaSection/g) ?? []).length).toBe(1);
    expect(code).not.toContain("iw-gradient-word");
  });

  it("no longer uses any cosmic / legacy construct", () => {
    for (const banned of ["CosmicPageHero", "GlowButton", "NodeOrb", "BentoCard", "BentoGrid", "DELIVERY_COLOR", "FinalCtaBannerSection", "CosmicBackground", "Starfield"]) {
      expect(code, `no ${banned}`).not.toContain(banned);
    }
  });
});

describe("/pricing — FAQPage structured-data contract", () => {
  const page = read(PAGE);

  it("emits exactly the five visible FAQs, once each, with matching question/answer text and order", () => {
    const node = faqJsonLd(pricingFaqs) as {
      "@type": string;
      mainEntity: { "@type": string; name: string; acceptedAnswer: { text: string } }[];
    };
    expect(node["@type"]).toBe("FAQPage");
    expect(node.mainEntity).toHaveLength(pricingFaqs.length);
    node.mainEntity.forEach((q, i) => {
      expect(q["@type"]).toBe("Question");
      expect(q.name).toBe(pricingFaqs[i].question);
      expect(q.acceptedAnswer.text).toBe(pricingFaqs[i].answer);
    });
    // No extra and no omitted question.
    expect(new Set(node.mainEntity.map((q) => q.name))).toEqual(new Set(pricingFaqs.map((f) => f.question)));
  });

  it("adds no Product / Offer / price / Review / rating structured data", () => {
    for (const banned of ["Product", "priceCurrency", "AggregateOffer", "AggregateRating", "priceRange"]) {
      expect(page, `no ${banned}`).not.toContain(banned);
    }
    expect(page).not.toMatch(/\bOffer\b/);
    expect(page).not.toMatch(/\bReview\b/);
    // And no currency figure anywhere in the route source.
    expect(page).not.toMatch(/[£$€]\s?\d/);
  });
});

describe("legacy-route safety — nothing removed or migrated beyond /pricing", () => {
  it("the removed-from-pricing components still exist for their other consumers", () => {
    // NodeOrb/BentoCard/BentoGrid are retained-live (resources); the cosmic hero/PageHero/
    // CosmicBackground are retained until the Phase 2S cosmic cascade (Commit 8). FinalCtaBannerSection
    // was removed in Phase 2S Commit 7 (dead registry cluster).
    for (const rel of [
      "../../src/components/routes/CosmicPageHero.tsx",
      "../../src/components/routes/PageHero.tsx",
      "../../src/components/viz/CosmicBackground.tsx",
      "../../src/components/primitives/NodeOrb.tsx",
      "../../src/components/primitives/GlowButton.tsx",
      "../../src/components/primitives/BentoCard.tsx",
      "../../src/components/primitives/BentoGrid.tsx",
    ]) {
      expect(() => read(rel), `${rel} still exists`).not.toThrow();
    }
    // DELIVERY_COLOR is still exported for its remaining consumers.
    expect(read("../../src/components/primitives/Badge.tsx")).toMatch(/export const DELIVERY_COLOR/);
  });

  it("the non-migrated conversion routes and their logic are untouched and present", () => {
    for (const rel of [
      "../../src/app/(convert)/contact/page.tsx",
      "../../src/components/forms/ContactForm.tsx",
      "../../src/app/api/forms/contact/route.ts",
      "../../src/lib/validation/forms.ts",
      "../../src/lib/forms/rate-limit.ts",
      "../../src/lib/forms/turnstile.ts",
      "../../src/app/(convert)/growth-plan/page.tsx",
      "../../src/components/builder/PlanBuilder.tsx",
      "../../src/lib/growth-plan/engine.ts",
      "../../src/lib/growth-plan/rules.ts",
      "../../src/app/(convert)/troubleshooter/page.tsx",
      "../../src/components/troubleshooter/GrowthTroubleshooter.tsx",
    ]) {
      expect(() => read(rel), `${rel} still exists`).not.toThrow();
    }
  });

  it("/contact and /growth-plan still use their existing (non-V2-pricing) heroes", () => {
    // These routes are out of scope for Phase 2N — they must not have been migrated as a side effect.
    const contact = read("../../src/app/(convert)/contact/page.tsx");
    const growth = read("../../src/app/(convert)/growth-plan/page.tsx");
    expect(contact).toContain("ContactForm");
    expect(growth).toContain("PlanBuilder");
  });
});
