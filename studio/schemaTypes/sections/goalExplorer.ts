import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Interactive goal chooser (component-inventory.md §4) — homepage block 4.
 */
export const goalExplorer = defineType({
  name: 'goalExplorer',
  title: 'Goal Explorer',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'goals',
      title: 'Goals',
      description: 'Curated goals to feature here. Leave empty on the frontend to fall back to all Verified goals.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'goal'}]})],
    }),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Goal Explorer', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
