import {defineField, defineType} from 'sanity'

/**
 * Status-gating object embedded on every publishable document (data-model.md → "Modelling
 * principles" and `contentStatus` shared object). Public GROQ queries MUST filter
 * `contentStatus.status in ["verified", "readyToPublish"]`; Draft/Placeholder/Approval-required
 * content never reaches production (brief §14, spec.md FR-032).
 */
export const contentStatus = defineType({
  name: 'contentStatus',
  title: 'Content status',
  type: 'object',
  fields: [
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Placeholder', value: 'placeholder'},
          {title: 'Approval required', value: 'approvalRequired'},
          {title: 'Verified', value: 'verified'},
          {title: 'Ready to publish', value: 'readyToPublish'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'noindex',
      title: 'Noindex',
      description: 'Exclude this document from the sitemap and add a robots noindex directive.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'reviewNote',
      title: 'Review note',
      description: 'Optional editorial note for reviewers (e.g. what still needs verification).',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: {status: 'status', noindex: 'noindex'},
    prepare({status, noindex}) {
      return {
        title: status ? String(status) : 'draft',
        subtitle: noindex ? 'noindex' : undefined,
      }
    },
  },
})
