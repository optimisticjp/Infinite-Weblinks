import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * FAQ accordion (component-inventory.md §4) — homepage block 17 and the `/faq` page. FAQPage
 * JSON-LD only emits when this section is visibly rendered (design/seo.md §4).
 */
export const faqSection = defineType({
  name: 'faqSection',
  title: 'FAQ Section',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'faq'}]})],
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'FAQ Section', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
