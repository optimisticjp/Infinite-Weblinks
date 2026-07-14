import type { MetadataRoute } from "next";
import { canonical } from "@/lib/seo/metadata";
import {
  getBusinessTypes,
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
  const staticPaths = [
    "/",
    "/how-it-works",
    "/services",
    "/tools",
    "/solutions",
    "/roadmaps",
    "/learn",
    "/faq",
    "/about",
    "/contact",
    "/growth-plan",
    "/privacy",
    "/cookies",
    "/terms",
    "/accessibility",
  ];

  const [services, tools, roadmaps, articles, businessTypes, startingPoints, goals] =
    await Promise.all([
      getServices(),
      getTools(),
      getRoadmaps(),
      getLearnArticles(),
      getBusinessTypes(),
      getStartingPoints(),
      getGoals(),
    ]);

  const dynamicPaths = [
    ...services.map((s) => `/services/${s.slug}`),
    ...tools.map((t) => `/tools/${t.slug}`),
    ...roadmaps.map((r) => `/roadmaps/${r.slug}`),
    ...articles.map((a) => `/learn/${a.slug}`),
    ...businessTypes.map((b) => `/business-types/${b.slug}`),
    ...startingPoints.map((p) => `/starting-points/${p.slug}`),
    ...goals.map((g) => `/goals/${g.slug}`),
  ];

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: canonical(path),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
