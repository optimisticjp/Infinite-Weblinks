import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * An illustrative example (data-model.md → content & editorial; "Progressive implementation"
 * Milestone M8). PROOF CONTENT: like `caseStudy`/`testimonial`, this only ever renders once
 * `contentStatus` is Verified/Ready to publish — no public placeholders (FACTS_PACK "No public
 * placeholders"). No `seo` field by design — data-model.md keeps examples lightweight.
 */
export const example = defineType({
  name: 'example',
  title: 'Example',
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
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3}),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({type: 'block'}), defineArrayMember({type: 'mediaImage'})],
    }),
    defineField({
      name: 'contentStatus',
      title: 'Content status',
      description: 'Defaults to Draft (hidden). Only Verified/Ready to publish examples ever render publicly.',
      type: 'contentStatus',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'proofVerification',
      title: 'Publication verification',
      description:
        'A second gate on top of status: consent + identity + claims + owner approval + an internal evidence reference are ALL required before this renders. No PII / evidence stored here.',
      type: 'proofVerification',
    }),
  ],
  preview: {
    select: {title: 'title', status: 'contentStatus.status'},
    prepare({title, status}) {
      return {title, subtitle: status}
    },
  },
})
