import {defineField, defineType} from 'sanity'

/**
 * A downloadable/linked resource or guide (data-model.md → content & editorial; "Progressive
 * implementation" Milestone M8). `file` and `link` are both optional but at least one should be
 * provided so the resource has something to open (warning-level — not a hard block while drafting).
 */
export const resource = defineType({
  name: 'resource',
  title: 'Resource',
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
    defineField({name: 'description', title: 'Description', type: 'text', rows: 4}),
    defineField({name: 'file', title: 'File', description: 'Optional downloadable file.', type: 'file'}),
    defineField({
      name: 'link',
      title: 'External link',
      description: 'Optional external URL, e.g. a hosted guide.',
      type: 'url',
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  validation: (Rule) =>
    Rule.custom((doc) => {
      const value = doc as {file?: unknown; link?: string} | undefined
      return value?.file || value?.link
        ? true
        : 'Provide either a file or an external link so this resource has something to open.'
    }).warning(),
  preview: {
    select: {title: 'title', status: 'contentStatus.status'},
    prepare({title, status}) {
      return {title, subtitle: status}
    },
  },
})
