import type {StructureResolver} from 'sanity/structure'

/**
 * Desk structure: the four config singletons (siteSettings/navigation/footer/formSettings) are
 * pinned at the top as single fixed-id documents, followed by grouped document lists matching
 * data-model.md's shape — Content, Taxonomy, Services, Tools, Articles & Resources, Proof (hidden
 * until Verified), and Legal. Keep this list in sync with `schemaTypes/index.ts` — any document
 * type not explicitly placed here should still be reachable (add it to a group below rather than
 * relying on a catch-all, so singletons never appear twice).
 */
const SINGLETONS = [
  {id: 'siteSettings', title: 'Site Settings', type: 'siteSettings'},
  {id: 'navigation', title: 'Navigation', type: 'navigation'},
  {id: 'footer', title: 'Footer', type: 'footer'},
  {id: 'formSettings', title: 'Form Settings', type: 'formSettings'},
] as const

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Infinite Weblinks')
    .items([
      ...SINGLETONS.map(({id, title, type}) =>
        S.listItem()
          .id(id)
          .title(title)
          .child(S.document().schemaType(type).documentId(id)),
      ),

      S.divider(),

      S.listItem()
        .title('Content')
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('page').title('Pages'),
              S.documentTypeListItem('megaMenu').title('Mega Menus'),
            ]),
        ),

      S.divider(),

      S.listItem()
        .title('Taxonomy')
        .child(
          S.list()
            .title('Taxonomy')
            .items([
              S.documentTypeListItem('goal').title('Goals').child(
                S.documentTypeList('goal').title('Goals').defaultOrdering([{field: 'order', direction: 'asc'}]),
              ),
              S.documentTypeListItem('growthStage').title('Growth Stages').child(
                S.documentTypeList('growthStage').title('Growth Stages').defaultOrdering([{field: 'order', direction: 'asc'}]),
              ),
              S.documentTypeListItem('crossCuttingSystem').title('Cross-Cutting Systems'),
              S.documentTypeListItem('deliveryModel').title('Delivery Models'),
              S.documentTypeListItem('businessType').title('Business Types'),
              S.documentTypeListItem('startingPoint').title('Starting Points'),
              S.documentTypeListItem('roadmap').title('Roadmaps'),
            ]),
        ),

      S.listItem()
        .title('Services')
        .child(
          S.list()
            .title('Services')
            .items([
              S.documentTypeListItem('serviceCategory').title('Service Categories').child(
                S.documentTypeList('serviceCategory').title('Service Categories').defaultOrdering([{field: 'order', direction: 'asc'}]),
              ),
              S.documentTypeListItem('service').title('Services'),
            ]),
        ),

      S.listItem()
        .title('Tools')
        .child(
          S.list()
            .title('Tools')
            .items([
              S.documentTypeListItem('toolCategory').title('Tool Categories').child(
                S.documentTypeList('toolCategory').title('Tool Categories').defaultOrdering([{field: 'order', direction: 'asc'}]),
              ),
              S.documentTypeListItem('tool').title('Tools'),
            ]),
        ),

      S.divider(),

      S.listItem()
        .title('Articles & Resources')
        .child(
          S.list()
            .title('Articles & Resources')
            .items([
              S.documentTypeListItem('article').title('Articles'),
              S.documentTypeListItem('resource').title('Resources'),
              S.documentTypeListItem('faq').title('FAQs'),
            ]),
        ),

      S.listItem()
        .title('Proof (hidden until Verified)')
        .child(
          S.list()
            .title('Proof (hidden until Verified)')
            .items([
              S.documentTypeListItem('caseStudy').title('Case Studies'),
              S.documentTypeListItem('testimonial').title('Testimonials'),
              S.documentTypeListItem('example').title('Examples'),
            ]),
        ),

      S.listItem()
        .title('Legal')
        .child(
          S.list()
            .title('Legal')
            .items([S.documentTypeListItem('legalPage').title('Legal Pages')]),
        ),

      S.divider(),

      S.documentTypeListItem('growthPlanRuleSet').title('Growth Plan Rule Set'),
    ])
