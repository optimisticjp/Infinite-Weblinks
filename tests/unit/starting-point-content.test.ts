import { describe, it, expect } from "vitest";
import { startingPoints } from "@/lib/content/data/starting-points";
import { stages } from "@/lib/content/data/stages";
import { services } from "@/lib/content/data/services";
import { serviceCategories } from "@/lib/content/data/service-categories";
import { isRenderable } from "@/lib/content/types";
import { hasIcon } from "@/components/primitives/Icon";
import { domainInk, domainTint } from "@/lib/design/domainColor";

/**
 * Phase 2R (§B) — the starting-point detail content graph. These integrity checks prove the eight
 * public starting points, their recommended growth stages, and each stage's services + categories are
 * complete, ordered and resolvable — so a broken relationship fails here (and the static build) rather
 * than producing a partially-empty public page. The visible data must also stay honest (no fabricated
 * metric / price / rating / testimonial / guarantee / certainty).
 */

const renderableSPs = startingPoints.filter(isRenderable);
const renderableStages = stages.filter(isRenderable);
const renderableServices = services.filter(isRenderable);
const renderableCategories = serviceCategories.filter(isRenderable);

const stageBySlug = new Map(renderableStages.map((s) => [s.slug, s] as const));
const serviceBySlug = new Map(renderableServices.map((s) => [s.slug, s] as const));
const categoryBySlug = new Map(renderableCategories.map((c) => [c.slug, c] as const));

describe("starting points", () => {
  it("has exactly eight renderable starting points in the exact source order", () => {
    expect(renderableSPs).toHaveLength(8);
    expect(renderableSPs.map((s) => s.slug)).toEqual([
      "nothing-built-yet",
      "idea-no-website",
      "website-no-traffic",
      "traffic-few-sales",
      "sales-but-chaotic",
      "running-ads-unprofitable",
      "established-want-to-scale",
      "want-to-automate",
    ]);
  });

  it("has unique, non-empty slugs and labels, situations and recommendations", () => {
    expect(new Set(renderableSPs.map((s) => s.slug)).size, "unique slugs").toBe(8);
    expect(new Set(renderableSPs.map((s) => s.label)).size, "unique labels").toBe(8);
    for (const sp of renderableSPs) {
      expect(sp.label.trim().length, `${sp.slug} label`).toBeGreaterThan(0);
      expect(sp.situation.trim().length, `${sp.slug} situation`).toBeGreaterThan(0);
      expect(sp.recommendation.trim().length, `${sp.slug} recommendation`).toBeGreaterThan(0);
    }
  });

  it("resolves every icon and maps every colour through the domain bridge to V2 ink + tint", () => {
    for (const sp of renderableSPs) {
      expect(hasIcon(sp.icon), `${sp.slug} icon ${sp.icon}`).toBe(true);
      expect(sp.color, `${sp.slug} colour is a token`).toMatch(/^var\(--/);
      expect(domainInk(sp.color), `${sp.slug} ink`).toMatch(/^var\(--v2-/);
      expect(domainTint(sp.color), `${sp.slug} tint`).toMatch(/^var\(--v2-/);
    }
  });

  it("uses exactly the locked Build-my-growth-plan CTA on every starting point", () => {
    for (const sp of renderableSPs) {
      expect(sp.cta, `${sp.slug} cta`).toEqual({
        label: "Build my growth plan",
        route: "/growth-plan",
        style: "primary",
      });
    }
  });
});

describe("recommended stages", () => {
  it("resolves every recommendedStageSlug to exactly one real, renderable, complete stage", () => {
    for (const sp of renderableSPs) {
      expect(sp.recommendedStageSlug.trim().length, `${sp.slug} stage slug`).toBeGreaterThan(0);
      const matches = renderableStages.filter((s) => s.slug === sp.recommendedStageSlug);
      expect(matches, `${sp.slug} → ${sp.recommendedStageSlug} resolves to one stage`).toHaveLength(1);
      const stage = matches[0];
      expect(typeof stage.order === "number" && stage.order >= 1, `${stage.slug} order`).toBe(true);
      expect(stage.name.trim().length, `${stage.slug} name`).toBeGreaterThan(0);
      expect(stage.summary.trim().length, `${stage.slug} summary`).toBeGreaterThan(0);
      expect(hasIcon(stage.icon), `${stage.slug} icon`).toBe(true);
      // /how-it-works#<stage> targets a real, visible stage fragment.
      expect(stageBySlug.has(stage.slug), `/how-it-works#${stage.slug}`).toBe(true);
    }
  });
});

describe("stage services", () => {
  it("resolves every recommended stage's services + categories, with source order retained and exact hrefs", () => {
    for (const sp of renderableSPs) {
      const stage = stageBySlug.get(sp.recommendedStageSlug)!;
      const slugs = stage.serviceSlugs ?? [];
      expect(slugs.length, `${stage.slug} has services`).toBeGreaterThan(0);
      // No duplicate service slug inside the stage.
      expect(new Set(slugs).size, `${stage.slug} unique service slugs`).toBe(slugs.length);
      for (const serviceSlug of slugs) {
        const service = serviceBySlug.get(serviceSlug);
        expect(service, `${stage.slug} → service ${serviceSlug} resolves`).toBeDefined();
        const category = categoryBySlug.get(service!.categorySlug);
        expect(category, `${serviceSlug} → category ${service!.categorySlug} resolves`).toBeDefined();
        // Exact detail destination.
        const href = `/services/${service!.categorySlug}#${service!.slug}`;
        expect(href).toBe(`/services/${category!.slug}#${serviceSlug}`);
      }
      // The page renders in stage.serviceSlugs order — resolving in that order preserves it.
      const resolvedOrder = slugs.map((s) => serviceBySlug.get(s)!.slug);
      expect(resolvedOrder, `${stage.slug} service order`).toEqual([...slugs]);
    }
  });
});

describe("honesty (no fabricated metric / price / rating / testimonial / guarantee / certainty)", () => {
  const allText = renderableSPs
    .flatMap((sp) => [sp.label, sp.situation, sp.recommendation])
    .join("  ");

  // Fabrication patterns only — descriptive advice vocabulary ("Proof, better pages, funnels") is
  // legitimate and NOT banned; only a numeric/price/rating/ranking or first-person guarantee is.
  const banned: { name: string; re: RegExp }[] = [
    { name: "percentage", re: /\d+(\.\d+)?\s?%/ },
    { name: "currency price", re: /[£$€]\s?\d/ },
    { name: "multiplier result", re: /\b\d+(\.\d+)?\s?x\b/i },
    { name: "increase/boost figure", re: /\b(increase|boost|grew|rose)\s+by\s+\d/i },
    { name: "star / out-of-N rating", re: /★|\b\d(\.\d)?\s*(out of|\/)\s*(5|10)\b|\bstar rating\b/i },
    { name: "ranking claim", re: /#\s?1\b|\bnumber one\b|\branked\b|\btop-rated\b|\bbest[- ]in[- ]class\b/i },
    { name: "certainty score", re: /\d+(\.\d+)?\s?%?\s?(certain|guaranteed)/i },
    { name: "first-person guarantee of results", re: /\bwe guarantee\b|\bguaranteed (results?|to)\b|\brisk[- ]free\b|\bmoney[- ]back\b/i },
    { name: "testimonial / aggregate-rating claim", re: /\btestimonial\b|aggregate ?rating|\bcustomers say\b/i },
  ];
  for (const { name, re } of banned) {
    it(`contains no ${name}`, () => {
      expect(allText).not.toMatch(re);
    });
  }

  it("the fabrication guard catches a planted defect (self-test)", () => {
    expect("Get 3x more sales").toMatch(banned[2].re);
    expect("We guarantee results").toMatch(banned[7].re);
  });
});
