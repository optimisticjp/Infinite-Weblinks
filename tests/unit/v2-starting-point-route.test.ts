import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";

/**
 * Phase 2R (§O) — the /starting-points/[slug] route contract + legacy-route safety. The route is now a
 * server-rendered PageHeader + JourneyStageCard + recommendation Callout + ServiceCard grid + one
 * reserved-night FinalCtaSection; the cosmic hero, NodeOrb, GlowButton, Bento and the banner CTA are
 * gone; metadata/static params are preserved; and the BreadcrumbList is aligned to Goals (never the
 * redirecting /starting-points index).
 */
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), "utf8");
const stripComments = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\{\/\*[\s\S]*?\*\/\}/g, "").replace(/^\s*\/\/.*$/gm, "");

const page = read("../../src/app/(marketing)/starting-points/[slug]/page.tsx");
const code = stripComments(page);

describe("route composition (V2 components in, cosmic/bento out)", () => {
  it("opens with PageHeader and adds exactly one FinalCtaSection", () => {
    expect(code).toMatch(/<PageHeader\b/);
    expect(code).toContain('id="starting-point-hero"');
    expect(code).toContain('surface="light"');
    expect((code.match(/<FinalCtaSection\b/g) ?? []).length, "one final CTA").toBe(1);
    expect(code).toContain('id="get-started"');
  });

  it("renders the recommended stage, recommendation and stage-service sections", () => {
    expect(code).toMatch(/<JourneyStageCard\b/);
    expect(code).toMatch(/<Callout\b/);
    expect(code).toMatch(/<ServiceCard\b/);
    expect(code).toContain('id="recommended-stage"');
    expect(code).toContain('id="recommendation"');
    expect(code).toContain('id="stage-services"');
  });

  it("removes the cosmic hero, NodeOrb, GlowButton, Bento and the banner CTA", () => {
    for (const banned of [
      "CosmicPageHero",
      "NodeOrb",
      "GlowButton",
      "BentoGrid",
      "BentoCard",
      "FinalCtaBannerSection",
      "theme-cosmic",
      "theme-dark",
    ]) {
      expect(code, `no ${banned}`).not.toContain(banned);
    }
  });

  it("resolves the stage and services strictly (a broken relationship throws, never a partial page)", () => {
    expect(code).toMatch(/if \(!stage\) \{[\s\S]*?throw new Error/);
    expect(code).toMatch(/if \(!service\) \{[\s\S]*?throw new Error/);
    expect(code).toMatch(/if \(!category\) \{[\s\S]*?throw new Error/);
    // The exact service destination is preserved.
    expect(code).toContain("`/services/${service.categorySlug}#${service.slug}`");
  });
});

describe("metadata, static params and structured data", () => {
  it("preserves generateStaticParams over the starting points and the label/situation metadata", () => {
    expect(code).toMatch(/generateStaticParams/);
    expect(code).toContain("getStartingPoints()");
    expect(code).toContain("title: startingPoint.label");
    expect(code).toContain("description: startingPoint.situation");
    expect(code).toContain("path: `/starting-points/${startingPoint.slug}`");
  });

  it("delegates the single BreadcrumbList to the Breadcrumbs component — Home → Goals → label, never /starting-points", () => {
    // The page no longer emits its own JSON-LD: PageHeader renders <Breadcrumbs>, which prepends Home
    // and emits exactly ONE BreadcrumbList from the pathful crumbs. The page must therefore NOT call
    // breadcrumbJsonLd or render a second <JsonLd> (that was the double-emission bug).
    expect((code.match(/breadcrumbJsonLd\(/g) ?? []).length, "no page-level breadcrumb node").toBe(0);
    expect(code).not.toContain("<JsonLd");
    // The trail handed to PageHeader is Goals → the current page (label), with the label carrying its
    // canonical detail path so the emitted BreadcrumbList is the full Home → Goals → label chain.
    expect(code).toContain('{ name: "Goals", path: "/goals" }');
    expect(code).toMatch(/name:\s*startingPoint\.label,\s*path:\s*`\/starting-points\/\$\{startingPoint\.slug\}`/);
    // The redirecting index must NOT appear as a breadcrumb destination.
    expect(code).not.toMatch(/name:\s*"Starting points"/);
    expect(code).not.toMatch(/path:\s*"\/starting-points"/);

    // The Breadcrumbs component is the single source of the BreadcrumbList JSON-LD (guarded on >1 crumb).
    const breadcrumbs = stripComments(read("../../src/components/primitives/Breadcrumbs.tsx"));
    expect(breadcrumbs).toMatch(/jsonLdItems\.length > 1 && <JsonLd data=\{breadcrumbJsonLd\(jsonLdItems\)\} \/>/);
  });

  it("adds no HowTo / FAQPage / Product / Offer / Review / AggregateRating schema", () => {
    expect(code).not.toMatch(/howToJsonLd|faqJsonLd|"Product"|"Offer"|"Review"|"AggregateRating"/);
  });
});

describe("legacy-route safety (untouched beyond contained corrections)", () => {
  const files: Record<string, string> = {
    "growth-plan": read("../../src/app/(convert)/growth-plan/page.tsx"),
    contact: read("../../src/app/(convert)/contact/page.tsx"),
    pricing: read("../../src/app/(marketing)/pricing/page.tsx"),
    services: read("../../src/app/(marketing)/services/page.tsx"),
  };

  it("/growth-plan still uses the PlanBuilder and PageHeader", () => {
    expect(files["growth-plan"]).toContain("PlanBuilder");
    expect(files["growth-plan"]).toContain("PageHeader");
  });
  it("/contact still uses the ContactForm", () => {
    expect(files.contact).toContain("ContactForm");
  });
  it("/pricing and /services are still present and V2 (no cosmic hero)", () => {
    expect(files.pricing).not.toContain("CosmicPageHero");
    expect(files.services).not.toContain("CosmicPageHero");
  });
  it("the troubleshooter route still composes GrowthTroubleshooter + PageHeader", () => {
    const ts = read("../../src/app/(convert)/troubleshooter/page.tsx");
    expect(ts).toContain("GrowthTroubleshooter");
    expect(ts).toContain("PageHeader");
  });
  it("CosmicPageHero and FinalCtaBannerSection still exist for their other (legacy) consumers", () => {
    expect(() => read("../../src/components/routes/CosmicPageHero.tsx")).not.toThrow();
    expect(() => read("../../src/components/sections/FinalCtaBannerSection.tsx")).not.toThrow();
  });
});
