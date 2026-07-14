import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Header navigation singleton (data-model.md → site configuration). `primaryItems` covers the nav
 * families (How It Works, Solutions, Services, Resources, About Us — spec.md FR-002);
 * `headerCtas` covers the two locked header CTAs (See How It All Works / Build My Digital Growth
 * Plan).
 */
export const navigation = defineType({
  name: 'navigation',
  title: 'Navigation',
  type: 'document',
  fields: [
    defineField({
      name: 'primaryItems',
      title: 'Primary nav items',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'primaryItem',
          fields: [
            defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'link', title: 'Link', type: 'link'}),
            defineField({
              name: 'megaMenu',
              title: 'Mega menu',
              description: 'Optional — only set for nav families that open a disclosure mega-menu rather than navigating directly.',
              type: 'reference',
              to: [{type: 'megaMenu'}],
            }),
          ],
          preview: {
            select: {title: 'label', megaMenu: 'megaMenu.title'},
            prepare({title, megaMenu}) {
              return {title, subtitle: megaMenu ? `Mega menu: ${megaMenu}` : 'Direct link'}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'headerCtas',
      title: 'Header CTAs',
      description: 'The two locked header CTAs: See How It All Works, Build My Digital Growth Plan.',
      type: 'array',
      of: [defineArrayMember({type: 'cta'})],
      validation: (Rule) => Rule.max(2),
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
      return {title: 'Navigation'}
    },
  },
})
