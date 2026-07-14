import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Composable page document (data-model.md → "Modular page model"). `sections` is a **closed**
 * array of approved section objects only (component-inventory.md §4; spec.md FR-031) — editors
 * add/reorder/hide sections, never write arbitrary HTML/CSS. Used for `/`, `/how-it-works`,
 * `/about`, `/resources`, `/solutions/[slug]`, legal pages, etc.
 *
 * `roadmapShowcase`, `caseStudyShowcase`, and `testimonialWall` reference the `roadmap`/`caseStudy`/
 * `testimonial` document types, which now exist (data-model.md "Progressive implementation"
 * Milestones M7/M8). `caseStudyShowcase`/`testimonialWall` stay placeholder-gated — the frontend
 * must still auto-hide them (and `roadmapShowcase`) whenever their referenced documents are not
 * Verified/Ready to publish (data-model.md "Section validation rules").
 *
 * Document-level validation below best-effort warns editors when more than two consecutive
 * *enabled* sections share the `darkCinematic` theme, per the approved section-rhythm rule
 * (data-model.md "Section validation rules"; FACTS_PACK "never more than ~2 dark sections
 * consecutively").
 */
export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  validation: (Rule) =>
    Rule.custom((doc) => {
      const sections = (doc as {sections?: Array<{theme?: string; enabled?: boolean}>} | undefined)?.sections
      if (!Array.isArray(sections)) return true

      let consecutiveDark = 0
      for (const section of sections) {
        if (section?.enabled === false) continue // hidden sections don't participate in the visible rhythm
        if (section?.theme === 'darkCinematic') {
          consecutiveDark += 1
          if (consecutiveDark > 2) {
            return (
              'More than 2 "Dark cinematic" sections in a row breaks the approved section rhythm — ' +
              'alternate with Bright editorial / Bold full-colour sections (data-model.md "Section ' +
              'validation rules").'
            )
          }
        } else {
          consecutiveDark = 0
        }
      }
      return true
    }).warning(),
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
        // roadmap/caseStudy/testimonial now exist (M7/M8); caseStudyShowcase/testimonialWall stay
        // placeholder-gated (enabled: false by default) until Verified proof content exists.
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
