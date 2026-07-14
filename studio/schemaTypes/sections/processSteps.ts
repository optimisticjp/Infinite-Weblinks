import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * 8-step working process (Growth Guide p.23 — component-inventory.md §4) — homepage block 12.
 * Inline steps rather than references: this is the team's working process, not the visitor-facing
 * growth-stage taxonomy.
 */
export const processSteps = defineType({
  name: 'processSteps',
  title: 'Process Steps',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'intro', title: 'Intro', type: 'text', rows: 3}),
    defineField({
      name: 'steps',
      title: 'Steps',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'step',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
            defineField({name: 'icon', title: 'Lucide icon name', type: 'string'}),
          ],
          preview: {select: {title: 'title'}},
        }),
      ],
      validation: (Rule) => Rule.max(8),
    }),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Process Steps', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
