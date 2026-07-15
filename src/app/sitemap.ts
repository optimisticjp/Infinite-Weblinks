import type { MetadataRoute } from "next";
import { canonical } from "@/lib/seo/metadata";
import {
  getBusinessTypes,
  getCaseStudies,
  getExamples,
  getGoals,
  getLearnArticles,
  getRoadmaps,
  getServices,
  getStartingPoints,
  getTools,
} from "@/lib/content";

/**
 * XML sitemap. Lists every indexable public URL — the fixed top-level pages plus the
 * status-gated content routes (only verified / ready-to-publish items are returned by
 * the getters, so nothing hidden leaks in). The personalised Growth Plan *result* and
 * API routes are intentionally excluded (see robots.ts). Legal pages are included.
 *
 * `lastModified` is deliberately omitted rather than stamped with a build-time `now`,
 * which would falsely churn every URL's date on each deploy.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Indexable top-level pages only. /growth-plan and /contact are noindex (conversion
  // utilities), so they're intentionally excluded here even though they're crawlable.
  const staticPaths = [
    "/",
    "/how-it-works",
    "/services",
    "/tools",
    "/solutions",
    "/business-types",
    "/starting-points",
    "/roadmaps",
    "/learn",
    "/resources",
    "/faq",
    "/about",
    "/privacy",
    "/cookies",
    "/terms",
    "/accessibility",
  ];

  const [services, tools, roadmaps, articles, businessTypes, startingPoints, goals, caseStudies, examples] =
    await Promise.all([
      getServices(),
      getTools(),
      getRoadmaps(),
      getLearnArticles(),
      getBusinessTypes(),
      getStartingPoints(),
      getGoals(),
      getCaseStudies(),
      getExamples(),
    ]);

  const dynamicPaths = [
    ...services.map((s) => `/services/${s.slug}`),
    ...tools.map((t) => `/tools/${t.slug}`),
    ...roadmaps.map((r) => `/roadmaps/${r.slug}`),
    ...articles.map((a) => `/learn/${a.slug}`),
    ...businessTypes.map((b) => `/business-types/${b.slug}`),
    ...startingPoints.map((p) => `/starting-points/${p.slug}`),
    ...goals.map((g) => `/goals/${g.slug}`),
    // Proof routes are only listed once a record is Verified / Ready to Publish (the
    // index route itself 404s while empty, so it must not appear until then either).
    ...(caseStudies.length > 0
      ? ["/case-studies", ...caseStudies.map((c) => `/case-studies/${c.slug}`)]
      : []),
    ...(examples.length > 0 ? ["/examples", ...examples.map((e) => `/examples/${e.slug}`)] : []),
  ];

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: canonical(path),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
