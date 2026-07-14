import {defineField, defineType} from 'sanity'

/**
 * Global site configuration singleton (data-model.md → site configuration). Pinned at the top of
 * the desk structure with a single fixed document id ("siteSettings").
 */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'supportEmail',
      title: 'Support email',
      description: 'Shown as the visible fallback contact method site-wide (never removed even when a form is present).',
      type: 'string',
      validation: (Rule) =>
        Rule.required().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {name: 'email', invert: false}),
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      description: 'Fallback SEO fields used when a page does not set its own.',
      type: 'seo',
    }),
    defineField({
      name: 'organizationInfo',
      title: 'Organization info',
      description: 'Verified fields only — no fake data. Feeds the Organization JSON-LD (design/seo.md §4). No phone field by design.',
      type: 'object',
      fields: [
        defineField({name: 'legalName', title: 'Legal name', type: 'string'}),
        defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
        defineField({name: 'logo', title: 'Logo', type: 'mediaImage'}),
        defineField({
          name: 'sameAs',
          title: 'Verified profile URLs (sameAs)',
          description: 'Only include URLs for profiles that are real and currently live.',
          type: 'array',
          of: [defineField({name: 'url', type: 'url', title: 'URL'})],
        }),
      ],
    }),
    defineField({
      name: 'announcementBar',
      title: 'Announcement bar',
      type: 'object',
      fields: [
        defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false}),
        defineField({name: 'message', title: 'Message', type: 'string'}),
        defineField({name: 'link', title: 'Link', type: 'link'}),
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
    prepare() {
      return {title: 'Site Settings'}
    },
  },
})
