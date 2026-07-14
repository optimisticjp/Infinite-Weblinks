import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Testimonials (component-inventory.md §4) — homepage block 15, placeholder-gated.
 *
 * DEFERRED: the `testimonial` document type is not part of this initial schema slice — it lands
 * with Milestone M8 (data-model.md "Progressive implementation"). Included now for schema
 * completeness only; keep `enabled: false` until `testimonial` exists and has Verified content.
 * The frontend must auto-hide this section when no referenced testimonial is Verified (no empty
 * frames — data-model.md "Section validation rules").
 */
export const testimonialWall = defineType({
  name: 'testimonialWall',
  title: 'Testimonial Wall (deferred — M8)',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: false}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      description: 'References the M8 `testimonial` document type once it exists.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'testimonial'}]})],
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Testimonial Wall', subtitle: enabled ? 'Deferred to M8' : 'Hidden (deferred to M8)'}
    },
  },
})
