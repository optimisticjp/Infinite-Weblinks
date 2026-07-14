// OpenNext → Cloudflare Workers configuration.
// Owner-locked small-site caching: R2 = incremental cache, D1 = tag cache, no KV,
// on-demand revalidation (no time-based ISR, no Durable-Object queue initially).
// Override import paths are verified against the installed @opennextjs/cloudflare@1.20.1.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: d1NextTagCache,
});
