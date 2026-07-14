import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Learn/resource article (data-model.md → content & editorial; "Progressive implementation"
 * Milestone M8). `author` is optional and should only ever be rendered once `contentStatus` is
 * Verified/Ready to publish — no placeholder bios (FACTS_PACK "team bios ... hidden by default").
 */
export const article = defineType({
  name: 'article',
  title: 'Article',
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
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(240).warning('Excerpts longer than ~240 characters may be truncated in listings.'),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({type: 'block'}), defineArrayMember({type: 'mediaImage'})],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      description: 'Optional. Only display once this document is Verified/Ready to publish — no placeholder bios.',
      type: 'object',
      fields: [
        defineField({name: 'name', title: 'Name', type: 'string'}),
        defineField({name: 'role', title: 'Role', type: 'string'}),
      ],
    }),
    defineField({
      name: 'relatedServices',
      title: 'Related services',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
    }),
    defineField({
      name: 'relatedGoals',
      title: 'Related goals',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'goal'}]})],
    }),
    defineField({name: 'publishedAt', title: 'Published at', type: 'datetime'}),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  preview: {
    select: {title: 'title', author: 'author.name', status: 'contentStatus.status'},
    prepare({title, author, status}) {
      return {title, subtitle: [author, status].filter(Boolean).join(' · ')}
    },
  },
})
