import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * One of the **8 exact, locked** Online Growth Journey stages (spec.md Key Entities). Names are
 * constrained to the official list so editors cannot introduce a typo/variant of a locked name.
 */
export const GROWTH_STAGE_NAMES = [
  'Discovery & Plan',
  'Foundation',
  'Get Discovered',
  'Build Trust',
  'Convert',
  'Deliver & Operate',
  'Retain',
  'Advocacy & Growth',
] as const

export const growthStage = defineType({
  name: 'growthStage',
  title: 'Growth Stage',
  type: 'document',
  fields: [
    defineField({
      name: 'order',
      title: 'Order',
      description: 'Position in the 8-stage journey (1–8).',
      type: 'number',
      validation: (Rule) => Rule.required().integer().min(1).max(8),
    }),
    defineField({
      name: 'name',
      title: 'Name',
      description: 'Locked official name — one of the exact 8 stage names.',
      type: 'string',
      options: {list: GROWTH_STAGE_NAMES.map((name) => ({title: name, value: name}))},
      validation: (Rule) =>
        Rule.required().custom((value) =>
          value && (GROWTH_STAGE_NAMES as readonly string[]).includes(value)
            ? true
            : `Must be one of the 8 locked stage names: ${GROWTH_STAGE_NAMES.join(' · ')}`,
        ),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'plainSummary', title: 'Plain summary', type: 'text', rows: 3}),
    defineField({name: 'whatHappens', title: 'What happens', type: 'text', rows: 4}),
    defineField({name: 'outcome', title: 'Outcome', type: 'text', rows: 2}),
    defineField({
      name: 'relatedServices',
      title: 'Related services',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
    }),
    defineField({name: 'icon', title: 'Icon', type: 'string', description: 'Lucide icon key, e.g. "compass".'}),
    defineField({name: 'color', title: 'Color', type: 'string', description: 'CSS custom-property token, e.g. var(--violet).'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  orderings: [
    {
      title: 'Stage order',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {title: 'name', order: 'order'},
    prepare({title, order}) {
      return {title: `${order}. ${title}`}
    },
  },
})
