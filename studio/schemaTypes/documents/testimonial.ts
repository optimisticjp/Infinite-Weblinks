import {defineField, defineType} from 'sanity'

/**
 * A testimonial quote (data-model.md → content & editorial; "Progressive implementation"
 * Milestone M8). PROOF CONTENT — placeholder-gated: defaults to Draft (hidden), never a fabricated
 * quote or attribution (FACTS_PACK "No public placeholders"). No standalone page/SEO — testimonials
 * are always shown embedded (e.g. `testimonialWall`).
 */
export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({name: 'quote', title: 'Quote', type: 'text', rows: 4, validation: (Rule) => Rule.required()}),
    defineField({
      name: 'attribution',
      title: 'Attribution',
      description: 'e.g. name, role, business — only real, agreed attribution once Verified.',
      type: 'string',
    }),
    defineField({
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: (Rule) => Rule.min(1).max(5).integer(),
    }),
    defineField({
      name: 'contentStatus',
      title: 'Content status',
      description: 'Defaults to Draft (hidden). Only Verified/Ready to publish testimonials ever render publicly.',
      type: 'contentStatus',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {quote: 'quote', attribution: 'attribution', status: 'contentStatus.status'},
    prepare({quote, attribution, status}) {
      const title = quote ? (quote.length > 60 ? `${quote.slice(0, 57)}...` : quote) : 'Untitled testimonial'
      return {title, subtitle: [attribution, status].filter(Boolean).join(' · ')}
    },
  },
})
