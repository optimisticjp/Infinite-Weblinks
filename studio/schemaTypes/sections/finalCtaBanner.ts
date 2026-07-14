import {defineField, defineType} from 'sanity'

/**
 * Final Growth Plan CTA banner (component-inventory.md §4) — homepage block 18.
 */
export const finalCtaBanner = defineType({
  name: 'finalCtaBanner',
  title: 'Final CTA Banner',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'body', title: 'Body', type: 'text', rows: 3}),
    defineField({
      name: 'cta',
      title: 'CTA',
      description: 'Single primary action (component-inventory.md CtaBanner: "single primary action").',
      type: 'cta',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Final CTA Banner', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
