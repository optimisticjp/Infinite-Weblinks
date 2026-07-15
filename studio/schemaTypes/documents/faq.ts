import {defineField, defineType} from 'sanity'

/**
 * A single FAQ item (data-model.md → content & editorial). Rendered by `faqSection` and the
 * `/faq` page; FAQPage JSON-LD only emits for the exact Q&A pairs that are actually visible on
 * that page (design/seo.md §4).
 */
export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  fields: [
    defineField({name: 'question', title: 'Question', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'question', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'category', title: 'Category', type: 'string'}),
    defineField({name: 'order', title: 'Order', type: 'number', validation: (Rule) => Rule.integer()}),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  orderings: [{title: 'Order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'question', status: 'contentStatus.status'},
    prepare({title, status}) {
      return {title, subtitle: status}
    },
  },
})
