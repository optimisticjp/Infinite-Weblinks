import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * "Where are you now?" entry point (Growth Guide p.4 — data-model.md → taxonomy).
 */
export const startingPoint = defineType({
  name: 'startingPoint',
  title: 'Starting Point',
  type: 'document',
  fields: [
    defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'label', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'situation', title: 'Situation', type: 'text', rows: 3}),
    defineField({name: 'recommendation', title: 'Recommendation', type: 'text', rows: 3}),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
    defineField({name: 'icon', title: 'Icon', type: 'string', description: 'Lucide icon key, e.g. "compass".'}),
    defineField({name: 'color', title: 'Color', type: 'string', description: 'CSS custom-property token, e.g. var(--violet).'}),
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
    select: {title: 'label', status: 'contentStatus.status'},
    prepare({title, status}) {
      return {title, subtitle: status}
    },
  },
})
