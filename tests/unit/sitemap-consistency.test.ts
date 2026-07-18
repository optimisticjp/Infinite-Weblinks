import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import {
  getCaseStudies,
  getExamples,
  getGoals,
  getLearnArticles,
  getRoadmaps,
  getServiceCategories,
  getStartingPoints,
  getTools,
  getBusinessTypes,
} from "@/lib/content";
import { caseStudies, examples, testimonials } from "@/lib/content/data/proof";
import { isRenderable } from "@/lib/content/types";

/**
 * Proof/gating/sitemap/structured-data agreement (brief §P1-06, review §4/§16).
 *
 * The review flagged the `/case-studies` ↔ CaseStudyShowcaseSection ↔ sitemap "triangle"
 * as the one place where "gated out today" could silently become "broken when un-gated".
 * These assertions lock the three views together so a future real case study cannot ship
 * with a broken index or a sitemap entry that 404s — and, conversely, so gated placeholder
 * proof can never leak into the sitemap or structured data.
 */

function pathOf(url: string): string {
  return new URL(url).pathname;
}

describe("sitemap / proof-gating / robots consistency", () => {
  it("emits no proof URL while proof is not renderable (agrees with the getters and the homepage sections)", async () => {
    const [entries, cs, ex] = await Promise.all([sitemap(), getCaseStudies(), getExamples()]);
    const paths = entries.map((e) => pathOf(e.url));

    // Default seed proof is all placeholder → getters empty → sections render null.
    expect(cs).toHaveLength(0);
    expect(ex).toHaveLength(0);

    // …therefore the sitemap must contain no proof index or detail URL.
    expect(paths.some((p) => p.startsWith("/case-studies"))).toBe(false);
    expect(paths.some((p) => p.startsWith("/examples"))).toBe(false);
  });

  it("never lists the personalised growth-plan tool, its result, api, or studio", async () => {
    const paths = (await sitemap()).map((e) => pathOf(e.url));
    for (const forbidden of ["/growth-plan", "/growth-plan/result", "/api", "/studio"]) {
      expect(
        paths.some((p) => p === forbidden || p.startsWith(`${forbidden}/`)),
        `sitemap must not contain ${forbidden}`,
      ).toBe(false);
    }
  });

  it("robots keeps the result view, api, and studio out of crawling", () => {
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    const disallow = ([] as string[]).concat(rule?.disallow ?? []);
    expect(disallow).toContain("/growth-plan/result");
    expect(disallow).toContain("/api/");
    expect(disallow).toContain("/studio");
  });

  it("emits only URLs that resolve to a real, live route (no deliberate 404s in the sitemap)", async () => {
    const [
      entries,
      serviceCategories,
      tools,
      roadmaps,
      articles,
      businessTypes,
      startingPoints,
      goals,
    ] = await Promise.all([
      sitemap(),
      getServiceCategories(),
      getTools(),
      getRoadmaps(),
      getLearnArticles(),
      getBusinessTypes(),
      getStartingPoints(),
      getGoals(),
    ]);

    const staticRoutes = new Set([
      "/",
      "/goals",
      "/how-it-works",
      "/services",
      "/tools",
      "/roadmaps",
      "/learn",
      "/resources",
      "/faq",
      "/about",
      "/contact",
      "/privacy",
      "/cookies",
      "/terms",
      "/accessibility",
    ]);

    const dynamic: Record<string, Set<string>> = {
      "/services": new Set(serviceCategories.map((c) => c.slug)),
      "/tools": new Set(tools.map((t) => t.slug)),
      "/roadmaps": new Set(roadmaps.map((r) => r.slug)),
      "/learn": new Set(articles.map((a) => a.slug)),
      "/business-types": new Set(businessTypes.map((b) => b.slug)),
      "/starting-points": new Set(startingPoints.map((p) => p.slug)),
      "/goals": new Set(goals.map((g) => g.slug)),
    };

    for (const entry of entries) {
      const path = pathOf(entry.url);
      if (staticRoutes.has(path)) continue;
      const seg = path.split("/").filter(Boolean);
      const base = `/${seg[0]}`;
      const slug = seg[1];
      expect(
        dynamic[base]?.has(slug),
        `sitemap URL ${path} does not resolve to a live route`,
      ).toBe(true);
    }
  });

  it("structured-data invariant: no proof record is renderable while it remains placeholder", () => {
    // The homepage proof sections and any case-study JSON-LD read the same getters,
    // so a placeholder record can never emit schema either.
    for (const item of [...caseStudies, ...examples, ...testimonials]) {
      if (item.status === "placeholder") {
        expect(isRenderable(item)).toBe(false);
      }
    }
  });
});
