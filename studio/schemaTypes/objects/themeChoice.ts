import {defineType} from 'sanity'

/**
 * Approved section theme palette (data-model.md → shared objects; component-inventory.md §4).
 * Restricts every section's palette to the approved rhythm. The desk/frontend theme-sequence
 * validator (not this schema) warns when more than two `darkCinematic` sections are consecutive.
 */
export const themeChoice = defineType({
  name: 'themeChoice',
  title: 'Theme',
  type: 'string',
  options: {
    list: [
      {title: 'Dark cinematic', value: 'darkCinematic'},
      {title: 'Bright editorial', value: 'brightEditorial'},
      {title: 'Bold full-colour', value: 'boldFullColour'},
    ],
    layout: 'radio',
  },
  initialValue: 'darkCinematic',
  validation: (Rule) => Rule.required(),
})
