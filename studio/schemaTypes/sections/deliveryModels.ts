import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Four ways we deliver + the ownership line (component-inventory.md §4) — homepage block 11.
 */
export const deliveryModels = defineType({
  name: 'deliveryModels',
  title: 'Delivery Models',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'models',
      title: 'Delivery models',
      description: 'Normally all 4 locked delivery models.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'deliveryModel'}]})],
      validation: (Rule) => Rule.max(4),
    }),
    defineField({
      name: 'ownershipLine',
      title: 'Ownership line override',
      description: 'Optional — falls back to each deliveryModel document\'s own ownershipLine field.',
      type: 'text',
      rows: 2,
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Delivery Models', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
