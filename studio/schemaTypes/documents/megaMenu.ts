import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * One mega-menu family (How It Works / Solutions / Services / Resources — design/sitemap-and-routes.md
 * "Navigation information architecture"). Not a singleton — there is one document per family,
 * referenced from `navigation.primaryItems[].megaMenu`.
 */
export const megaMenu = defineType({
  name: 'megaMenu',
  title: 'Mega Menu',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      description: 'Internal title (also used as the family heading), e.g. "How It Works".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'column',
          fields: [
            defineField({name: 'heading', title: 'Heading', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({
              name: 'items',
              title: 'Items',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'menuItem',
                  fields: [
                    defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
                    defineField({name: 'link', title: 'Link', type: 'link', validation: (Rule) => Rule.required()}),
                    defineField({name: 'description', title: 'Description', type: 'string'}),
                    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
                  ],
                  preview: {
                    select: {title: 'label', enabled: 'enabled'},
                    prepare({title, enabled}) {
                      return {title, subtitle: enabled === false ? 'Hidden' : undefined}
                    },
                  },
                }),
              ],
            }),
            defineField({
              name: 'promoCard',
              title: 'Promo card',
              description: 'Optional promoted card, e.g. "Not sure where to start? → Build My Digital Growth Plan".',
              type: 'object',
              fields: [
                defineField({name: 'heading', title: 'Heading', type: 'string'}),
                defineField({name: 'body', title: 'Body', type: 'text', rows: 2}),
                defineField({name: 'cta', title: 'CTA', type: 'cta'}),
              ],
            }),
          ],
          preview: {
            select: {title: 'heading'},
          },
        }),
      ],
    }),
    defineField({
      name: 'contentStatus',
      title: 'Content status',
      type: 'contentStatus',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title'},
  },
})
