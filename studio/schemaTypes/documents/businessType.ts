import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Audience axis (ecommerce, creator, local/service, B2B, software, established, beginner —
 * data-model.md → taxonomy). `roadmap` reference is intentionally omitted for now: the `roadmap`
 * document type is not part of this initial schema slice (lands with M7 — data-model.md
 * "Progressive implementation"); add a `roadmap` reference field here once that schema exists.
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
    defineField({
      name: 'relatedGoals',
      title: 'Related goals',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'goal'}]})],
    }),
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
