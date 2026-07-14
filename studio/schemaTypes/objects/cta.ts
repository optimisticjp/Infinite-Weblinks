import {defineField, defineType} from 'sanity'

/**
 * Approved-CTA object (data-model.md → shared objects; spec.md FR-041). Only the exact locked
 * labels and routes below may be used anywhere on the site — no "Book a Call", no scheduling
 * language, no ad-hoc routes (spec.md §1 "Email-led conversion only").
 */
export const APPROVED_CTA_LABELS = [
  'Build My Digital Growth Plan',
  'See How It All Works',
  'Send Us Your Goals',
  'Ask Our Team',
  'Send Us a Message',
  'Get My Recommended Starting Point',
] as const

export const APPROVED_CTA_ROUTES = ['/growth-plan', '/how-it-works', '/contact?subject=growth-goals', '/contact'] as const

export const cta = defineType({
  name: 'cta',
  title: 'CTA',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      description: 'Approved CTAs only (spec.md FR-041). No "Book a Call" or scheduling language.',
      type: 'string',
      options: {
        list: APPROVED_CTA_LABELS.map((label) => ({title: label, value: label})),
      },
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return 'A CTA label is required.'
          return (APPROVED_CTA_LABELS as readonly string[]).includes(value)
            ? true
            : `"${value}" is not an approved CTA label.`
        }),
    }),
    defineField({
      name: 'route',
      title: 'Route',
      description: 'Must be one of the approved CTA routes (spec.md FR-041).',
      type: 'string',
      options: {
        list: APPROVED_CTA_ROUTES.map((route) => ({title: route, value: route})),
      },
      validation: (Rule) =>
        Rule.required().custom((value) => {
          if (!value) return 'A route is required.'
          return (APPROVED_CTA_ROUTES as readonly string[]).includes(value)
            ? true
            : `"${value}" is not an approved route. Allowed: ${APPROVED_CTA_ROUTES.join(', ')}`
        }),
    }),
    defineField({
      name: 'style',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          {title: 'Primary', value: 'primary'},
          {title: 'Secondary', value: 'secondary'},
          {title: 'Text', value: 'text'},
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'ariaLabel',
      title: 'Accessible label override',
      description: 'Optional. Only set this if the visible label needs more context for screen readers.',
      type: 'string',
    }),
  ],
  preview: {
    select: {label: 'label', route: 'route'},
    prepare({label, route}) {
      return {title: label || 'CTA', subtitle: route}
    },
  },
})
