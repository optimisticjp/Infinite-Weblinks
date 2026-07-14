import { createClient, type SanityClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-02-01";

/** True once a Sanity project id is configured via env. */
export const isSanityConfigured = Boolean(projectId);

/**
 * Read-only Sanity client for published content. `null` until a project is
 * provisioned, so the app cleanly falls back to seed content in the meantime.
 * Public reads use the Sanity CDN. Draft Mode / preview (a separate, secret-gated
 * client) arrives in a later milestone.
 */
export const sanityClient: SanityClient | null = projectId
  ? createClient({ projectId, dataset, apiVersion, useCdn: true })
  : null;

/** GROQ fragment: only Verified / Ready-to-Publish content is ever public. */
export const PUBLIC_STATUS_FILTER = `contentStatus.status in ["verified","readyToPublish"]`;
