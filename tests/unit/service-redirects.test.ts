import { describe, it, expect } from "vitest";
import { serviceRedirects } from "@/lib/seo/service-redirects";
import { services, serviceCategories } from "@/lib/content/data";

/**
 * Phase 4 folded the seventy /services/<service> pages into their category page as anchored
 * sections. The 301 map is generated from the service data, so this guards the invariant the
 * generation relies on: every old URL 301s to a real category page, at an anchor that matches
 * the service, and no redirect source can ever shadow a live category route.
 */
describe("service → category-anchor redirect map", () => {
  const categorySlugs = new Set(serviceCategories.map((c) => c.slug));
  const serviceSlugs = new Set(services.map((s) => s.slug));

  it("covers every service exactly once", () => {
    expect(serviceRedirects).toHaveLength(services.length);
    const sources = serviceRedirects.map((r) => r.source);
    expect(new Set(sources).size, "sources are unique").toBe(sources.length);
  });

  it("every rule is a permanent 301 from a real old service URL to a real category anchor", () => {
    for (const rule of serviceRedirects) {
      expect(rule.permanent, `${rule.source} permanent`).toBe(true);

      const sourceSlug = rule.source.replace(/^\/services\//, "");
      expect(serviceSlugs.has(sourceSlug), `${rule.source} is a real service`).toBe(true);

      const [, categorySlug, anchor] = rule.destination.match(/^\/services\/([^#]+)#(.+)$/) ?? [];
      expect(categorySlugs.has(categorySlug), `${rule.destination} category exists`).toBe(true);
      expect(anchor, `${rule.destination} anchor matches the service`).toBe(sourceSlug);

      // The anchored service really belongs to that category (the block will exist on the page).
      const service = services.find((s) => s.slug === sourceSlug);
      expect(service?.categorySlug).toBe(categorySlug);
    }
  });

  it("no redirect source collides with a live category route", () => {
    // A service slug equal to a category slug would make /services/<slug> both redirect and
    // render — the disjointness that makes the fold safe.
    for (const rule of serviceRedirects) {
      const sourceSlug = rule.source.replace(/^\/services\//, "");
      expect(categorySlugs.has(sourceSlug), `${rule.source} must not shadow a category`).toBe(false);
    }
  });
});
