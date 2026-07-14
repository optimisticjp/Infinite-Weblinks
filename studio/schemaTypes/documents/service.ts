import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A single service, ~110+ in the full taxonomy (data-model.md → taxonomy; spec.md FR-020/FR-021).
 * Filterable by category, goal, growth stage, business type, delivery model, and tool.
 */
export const service = defineType({
  name: 'service',
  title: 'Service',
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
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'serviceCategory'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'deliveryModel',
      title: 'Delivery model',
      type: 'reference',
      to: [{type: 'deliveryModel'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'plainDescription', title: 'Plain description', type: 'text', rows: 4}),
    defineField({name: 'whatYouGet', title: 'What you get', type: 'text', rows: 4}),
    defineField({
      name: 'relatedTools',
      title: 'Related tools',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tool'}]})],
    }),
    defineField({
      name: 'relatedGoals',
      title: 'Related goals',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'goal'}]})],
    }),
    defineField({
      name: 'stages',
      title: 'Stages',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'growthStage'}]})],
    }),
    defineField({
      name: 'businessTypes',
      title: 'Business types',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'businessType'}]})],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  preview: {
    select: {title: 'name', category: 'category.name', status: 'contentStatus.status'},
    prepare({title, category, status}) {
      return {title, subtitle: [category, status].filter(Boolean).join(' · ')}
    },
  },
})
