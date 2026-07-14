import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Case studies (component-inventory.md §4) — homepage block 14, placeholder-gated.
 *
 * DEFERRED: the `caseStudy` document type is not part of this initial schema slice — it lands
 * with Milestone M8 (data-model.md "Progressive implementation"). Included now for schema
 * completeness only; keep `enabled: false` until `caseStudy` exists and has Verified content. The
 * frontend must auto-hide this section when no referenced case study is Verified (no empty
 * frames — data-model.md "Section validation rules").
 */
export const caseStudyShowcase = defineType({
  name: 'caseStudyShowcase',
  title: 'Case Study Showcase (deferred — M8)',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'caseStudies',
      title: 'Case studies',
      description: 'References the M8 `caseStudy` document type once it exists.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'caseStudy'}]})],
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Case Study Showcase', subtitle: enabled ? 'Deferred to M8' : 'Hidden (deferred to M8)'}
    },
  },
})
