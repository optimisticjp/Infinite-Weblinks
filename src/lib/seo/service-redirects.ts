// Relative import (not the "@/" alias) on purpose: this module is imported by
// next.config.ts, whose compile boundary does not resolve tsconfig path aliases. services.ts
// itself has only an `import type`, which is erased at runtime, so this chain stays alias-free.
import { services } from "../content/data/services";

export interface RedirectRule {
  source: string;
  destination: string;
  permanent: true;
}

/**
 * Phase 4: the seventy individual /services/<service> URLs folded into their category page
 * as anchored sections (they were ~100 words each — thin, not standalone pages). Every old
 * URL 301s to /services/<category>#<service>, so a bookmark or a ranked link lands on the
 * exact block. Generated from the service data, so the map can never drift from it — and
 * shared with the redirect test, which asserts every rule resolves to a real category.
 */
export const serviceRedirects: RedirectRule[] = services.map((s) => ({
  source: `/services/${s.slug}`,
  destination: `/services/${s.categorySlug}#${s.slug}`,
  permanent: true,
}));
