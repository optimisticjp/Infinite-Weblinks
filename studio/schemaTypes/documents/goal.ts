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
    defineField({name: 'whatYouNeed', title: 'What you need', type: 'text', rows: 4}),
    defineField({name: 'howWeHelp', title: 'How we help', type: 'text', rows: 4}),
    defineField({
      name: 'mainTools',
      title: 'Main tools',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tool'}]})],
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
