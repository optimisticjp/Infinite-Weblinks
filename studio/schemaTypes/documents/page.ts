import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Composable page document (data-model.md → "Modular page model"). `sections` is a **closed**
 * array of approved section objects only (component-inventory.md §4; spec.md FR-031) — editors
 * add/reorder/hide sections, never write arbitrary HTML/CSS. Used for `/`, `/how-it-works`,
 * `/about`, `/resources`, `/solutions/[slug]`, legal pages, etc.
 *
 * `roadmapShowcase`, `caseStudyShowcase`, and `testimonialWall` are included in the allowed list
 * for schema completeness (component-inventory.md §4) but their referenced document types
 * (`roadmap`, `caseStudy`, `testimonial`) are **not yet part of this initial schema slice** — they
 * land with M7/M8 (data-model.md "Progressive implementation"). Until then those three section
 * types have nothing to reference and should stay `enabled: false` in content.
 */
export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      description: 'Ordered, approved section types only. Hidden/unapproved sections never render publicly.',
      type: 'array',
      of: [
        defineArrayMember({type: 'heroConnectedUniverse'}),
        defineArrayMember({type: 'editorialStatement'}),
        defineArrayMember({type: 'goalExplorer'}),
        defineArrayMember({type: 'growthJourney'}),
        defineArrayMember({type: 'startingPointSelector'}),
        defineArrayMember({type: 'servicesExplorer'}),
        defineArrayMember({type: 'toolUniverse'}),
        defineArrayMember({type: 'deliveryModels'}),
        defineArrayMember({type: 'processSteps'}),
        defineArrayMember({type: 'whyInfiniteWeblinks'}),
        defineArrayMember({type: 'faqSection'}),
        defineArrayMember({type: 'finalCtaBanner'}),
        defineArrayMember({type: 'richText'}),
        defineArrayMember({type: 'mediaFeature'}),
        defineArrayMember({type: 'logoStrip'}),
        defineArrayMember({type: 'contactPrompt'}),
        // Deferred to M7/M8 — kept in the allowed list per data-model.md's "designed up front,
        // built in slices" principle; disable in content until roadmap/caseStudy/testimonial ship.
        defineArrayMember({type: 'roadmapShowcase'}),
        defineArrayMember({type: 'caseStudyShowcase'}),
        defineArrayMember({type: 'testimonialWall'}),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
    defineField({
      name: 'contentStatus',
      title: 'Content status',
      type: 'contentStatus',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current', status: 'contentStatus.status'},
    prepare({title, slug, status}) {
      return {title, subtitle: slug ? `/${slug} · ${status || 'draft'}` : status}
    },
  },
})
