import { createClient, type SanityClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-02-01";

/** True once a Sanity project id is configured via env. */
export const isSanityConfigured = Boolean(projectId);

/**
 * How long (seconds) a Sanity read is cached before Next revalidates it. Content pages are
 * otherwise prerendered at build time and would freeze whatever the build fetched — so without
 * this, editor changes (and even the initial dataset) never reach the running site. Kept short so
 * published edits surface promptly; on-demand revalidation via a Sanity webhook is the follow-up
 * for instant updates.
 */
export const SANITY_REVALIDATE_SECONDS = 30;

/**
 * Read-only Sanity client for published content. `null` until a project is provisioned, so the app
 * cleanly falls back to seed content in the meantime.
 *
 * `useCdn: false` — reads go to the live API, not `apicdn.sanity.io`. The CDN is eventually
 * consistent, so right after a dataset import/edit it can still serve a stale (or empty) snapshot;
 * a build that fetched that snapshot would bake it into static HTML permanently. The live API is
 * always current, and Next's own cache (see SANITY_REVALIDATE_SECONDS) provides the caching layer.
 */
export const sanityClient: SanityClient | null = projectId
  ? createClient({ projectId, dataset, apiVersion, useCdn: false })
  : null;

/** GROQ fragment: only Verified / Ready-to-Publish content is ever public. */
export const PUBLIC_STATUS_FILTER = `contentStatus.status in ["verified","readyToPublish"]`;
