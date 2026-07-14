import {defineField, defineType} from 'sanity'

/**
 * Email-led prompt + fallback email (component-inventory.md §4). The visible fallback email is
 * never removed even when a form is present (design/security-privacy.md).
 */
export const contactPrompt = defineType({
  name: 'contactPrompt',
  title: 'Contact Prompt',
  type: 'object',
  fields: [
    defineField({name: 'enabled', title: 'Enabled', type: 'boolean', initialValue: true}),
    defineField({name: 'theme', title: 'Theme', type: 'themeChoice'}),
    defineField({name: 'layout', title: 'Layout', type: 'layoutVariant'}),
    defineField({name: 'anchorId', title: 'Anchor ID', type: 'string'}),
    defineField({name: 'heading', title: 'Heading', type: 'string'}),
    defineField({name: 'body', title: 'Body', type: 'text', rows: 3}),
    defineField({name: 'cta', title: 'CTA', type: 'cta'}),
    defineField({
      name: 'supportEmail',
      title: 'Support email override',
      description: 'Optional — falls back to siteSettings.supportEmail.',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'heading', enabled: 'enabled'},
    prepare({title, enabled}) {
      return {title: title || 'Contact Prompt', subtitle: enabled === false ? 'Hidden' : undefined}
    },
  },
})
