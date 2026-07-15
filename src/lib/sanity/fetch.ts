import { isSanityConfigured, sanityClient } from "./client";
import type { Statused } from "@/lib/content/types";
import { isRenderable } from "@/lib/content/types";

/**
 * Sanity read adapter. `sanityFetch` runs a GROQ query when a project is configured and
 * NEVER throws — a query failure returns `null` so the caller falls back to seed rather
 * than breaking a page. `fromSanityOrSeed` is the seam the content getters use: it prefers
 * live, status-gated Sanity data and falls back to the (already status-gated) seed array
 * whenever Sanity is unconfigured, empty, or errors.
 *
 * Only content types whose Studio schema maps cleanly and completely onto the app types
 * are wired through this today (FAQs + proof). The richer taxonomy types await a
 * schema↔type reconciliation (see src/lib/content/index.ts header) and stay seed-backed.
 */

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  if (!sanityClient) return null;
  try {
    return await sanityClient.fetch<T>(query, params);
  } catch (err) {
    // Never let a Sanity outage take down a page — degrade to seed.
    console.warn("[sanity] query failed; falling back to seed content.", err);
    return null;
  }
}

/**
 * Return live Sanity content when available, else the seed fallback. The Sanity result is
 * re-filtered through the public status gate defensively (the GROQ already filters, but a
 * mapper mistake must never leak Draft/Placeholder content). An empty Sanity result falls
 * back to seed so a not-yet-populated dataset doesn't blank the site.
 */
export async function fromSanityOrSeed<TDoc, TOut extends Statused>(opts: {
  query: string | null;
  params?: Record<string, unknown>;
  map: (docs: TDoc[]) => TOut[];
  seed: TOut[];
}): Promise<TOut[]> {
  if (!isSanityConfigured || !opts.query) return opts.seed;
  const docs = await sanityFetch<TDoc[]>(opts.query, opts.params);
  if (!docs || docs.length === 0) return opts.seed;
  return opts.map(docs).filter(isRenderable);
}
