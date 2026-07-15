import { isSanityConfigured, sanityClient, SANITY_REVALIDATE_SECONDS } from "./client";
import type { Statused } from "@/lib/content/types";
import { isRenderable } from "@/lib/content/types";

/**
 * Sanity read adapter. `sanityFetch` runs a GROQ query when a project is configured and
 * NEVER throws — a query failure returns `null` so the caller can fall back to seed rather
 * than breaking a page. `fromSanityOrSeed` is the seam the content getters use: it prefers
 * live, status-gated Sanity data and falls back to the (already status-gated) seed array
 * only when Sanity is unavailable — never when a live query legitimately returns nothing.
 *
 * The full status-gated taxonomy plus learn articles, FAQs and proof are wired through this
 * seam (see src/lib/content/index.ts and queries.ts). Structural reference data, chrome, the
 * rules engine and legal pages stay code-authoritative.
 */

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> = {},
): Promise<T | null> {
  if (!sanityClient) return null;
  try {
    // `next.revalidate` makes each read an ISR fetch: content routes re-fetch from the live
    // dataset on this cadence instead of being frozen at build time (so editor changes appear).
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate: SANITY_REVALIDATE_SECONDS },
    });
  } catch (err) {
    // Never let a Sanity outage take down a page — degrade to seed.
    console.warn("[sanity] query failed; falling back to seed content.", err);
    return null;
  }
}

/**
 * Return live Sanity content, falling back to seed ONLY when Sanity can't answer:
 *
 *  - unconfigured project or no query        → seed
 *  - request failed (`sanityFetch` → null)   → seed
 *  - live query returned rows                → map + `isRenderable` gate, returned as-is
 *  - live query returned `[]` (authoritative)→ `[]`
 *  - live rows that all fail the gate        → `[]`
 *
 * The distinction matters now the dataset is populated: a successful empty result is the
 * real answer (e.g. every document of a type set to Draft), so seed content must NOT
 * reappear and re-leak retired content. Only a genuine failure (null) falls back to seed.
 * The `isRenderable` re-filter is defensive — the GROQ already gates, but a mapper mistake
 * must never surface Draft/Placeholder content.
 */
export async function fromSanityOrSeed<TDoc, TOut extends Statused>(opts: {
  query: string | null;
  params?: Record<string, unknown>;
  map: (docs: TDoc[]) => TOut[];
  seed: TOut[];
}): Promise<TOut[]> {
  if (!isSanityConfigured || !opts.query) return opts.seed;
  const docs = await sanityFetch<TDoc[]>(opts.query, opts.params);
  if (docs === null) return opts.seed; // request failed / unavailable — fall back
  return opts.map(docs).filter(isRenderable); // authoritative live result ([] stays [])
}
