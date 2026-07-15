import {defineCliConfig} from 'sanity/cli'

/**
 * CLI config for `sanity dev` / `sanity build` / `sanity deploy` (this Studio is deployed
 * separately from the Next.js app — see README.md and design/deployment.md).
 *
 * Project/dataset come from the same env vars as sanity.config.ts so the CLI and the running
 * Studio always agree on which Sanity project they target.
 */

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production'

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },

  /**
   * `studioHost` sets the hosted Studio's subdomain, i.e. `https://<studioHost>.sanity.studio`.
   * It is chosen ONCE, interactively, the first time `sanity deploy` runs against this project
   * (e.g. `infinite-weblinks` → `infinite-weblinks.sanity.studio`), and then stays fixed for the
   * life of the project — changing it later moves the Studio to a new URL and breaks any bookmarks
   * or CORS entries pointing at the old one. Set `SANITY_STUDIO_HOST` to pin it non-interactively
   * (e.g. for a CI-driven `sanity deploy` job); leave it unset to be prompted on first deploy.
   */
  studioHost: process.env.SANITY_STUDIO_HOST ?? 'infinite-weblinks',

  /**
   * The deployed Studio application id (public identifier, not a secret). Assigned by Sanity on the
   * first `sanity deploy` and pinned here so subsequent deploys don't prompt for it and can use
   * fine-grained version selection instead of always auto-updating to `latest`.
   */
  deployment: {
    appId: 'xfsjbzgp9jvzu7htnt03qtvf',
  },
})
