import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Big-type reading moment (component-inventory.md §4), e.g. "The digital world keeps getting
 * bigger" — homepage block 3.
 */
export const editorialStatement = defineType({
  name: 'editorialStatement',
  title: 'Editorial Statement',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({name: 'aside', title: 'Aside', description: 'Optional supporting note.', type: 'text', rows: 2}),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Editorial Statement', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
