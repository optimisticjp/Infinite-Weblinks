import {defineField, defineType} from 'sanity'

/**
 * Image/illustration + copy, asymmetric (component-inventory.md §4) — used across various routes.
 */
export const mediaFeature = defineType({
  name: 'mediaFeature',
  title: 'Media Feature',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant', initialValue: 'split-left'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'body', title: 'Body', type: 'text', rows: 4}),
    defineField({name: 'media', title: 'Media', type: 'mediaImage', validation: (Rule) => Rule.required()}),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled', media: 'media.asset'},
    prepare({title, enabled, media}) {
      return {title: title || 'Media Feature', subtitle: enabled === false ? 'Hidden' : undefined, media}
    },
  },
})
