import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * The reviewed, rule-based Growth Plan Builder recommendation logic (contracts/growth-plan-rules.md).
 * This is structured content, NOT a free AI recommendation engine — the pure `resolve()` function
 * that reads this document lives in `src/lib/growth-plan/` in the Next.js app, not here. Only a
 * `growthPlanRuleSet` with `status: "approved"` may be read by production.
 */
export const growthPlanRuleSet = defineType({
  name: 'growthPlanRuleSet',
  title: 'Growth Plan Rule Set',
  type: 'document',
  fields: [
    defineField({
      name: 'version',
      title: 'Version',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      description: 'Only an approved rule set is used in production.',
      type: 'string',
      options: {
        list: [
          {title: 'Draft', value: 'draft'},
          {title: 'Reviewed', value: 'reviewed'},
          {title: 'Approved', value: 'approved'},
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedBy',
      title: 'Updated by',
      type: 'string',
    }),
    defineField({
      name: 'rules',
      title: 'Rules',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'rule',
          fields: [
            defineField({
              name: 'ruleId',
              title: 'Rule ID',
              description: 'Stable identifier used for traceability (GrowthPlanResult.matchedRuleId), e.g. "ecom-traffic-no-sales".',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'when',
              title: 'When',
              description: 'Each key omitted = wildcard (matches any value for that input).',
              type: 'object',
              fields: [
                defineField({name: 'businessType', title: 'Business type', type: 'reference', to: [{type: 'businessType'}]}),
                defineField({name: 'currentStage', title: 'Current stage', type: 'reference', to: [{type: 'growthStage'}]}),
                defineField({name: 'mainGoal', title: 'Main goal', type: 'reference', to: [{type: 'goal'}]}),
                defineField({
                  name: 'existingSetup',
                  title: 'Existing setup',
                  type: 'string',
                  options: {
                    list: [
                      {title: 'Nothing yet', value: 'nothing-yet'},
                      {title: 'Have a site', value: 'have-a-site'},
                      {title: 'Have traffic', value: 'have-traffic'},
                      {title: 'Getting sales', value: 'getting-sales'},
                      {title: 'Running ads', value: 'running-ads'},
                      {title: 'Established', value: 'established'},
                    ],
                  },
                }),
              ],
            }),
            defineField({
              name: 'then',
              title: 'Then',
              type: 'growthPlanOutcome',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'priority',
              title: 'Priority',
              description: 'Tie-breaker when two rules match with equal specificity — higher wins.',
              type: 'number',
              initialValue: 0,
              validation: (Rule) => Rule.required().integer(),
            }),
          ],
          preview: {
            select: {title: 'ruleId', priority: 'priority'},
            prepare({title, priority}) {
              return {title: title || 'Untitled rule', subtitle: `priority ${priority ?? 0}`}
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'fallback',
      title: 'Fallback',
      description: 'Safe default recommendation when no rule matches, or the visitor prefers to discuss by email — must route to the email-led contact path, never an empty/guessed result.',
      type: 'growthPlanOutcome',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'disclaimers',
      title: 'Disclaimers',
      description: 'Outcomes are illustrative, not guarantees (Growth Guide "What we don\'t do" voice).',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'contentStatus',
      title: 'Content status',
      type: 'contentStatus',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {version: 'version', status: 'status'},
    prepare({version, status}) {
      return {title: `Growth Plan Rule Set ${version || ''}`.trim(), subtitle: status}
    },
  },
})
