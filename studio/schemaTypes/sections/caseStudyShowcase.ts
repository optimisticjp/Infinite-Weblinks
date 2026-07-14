import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Case studies (component-inventory.md §4) — homepage block 14, placeholder-gated. References the
 * `caseStudy` document type (data-model.md → content & editorial; "Progressive implementation"
 * Milestone M8 — now part of this schema). Defaults to `enabled: false`: editors should only switch
 * this on once at least one `caseStudy` is Verified — the frontend must also auto-hide when no
 * referenced case study is Verified (no empty frames — data-model.md "Section validation rules").
 */
export const caseStudyShowcase = defineType({
  name: 'caseStudyShowcase',
  title: 'Case Study Showcase',
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
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'caseStudy'}]})],
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {
        title: title || 'Case Study Showcase',
        subtitle: enabled ? 'Enabled — auto-hides until a case study is Verified' : 'Hidden',
      }
    },
  },
})
