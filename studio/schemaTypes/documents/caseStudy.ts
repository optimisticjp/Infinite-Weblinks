import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A case study (data-model.md → content & editorial; "Progressive implementation" Milestone M8).
 * PROOF CONTENT — placeholder-gated: defaults to Draft (hidden), and must never show a fabricated
 * client name, metric, or outcome (FACTS_PACK "No public placeholders").
 */
export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
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
      name: 'client',
      title: 'Client',
      description: 'Only name a real client once they have agreed to be named and this case study is Verified.',
      type: 'string',
    }),
    defineField({name: 'summary', title: 'Summary', type: 'text', rows: 3}),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [defineArrayMember({type: 'block'}), defineArrayMember({type: 'mediaImage'})],
    }),
    defineField({
      name: 'metrics',
      title: 'Metrics',
      description: 'Optional — real, verifiable metrics only, never illustrative/fabricated numbers.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'metric',
          fields: [
            defineField({name: 'label', title: 'Label', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'value', title: 'Value', type: 'string', validation: (Rule) => Rule.required()}),
            defineField({name: 'context', title: 'Context', type: 'string'}),
          ],
          preview: {select: {title: 'label', subtitle: 'value'}},
        }),
      ],
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({
      name: 'contentStatus',
      title: 'Content status',
      description: 'Defaults to Draft (hidden). Only Verified/Ready to publish case studies ever render publicly.',
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
    select: {title: 'title', client: 'client', status: 'contentStatus.status'},
    prepare({title, client, status}) {
      return {title, subtitle: [client, status].filter(Boolean).join(' · ')}
    },
  },
})
