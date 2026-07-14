import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * "Tools we can connect" (component-inventory.md §4) — homepage block 10. Never "partners"
 * (spec.md FR-023).
 */
export const toolUniverse = defineType({
  name: 'toolUniverse',
  title: 'Tool Universe',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', initialValue: 'Platforms and tools we work with'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'categories',
      title: 'Featured categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'toolCategory'}]})],
    }),
    defineField({
      name: 'featuredTools',
      title: 'Featured tools',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tool'}]})],
    }),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Tool Universe', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
