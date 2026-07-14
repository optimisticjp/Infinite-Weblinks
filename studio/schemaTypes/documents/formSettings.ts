import {defineField, defineType} from 'sanity'

/**
 * Form configuration singleton (data-model.md → "formSettings ... part of the initial slice").
 * CMS-editable Formspree endpoint IDs and per-form success copy for the Growth Plan Builder and
 * Contact form (contracts/forms-and-email.md). Formspree form IDs are semi-public by nature (see
 * design/environment.md §2) — this document intentionally stores **no secrets**: no Turnstile
 * secret key, no API tokens.
 */
export const formSettings = defineType({
  name: 'formSettings',
  title: 'Form Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'growthPlanFormId',
      title: 'Growth Plan Builder — Formspree form ID',
      description: 'Matches NEXT_PUBLIC_FORMSPREE_GROWTH_PLAN_ID at deploy time; stored here so editors can update it without a redeploy of copy.',
      type: 'string',
    }),
    defineField({
      name: 'growthPlanSuccessMessage',
      title: 'Growth Plan Builder — success message',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'contactFormId',
      title: 'Contact form — Formspree form ID',
      description: 'Matches NEXT_PUBLIC_FORMSPREE_CONTACT_ID at deploy time.',
      type: 'string',
    }),
    defineField({
      name: 'contactSuccessMessage',
      title: 'Contact form — success message',
      type: 'text',
      rows: 3,
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
      return {title: 'Form Settings'}
    },
  },
})
