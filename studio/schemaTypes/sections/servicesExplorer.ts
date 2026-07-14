import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Filterable services preview (component-inventory.md §4) — homepage block 9. The canonical
 * unfiltered `/services` index stays SSG; this section only curates a homepage preview.
 */
export const servicesExplorer = defineType({
  name: 'servicesExplorer',
  title: 'Services Explorer',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'categories',
      title: 'Featured categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'serviceCategory'}]})],
    }),
    defineField({
      name: 'featuredServices',
      title: 'Featured services',
      description: 'Optional curated highlight. Leave empty to let the frontend surface a representative sample.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
    }),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Services Explorer', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
