import {defineField, defineType} from 'sanity'

/**
 * Service grouping (Strategy, Branding, Websites, SEO, Ads, Social, Social Growth, Funnels,
 * Courses, Email/CRM, Ops, Retention, AI & Automation, Analytics, Security/Maintenance,
 * Marketplaces — data-model.md → taxonomy).
 */
export const serviceCategory = defineType({
  name: 'serviceCategory',
  title: 'Service Category',
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
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  orderings: [{title: 'Order', name: 'orderAsc', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'name'}},
})
