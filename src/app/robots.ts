import type { MetadataRoute } from "next";
import { canonical } from "@/lib/seo/metadata";

/**
 * robots.txt. Everything public is crawlable; API routes and the personalised
 * Growth Plan *result* are kept out (the builder intro at /growth-plan stays
 * indexable, but generated result URLs carry query state and add no index value).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/growth-plan/result", "/studio"],
      },
    ],
    sitemap: canonical("/sitemap.xml"),
    host: canonical("/"),
  };
}
