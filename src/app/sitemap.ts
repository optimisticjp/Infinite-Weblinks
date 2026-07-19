import type { MetadataRoute } from "next";
import { canonical } from "@/lib/seo/metadata";
import {
  getBusinessTypes,
  getCaseScenarios,
  getCaseStudies,
  getExamples,
  getGoals,
  getLearnArticles,
  getRoadmaps,
  getServiceCategories,
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
  // Indexable top-level pages only. /growth-plan stays noindex (a personalised conversion
  // tool), so it's excluded even though it's crawlable. /contact IS indexable — it's a
  // content-ful Contact Us page (why/when to get in touch, what happens next, the
  // ownership guarantee), so it earns a sitemap entry.
  const staticPaths = [
    "/",
    "/goals",
    "/how-it-works",
    "/services",
    "/pricing",
    "/tools",
    "/roadmaps",
    "/learn",
    "/resources",
    "/faq",
    "/about",
    "/connected-growth",
    "/account-ownership",
    "/case-studies",
    "/contact",
    "/privacy",
    "/cookies",
    "/terms",
    "/refunds",
    "/accessibility",
  ];

  const [
    serviceCategories,
    tools,
    roadmaps,
    articles,
    businessTypes,
    startingPoints,
    goals,
    caseScenarios,
    caseStudies,
    examples,
  ] = await Promise.all([
    getServiceCategories(),
    getTools(),
    getRoadmaps(),
    getLearnArticles(),
    getBusinessTypes(),
    getStartingPoints(),
    getGoals(),
    getCaseScenarios(),
    getCaseStudies(),
    getExamples(),
  ]);

  const dynamicPaths = [
    // Phase 4: sixteen category pages replace the seventy folded service URLs (those 301
    // to /services/<category>#<service>, so they must not appear as indexable URLs here).
    ...serviceCategories.map((c) => `/services/${c.slug}`),
    ...tools.map((t) => `/tools/${t.slug}`),
    ...roadmaps.map((r) => `/roadmaps/${r.slug}`),
    ...articles.map((a) => `/learn/${a.slug}`),
    ...businessTypes.map((b) => `/business-types/${b.slug}`),
    ...startingPoints.map((p) => `/starting-points/${p.slug}`),
    ...goals.map((g) => `/goals/${g.slug}`),
    // Case-study detail pages: the illustrative example scenarios (always present, clearly
    // labelled) plus any real verified case studies. The /case-studies index itself is a
    // static path above (it always renders the scenarios).
    ...caseScenarios.map((c) => `/case-studies/${c.slug}`),
    ...caseStudies.map((c) => `/case-studies/${c.slug}`),
    ...(examples.length > 0 ? ["/examples", ...examples.map((e) => `/examples/${e.slug}`)] : []),
  ];

  return [...staticPaths, ...dynamicPaths].map((path) => ({
    url: canonical(path),
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
