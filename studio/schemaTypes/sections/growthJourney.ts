import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * 8-stage Online Growth Journey spectrum (component-inventory.md §3/§4 — `JourneySpectrum`) —
 * homepage block 5 and used again on `/how-it-works`.
 */
export const growthJourney = defineType({
  name: 'growthJourney',
  title: 'Growth Journey',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'stages',
      title: 'Stages',
      description: 'Normally all 8 stages, in order (order is authoritative on the growthStage document).',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'growthStage'}]})],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Growth Journey', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
