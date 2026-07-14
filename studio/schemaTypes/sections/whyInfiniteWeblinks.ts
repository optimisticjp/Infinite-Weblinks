import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Differentiators, no fake proof (component-inventory.md §4) — homepage block 13.
 */
export const whyInfiniteWeblinks = defineType({
  name: 'whyInfiniteWeblinks',
  title: 'Why Infinite Weblinks',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'points',
      title: 'Value points',
      description: 'Real differentiators only — no fabricated proof/metrics.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'point',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
            defineField({name: 'icon', title: 'Lucide icon name', type: 'string'}),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Why Infinite Weblinks', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
