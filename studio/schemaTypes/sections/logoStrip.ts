import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * "Platforms and tools we work with" (component-inventory.md §4). Logos come from `tool.logo` —
 * never labelled "partners" (spec.md FR-023).
 */
export const logoStrip = defineType({
  name: 'logoStrip',
  title: 'Logo Strip',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Platforms and tools we work with',
      validation: (Rule) =>
        Rule.custom((value) =>
          value && /partner/i.test(value) ? 'Do not use formal "partner" wording here (spec.md FR-023).' : true,
        ),
    }),
    defineField({
      name: 'tools',
      title: 'Tools',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tool'}]})],
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Logo Strip', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
