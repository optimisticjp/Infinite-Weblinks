import {defineField, defineType} from 'sanity'

/**
 * Reusable nav/footer link object (data-model.md → shared objects): either an internal reference
 * to a document with a route, or an external URL. Used by navigation, megaMenu, and footer.
 */
export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'linkType',
      title: 'Link type',
      type: 'string',
      options: {
        list: [
          {title: 'Internal page/document', value: 'internal'},
          {title: 'External URL', value: 'external'},
        ],
        layout: 'radio',
      },
      initialValue: 'internal',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'internalRef',
      title: 'Internal reference',
      type: 'reference',
      to: [
        {type: 'page'},
        {type: 'goal'},
        {type: 'service'},
        {type: 'serviceCategory'},
        {type: 'tool'},
        {type: 'toolCategory'},
        {type: 'businessType'},
        {type: 'startingPoint'},
        {type: 'growthStage'},
        {type: 'faq'},
      ],
      hidden: ({parent}) => parent?.linkType !== 'internal',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {linkType?: string} | undefined
          if (parent?.linkType === 'internal' && !value) return 'Choose an internal document to link to.'
          return true
        }),
    }),
    defineField({
      name: 'externalUrl',
      title: 'External URL',
      type: 'url',
      hidden: ({parent}) => parent?.linkType !== 'external',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as {linkType?: string} | undefined
          if (parent?.linkType === 'external' && !value) return 'Enter the external URL.'
          return true
        }),
    }),
    defineField({
      name: 'openInNew',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {label: 'label', linkType: 'linkType', externalUrl: 'externalUrl', internalTitle: 'internalRef.title', internalName: 'internalRef.name'},
    prepare({label, linkType, externalUrl, internalTitle, internalName}) {
      const subtitle = linkType === 'external' ? externalUrl : internalTitle || internalName
      return {title: label || 'Link', subtitle}
    },
  },
})
