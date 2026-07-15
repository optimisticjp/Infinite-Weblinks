import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Privacy/cookies/terms/accessibility page (data-model.md → content & editorial; "Progressive
 * implementation" Milestone M8). `reviewFlag` is a free-text note so editors can record where a
 * page stands with professional legal review — it defaults to a visible "pending" note rather than
 * silently implying the page has already been reviewed.
 */
export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal Page',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'lastReviewed', title: 'Last reviewed', type: 'date'}),
    defineField({
      name: 'reviewFlag',
      title: 'Review flag',
      description: 'Free-text note on legal review status, e.g. "Professional review pending".',
      type: 'string',
      initialValue: 'Professional review pending',
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current', status: 'contentStatus.status'},
    prepare({title, slug, status}) {
      return {title, subtitle: slug ? `/${slug} · ${status || 'draft'}` : status}
    },
  },
})
