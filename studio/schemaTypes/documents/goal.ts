import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A visitor goal, e.g. "Launch a professional store" (data-model.md → taxonomy).
 */
export const goal = defineType({
  name: 'goal',
  title: 'Goal',
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
    defineField({name: 'audienceHint', title: 'Audience hint', type: 'string'}),
    defineField({name: 'whatYouNeed', title: 'What you need', type: 'text', rows: 4}),
    defineField({name: 'howWeHelp', title: 'How we help', type: 'text', rows: 4}),
    defineField({
      name: 'mainTools',
      title: 'Main tools',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tool'}]})],
    }),
    defineField({
      name: 'exampleTools',
      title: 'Example tools',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({name: 'outcome', title: 'Outcome', type: 'text', rows: 3}),
    defineField({
      name: 'stages',
      title: 'Stages',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'growthStage'}]})],
    }),
    defineField({
      name: 'services',
      title: 'Services',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
    }),
    defineField({
      name: 'order',
      title: 'Order',
      description: 'Manual display order where this goal appears in curated lists (e.g. Goal Explorer).',
      type: 'number',
      validation: (Rule) => Rule.integer(),
    }),
    defineField({name: 'icon', title: 'Icon', type: 'string', description: 'Lucide icon key, e.g. "compass".'}),
    defineField({name: 'color', title: 'Color', type: 'string', description: 'CSS custom-property token, e.g. var(--violet).'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
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
