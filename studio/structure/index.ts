import type {StructureResolver} from 'sanity/structure'

/**
 * Desk structure: the four config singletons (siteSettings/navigation/footer/formSettings) are
 * pinned at the top as single fixed-id documents, followed by document lists grouped to match
 * data-model.md's taxonomy (the graph). Keep this list in sync with `schemaTypes/index.ts` — any
 * document type not explicitly placed here should still be reachable (add it to a group below
 * rather than relying on a catch-all, so singletons never appear twice).
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

      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('megaMenu').title('Mega Menus'),

      S.divider(),

      S.listItem()
        .title('Taxonomy')
        .child(
          S.list()
            .title('Taxonomy')
            .items([
              S.documentTypeListItem('goal').title('Goals'),
              S.documentTypeListItem('growthStage').title('Growth Stages').child(
                S.documentTypeList('growthStage').title('Growth Stages').defaultOrdering([{field: 'order', direction: 'asc'}]),
              ),
              S.documentTypeListItem('crossCuttingSystem').title('Cross-Cutting Systems'),
              S.documentTypeListItem('deliveryModel').title('Delivery Models'),
              S.documentTypeListItem('businessType').title('Business Types'),
              S.documentTypeListItem('startingPoint').title('Starting Points'),
            ]),
        ),

      S.listItem()
        .title('Services')
        .child(
          S.list()
            .title('Services')
            .items([
              S.documentTypeListItem('serviceCategory').title('Service Categories'),
              S.documentTypeListItem('service').title('Services'),
            ]),
        ),

      S.listItem()
        .title('Tools')
        .child(
          S.list()
            .title('Tools')
            .items([
              S.documentTypeListItem('toolCategory').title('Tool Categories'),
              S.documentTypeListItem('tool').title('Tools'),
            ]),
        ),

      S.divider(),

      S.documentTypeListItem('faq').title('FAQs'),
      S.documentTypeListItem('growthPlanRuleSet').title('Growth Plan Rule Set'),
    ])
