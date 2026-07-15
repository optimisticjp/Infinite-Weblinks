import {defineField, defineType} from 'sanity'

/**
 * One of the **4 exact, locked** delivery models (spec.md Key Entities / FR-021), plus the shared
 * ownership line that must accompany every model.
 */
export const DELIVERY_MODEL_NAMES = [
  'We Do the Work',
  'We Bring In an Expert',
  'We Run It End to End',
  'You Run It After',
] as const

export const OWNERSHIP_LINE =
  'Clients own their accounts, data and tools, whichever model applies; nothing is locked to Infinite Weblinks.'

export const deliveryModel = defineType({
  name: 'deliveryModel',
  title: 'Delivery Model',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'Locked official name — one of the exact 4 delivery models.',
      type: 'string',
      options: {list: DELIVERY_MODEL_NAMES.map((name) => ({title: name, value: name}))},
      validation: (Rule) =>
        Rule.required().custom((value) =>
          value && (DELIVERY_MODEL_NAMES as readonly string[]).includes(value)
            ? true
            : `Must be one of the 4 locked delivery models: ${DELIVERY_MODEL_NAMES.join(' · ')}`,
        ),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'key',
      title: 'Key',
      type: 'string',
      description: 'Stable key used by the app: we-do | we-expert | we-run | you-run.',
    }),
    defineField({name: 'tagline', title: 'Tagline', type: 'string'}),
    defineField({name: 'description', title: 'Description', type: 'text', rows: 4}),
    defineField({
      name: 'ownershipLine',
      title: 'Ownership line',
      description: 'Shared constant clarifying that clients own their accounts/data/tools.',
      type: 'text',
      rows: 2,
      initialValue: OWNERSHIP_LINE,
      validation: (Rule) => Rule.required(),
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
