import {defineField, defineType} from 'sanity'

/**
 * Reusable media object (data-model.md → shared objects; FR-031). Alt text is required unless the
 * image is explicitly flagged decorative; focal point (hotspot) is always captured so crops stay
 * art-directed on every breakpoint.
 */
export const mediaImage = defineType({
  name: 'mediaImage',
  title: 'Media image',
  type: 'object',
  fields: [
    defineField({
      name: 'asset',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'mobileAsset',
      title: 'Mobile image override',
      description: 'Optional — only needed when the desktop crop/asset does not work at small sizes.',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'alt',
      title: 'Alternative text',
      description: 'Required unless this image is purely decorative.',
      type: 'string',
      validation: (Rule) =>
        Rule.custom((alt, context) => {
          const parent = context.parent as {decorative?: boolean} | undefined
          if (parent?.decorative) return true
          return alt && alt.trim().length > 0
            ? true
            : 'Alt text is required for meaningful images (set "Decorative" if this image conveys no content).'
        }),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
    defineField({
      name: 'decorative',
      title: 'Decorative',
      description: 'Mark true only if this image conveys no information (it will render with an empty alt attribute).',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {media: 'asset', alt: 'alt', decorative: 'decorative'},
    prepare({media, alt, decorative}) {
      return {
        title: alt || (decorative ? 'Decorative image' : 'Untitled image'),
        media,
      }
    },
  },
})
