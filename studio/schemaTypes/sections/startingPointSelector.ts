import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * "Where are you now?" chooser (Growth Guide p.4 — component-inventory.md §4) — homepage block 7.
 */
export const startingPointSelector = defineType({
  name: 'startingPointSelector',
  title: 'Starting Point Selector',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'startingPoints',
      title: 'Starting points',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'startingPoint'}]})],
    }),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Starting Point Selector', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
