import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * A platform/tool "we can connect", ~80+ in the full taxonomy (data-model.md → taxonomy; spec.md
 * FR-022/FR-023). The 6 explanation fields required by FR-022: whatItDoes, whyUseful,
 * connectsWith[], suitsBusinessTypes[], whenNotNeeded, relatedServices[]. The logo is explicitly
 * labelled non-partner — never use formal "partner" wording (FR-023).
 */
export const tool = defineType({
  name: 'tool',
  title: 'Tool',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string', validation: (Rule) => Rule.required()}),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'name', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{type: 'toolCategory'}],
      validation: (Rule) => Rule.required(),
    }),
    defineField({name: 'whatItDoes', title: 'What it does', type: 'text', rows: 4, validation: (Rule) => Rule.required()}),
    defineField({name: 'whyUseful', title: 'Why it may be useful', type: 'text', rows: 4}),
    defineField({
      name: 'connectsWith',
      title: 'Connects with',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tool'}]})],
    }),
    defineField({
      name: 'suitsBusinessTypes',
      title: 'Suits business types',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'businessType'}]})],
    }),
    defineField({name: 'whenNotNeeded', title: 'When it may not be needed', type: 'text', rows: 3}),
    defineField({
      name: 'relatedServices',
      title: 'Related services',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'service'}]})],
    }),
    defineField({
      name: 'exampleTools',
      title: 'Example tools',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'stages',
      title: 'Stages',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'growthStage'}]})],
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      description: 'Labelled as "platforms and tools we work with" / "examples of tools we can connect" — never formal partnership wording.',
      type: 'mediaImage',
    }),
    defineField({name: 'seo', title: 'SEO', type: 'seo'}),
    defineField({name: 'contentStatus', title: 'Content status', type: 'contentStatus', validation: (Rule) => Rule.required()}),
  ],
  preview: {
    select: {title: 'name', category: 'category.name', status: 'contentStatus.status', media: 'logo.asset'},
    prepare({title, category, status, media}) {
      return {title, subtitle: [category, status].filter(Boolean).join(' · '), media}
    },
  },
})
