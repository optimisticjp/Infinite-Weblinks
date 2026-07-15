import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Testimonials (component-inventory.md §4) — homepage block 15, placeholder-gated. References the
 * `testimonial` document type (data-model.md → content & editorial; "Progressive implementation"
 * Milestone M8 — now part of this schema). Defaults to `enabled: false`: editors should only switch
 * this on once at least one `testimonial` is Verified — the frontend must also auto-hide when no
 * referenced testimonial is Verified (no empty frames — data-model.md "Section validation rules").
 */
export const testimonialWall = defineType({
  name: 'testimonialWall',
  title: 'Testimonial Wall',
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
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'testimonial'}]})],
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {
        title: title || 'Testimonial Wall',
        subtitle: enabled ? 'Enabled — auto-hides until a testimonial is Verified' : 'Hidden',
      }
    },
  },
})
