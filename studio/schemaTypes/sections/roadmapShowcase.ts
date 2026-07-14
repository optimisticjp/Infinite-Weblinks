import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Business roadmaps (component-inventory.md §4) — homepage block 8.
 *
 * DEFERRED: the `roadmap` document type is not part of this initial schema slice — it lands with
 * Milestone M7 (data-model.md "Progressive implementation"). This section type is included now so
 * the `page.sections` allowed list matches the complete, designed-up-front model, but its
 * `roadmaps` reference has nothing to resolve to yet. Keep `enabled: false` in content until the
 * `roadmap` schema and Verified roadmap content exist; the frontend must also auto-hide this
 * section (data-model.md "Section validation rules" — placeholder-gated sections render only when
 * their referenced documents are Verified).
 */
export const roadmapShowcase = defineType({
  name: 'roadmapShowcase',
  title: 'Roadmap Showcase (deferred — M7)',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'roadmaps',
      title: 'Roadmaps',
      description: 'References the M7 `roadmap` document type once it exists.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'roadmap'}]})],
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Roadmap Showcase', subtitle: enabled ? 'Deferred to M7' : 'Hidden (deferred to M7)'}
    },
  },
})
