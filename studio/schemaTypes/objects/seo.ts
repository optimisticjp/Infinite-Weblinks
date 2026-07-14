import {defineField, defineType} from 'sanity'

/**
 * Reusable per-document SEO object (data-model.md → shared objects). Drives `generateMetadata`
 * and JSON-LD on the Next.js side (see design/seo.md §4). `structuredDataType` is only a hint for
 * the frontend/editors — the app still derives real structured data from the actual rendered
 * content, never from unverified fields.
 */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Meta title',
      type: 'string',
      validation: (Rule) => Rule.max(60).warning('Titles longer than ~60 characters may be truncated in search results.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(160).warning('Descriptions longer than ~160 characters may be truncated in search results.'),
    }),
    defineField({
      name: 'canonicalUrl',
      title: 'Canonical URL override',
      description: 'Only set this to override the default self-canonical URL (e.g. for a duplicate/near-duplicate page).',
      type: 'url',
    }),
    defineField({
      name: 'ogTitle',
      title: 'Open Graph title',
      description: 'Falls back to the meta title if left blank.',
      type: 'string',
    }),
    defineField({
      name: 'ogDescription',
      title: 'Open Graph description',
      description: 'Falls back to the meta description if left blank.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'noindex',
      title: 'Noindex this page',
      description: 'Adds a robots noindex,follow meta tag. Independent of contentStatus.noindex, which additionally excludes the source document from being queried at all.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'structuredDataType',
      title: 'Structured data hint',
      description: 'Which JSON-LD shape this route should emit (see design/seo.md §4). Editorial hint only — the app still only emits schema for verified, currently-true content.',
      type: 'string',
      options: {
        list: [
          {title: 'None', value: 'none'},
          {title: 'Organization', value: 'Organization'},
          {title: 'WebSite', value: 'WebSite'},
          {title: 'BreadcrumbList', value: 'BreadcrumbList'},
          {title: 'Service', value: 'Service'},
          {title: 'Article', value: 'Article'},
          {title: 'FAQPage', value: 'FAQPage'},
          {title: 'ItemList', value: 'ItemList'},
        ],
      },
      initialValue: 'none',
    }),
  ],
})
