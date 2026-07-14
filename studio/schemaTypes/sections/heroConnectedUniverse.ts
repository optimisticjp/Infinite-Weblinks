import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * The homepage hero (component-inventory.md §3/§4 — `HeroConnectedUniverse` + `HeroCopy`).
 * Server-rendered headline/copy/CTAs for SEO/AEO; the animated infinity + domain-node illustration
 * is a client island layered over it on the frontend.
 */
export const heroConnectedUniverse = defineType({
  name: 'heroConnectedUniverse',
  title: 'Hero — Connected Universe',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'eyebrow', title: 'Eyebrow', type: 'string', initialValue: 'DIGITAL GROWTH PARTNER'}),
    defineField({name: 'headline', title: 'Headline', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({name: 'supportCopy', title: 'Support copy', type: 'text', rows: 3}),
    defineField({
      name: 'nodes',
      title: 'Domain nodes',
      description: 'The 6 connected-universe domain nodes (Website/Store, Search & Advertising, Social & Content, Customer Tools, Analytics, Automation & AI).',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'node',
          fields: [
            defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'description', title: 'Description', type: 'text', rows: 2}),
            defineField({name: 'icon', title: 'Lucide icon name', type: 'string'}),
          ],
          preview: {select: {title: 'label'}},
        }),
      ],
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: 'ctas',
      title: 'CTAs',
      type: 'array',
      of: [defineArrayMember({type: 'cta'})],
      validation: (Rule) => Rule.max(2),
    }),
    defineField({name: 'reassurance', title: 'Reassurance line', type: 'string'}),
  ],
  preview: {
    select: {title: 'headline', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Hero — Connected Universe', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
