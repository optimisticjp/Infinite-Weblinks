import {defineType} from 'sanity'

/**
 * Approved layout variant (data-model.md → shared objects: "enum per section type ... constrained
 * to approved variants only"). A single named type is reused across every section so the list of
 * allowed values stays centrally controlled; not every section uses every variant — component
 * authors on the frontend should treat an inapplicable variant as "centered" and editors should
 * only pick a variant that the section's own preview visibly supports.
 */
export const layoutVariant = defineType({
  name: 'layoutVariant',
  title: 'Layout variant',
  type: 'string',
  options: {
    list: [
      {title: 'Split — content left', value: 'split-left'},
      {title: 'Split — content right', value: 'split-right'},
      {title: 'Centered', value: 'centered'},
      {title: 'Rail (connected sequence)', value: 'rail'},
      {title: 'Grid', value: 'grid'},
      {title: 'Stacked', value: 'stacked'},
      {title: 'Full bleed', value: 'fullBleed'},
    ],
  },
  initialValue: 'centered',
  validation: (Rule) => Rule.required(),
})
