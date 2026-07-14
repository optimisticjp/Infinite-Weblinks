import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * "Where are you now?" entry point (Growth Guide p.4 — data-model.md → taxonomy).
 */
export const startingPoint = defineType({
  name: 'startingPoint',
  title: 'Starting Point',
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
    defineField({name: 'description', title: 'Description', type: 'text', rows: 4}),
    defineField({
      name: 'recommendedStage',
      title: 'Recommended stage',
      type: 'reference',
      to: [{type: 'growthStage'}],
    }),
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
