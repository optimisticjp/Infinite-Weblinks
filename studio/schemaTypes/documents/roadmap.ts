import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A suggested phase sequence for a business type (Growth Guide p.20–21 — data-model.md → taxonomy;
 * "Progressive implementation" Milestone M7). Each phase links the plain-English narrative to the
 * taxonomy graph (stage/services/tools/goals) so the roadmap stays in sync as that content changes.
 * `businessType.roadmap` points back at the single roadmap for that business type.
 */
export const roadmap = defineType({
  name: 'roadmap',
  title: 'Roadmap',
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
      name: 'forBusinessType',
      title: 'For business type',
      type: 'reference',
      to: [{type: 'businessType'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 4}),
    defineField({
      name: 'phases',
      title: 'Phases',
      description: 'Ordered sequence of phases — drag to reorder; order is authoritative as positioned here.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'phase',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3}),
            defineField({name: 'stage', title: 'Stage', type: 'reference', to: [{type: 'growthStage'}]}),
            defineField({
              name: 'services',
              title: 'Services',
              type: 'array',
              of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
            }),
            defineField({
              name: 'tools',
              title: 'Tools',
              type: 'array',
              of: [defineArrayMember({type: 'reference', to: [{type: 'tool'}]})],
            }),
            defineField({
              name: 'goals',
              title: 'Goals',
              type: 'array',
              of: [defineArrayMember({type: 'reference', to: [{type: 'goal'}]})],
            }),
          ],
          preview: {
            select: {title: 'title', stage: 'stage.name'},
            prepare({title, stage}) {
              return {title: title || 'Untitled phase', subtitle: stage}
            },
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).warning('A roadmap normally has at least one phase.'),
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  preview: {
    select: {title: 'name', businessType: 'forBusinessType.name', status: 'contentStatus.status'},
    prepare({title, businessType, status}) {
      return {title, subtitle: [businessType, status].filter(Boolean).join(' · ')}
    },
  },
})
