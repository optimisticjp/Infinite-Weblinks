import {defineField, defineType} from 'sanity'

/**
 * Tool grouping (Websites/hosting, Ecommerce/ops, Email/SMS/CRM, Funnels, Courses, Loyalty, SEO,
 * Analytics, Automation/AI, Support/security/legal — data-model.md → taxonomy).
 */
export const toolCategory = defineType({
  name: 'toolCategory',
  title: 'Tool Category',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'order', title: 'Order', type: 'number', validation: (Rule) => Rule.integer()}),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  orderings: [{title: 'Order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {
    select: {title: 'name', order: 'order', status: 'contentStatus.status'},
    prepare({title, order, status}) {
      const subtitle = [order != null ? `#${order}` : undefined, status].filter(Boolean).join(' · ')
      return {title, subtitle: subtitle || undefined}
    },
  },
})
