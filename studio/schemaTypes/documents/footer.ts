import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Footer singleton (data-model.md → site configuration; spec.md FR-006). Social platforms are
 * locked to Facebook/Instagram/YouTube/Pinterest and stay hidden until a valid URL exists.
 * Deliberately **no phone field** anywhere in this schema.
 */
export const footer = defineType({
  name: 'footer',
  title: 'Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerColumn',
          fields: [
            defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [defineArrayMember({type: 'link'})],
            }),
          ],
          preview: {select: {title: 'heading'}},
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'socialLink',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  {title: 'Facebook', value: 'Facebook'},
                  {title: 'Instagram', value: 'Instagram'},
                  {title: 'YouTube', value: 'YouTube'},
                  {title: 'Pinterest', value: 'Pinterest'},
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({name: 'url', title: 'URL', type: 'url'}),
            defineField({
              name: 'enabled',
              title: 'Enabled',
              description: 'Hidden until this is true AND a valid URL exists.',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'ariaLabel',
              title: 'Accessible label',
              description: 'e.g. "Infinite Weblinks on Instagram (opens in a new tab)".',
              type: 'string',
            }),
          ],
          preview: {
            select: {title: 'platform', url: 'url', enabled: 'enabled'},
            prepare({title, url, enabled}) {
              return {title, subtitle: enabled ? url : 'Hidden'}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'legalLinks',
      title: 'Legal links',
      type: 'array',
      of: [defineArrayMember({type: 'link'})],
    }),
    defineField({
      name: 'supportEmail',
      title: 'Support email',
      type: 'string',
      validation: (Rule) =>
        Rule.required().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {name: 'email', invert: false}),
    }),
    defineField({
      name: 'contentStatus',
      title: 'Content status',
      type: 'contentStatus',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Footer'}
    },
  },
})
