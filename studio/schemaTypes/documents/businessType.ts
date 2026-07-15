import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Audience axis (ecommerce, creator, local/service, B2B, software, established, beginner —
 * data-model.md → taxonomy). `roadmap` references the single suggested-sequence roadmap for this
 * business type (Milestone M7 — now part of this schema).
 */
export const businessType = defineType({
  name: 'businessType',
  title: 'Business Type',
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
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 4}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 4}),
    defineField({
      name: 'relatedGoals',
      title: 'Related goals',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'goal'}]})],
    }),
    defineField({
      name: 'roadmap',
      title: 'Roadmap',
      description: 'The suggested phase sequence for this business type (data-model.md → taxonomy).',
      type: 'reference',
      to: [{type: 'roadmap'}],
    }),
    defineField({name: 'icon', title: 'Icon', type: 'string', description: 'Lucide icon key, e.g. "compass".'}),
    defineField({name: 'color', title: 'Color', type: 'string', description: 'CSS custom-property token, e.g. var(--violet).'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  preview: {
    select: {title: 'name', status: 'contentStatus.status'},
    prepare({title, status}) {
      return {title, subtitle: status}
    },
  },
})
