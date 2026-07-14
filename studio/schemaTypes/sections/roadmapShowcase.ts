import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Business roadmaps (component-inventory.md §4) — homepage block 8. References the `roadmap`
 * document type (data-model.md → taxonomy; "Progressive implementation" Milestone M7 — now part of
 * this schema). `roadmap` is ordinary content (not placeholder-gated "proof"), so this section
 * defaults to `enabled: true`; the frontend still only renders a roadmap card once that document's
 * `contentStatus` is Verified/Ready to publish (data-model.md "Section validation rules").
 */
export const roadmapShowcase = defineType({
  name: 'roadmapShowcase',
  title: 'Roadmap Showcase',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'roadmaps',
      title: 'Roadmaps',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'roadmap'}]})],
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Roadmap Showcase', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
