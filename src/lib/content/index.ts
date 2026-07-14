import { isSanityConfigured } from "@/lib/sanity/client";
import { seedChrome, seedEditorial, seedHero } from "./seed";
import type { EditorialSection, HeroContent, SiteChrome } from "./types";

/**
 * Content getters. Today they return the approved seed content; once a Sanity
 * project is provisioned they will run status-gated GROQ queries
 * (`PUBLIC_STATUS_FILTER`) and fall back to seed only if a document is missing.
 * Keeping this seam here means components never change when Sanity comes online.
 */

export async function getSiteChrome(): Promise<SiteChrome> {
  if (isSanityConfigured) {
    // TODO(M3+): query siteSettings / navigation / megaMenu / footer (status-gated),
    // map to SiteChrome, and fall back to seedChrome for any missing singleton.
  }
  return seedChrome;
}

export async function getHomepageOpening(): Promise<{
  hero: HeroContent;
  editorial: EditorialSection;
}> {
  if (isSanityConfigured) {
    // TODO(M3+): query the homepage `page` document's heroConnectedUniverse +
    // editorialStatement sections (status-gated).
  }
  return { hero: seedHero, editorial: seedEditorial };
}
