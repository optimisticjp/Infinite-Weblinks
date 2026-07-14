import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'

import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

/**
 * Infinite Weblinks — Sanity Studio.
 *
 * This is a SEPARATE, Sanity-hosted deploy (`sanity deploy` → `*.sanity.studio`), not embedded in
 * the Next.js app (design/deployment.md, design/security-privacy.md, plan.md "Structure
 * Decision"). Project ID/dataset come from the Studio's own env vars — see design/environment.md
 * §2 (`SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET`), which must equal the site's
 * `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET`.
 */

const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? ''
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production'

if (!projectId) {
  // Fails loudly in `sanity dev`/`sanity build` rather than silently pointing at no project.
  // eslint-disable-next-line no-console
  console.warn(
    '[infinite-weblinks-studio] SANITY_STUDIO_PROJECT_ID is not set. Copy studio/.env.example to ' +
      'studio/.env and fill in the project ID before running `sanity dev`/`sanity deploy`.',
  )
}

// The four config singletons — pinned at the top of the desk structure (structure/index.ts) and
// restricted below to a single document each (no create/duplicate/delete from the UI).
const SINGLETON_TYPES = new Set(['siteSettings', 'navigation', 'footer', 'formSettings'])

export default defineConfig({
  name: 'infinite-weblinks',
  title: 'Infinite Weblinks',

  projectId,
  dataset,

  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: '2025-06-01'}),
  ],

  schema: {
    types: schemaTypes,
    // Singletons should never appear in the generic "Create new document" template list — they
    // are only reachable through their pinned desk-structure entry.
    templates: (templates) => templates.filter((template) => !SINGLETON_TYPES.has(template.schemaType)),
  },

  document: {
    // Singletons: only publish/discard/restore — no create-another, no duplicate, no delete.
    actions: (input, context) =>
      SINGLETON_TYPES.has(context.schemaType)
        ? input.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
    newDocumentOptions: (prev, {creationContext}) =>
      creationContext.type === 'global'
        ? prev.filter((template) => !SINGLETON_TYPES.has(template.templateId))
        : prev,
  },
})
