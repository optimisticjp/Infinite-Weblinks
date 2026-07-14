import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * One of the **3 exact, locked** cross-cutting systems that run across the journey, not stages
 * (spec.md Key Entities).
 */
export const CROSS_CUTTING_SYSTEM_NAMES = ['AI & Automation', 'Analytics & Data', 'Maintenance & Scale'] as const

export const crossCuttingSystem = defineType({
  name: 'crossCuttingSystem',
  title: 'Cross-Cutting System',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'Locked official name — one of the exact 3 system names.',
      type: 'string',
      options: {list: CROSS_CUTTING_SYSTEM_NAMES.map((name) => ({title: name, value: name}))},
      validation: (Rule) =>
        Rule.required().custom((value) =>
          value && (CROSS_CUTTING_SYSTEM_NAMES as readonly string[]).includes(value)
            ? true
            : `Must be one of the 3 locked system names: ${CROSS_CUTTING_SYSTEM_NAMES.join(' · ')}`,
        ),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 4}),
    defineField({
      name: 'relatedServices',
      title: 'Related services',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
    }),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  preview: {
    select: {title: 'name', status: 'contentStatus.status'},
    prepare({title, status}) {
      return {title, subtitle: status}
    },
  },
})
