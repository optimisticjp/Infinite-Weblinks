import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Shared shape for `growthPlanRuleSet.rules[].then` and `growthPlanRuleSet.fallback`
 * (contracts/growth-plan-rules.md → "Inputs → Output"). Referenced stage/service/tool documents
 * must be Verified before a rule is marked approved (contract → "Testing" → Content integrity).
 */
export const growthPlanOutcome = defineType({
  name: 'growthPlanOutcome',
  title: 'Recommendation output',
  type: 'object',
  fields: [
    defineField({
      name: 'startHere',
      title: 'Start here',
      description: 'The immediate first step(s) — stage(s) and/or service(s) to begin with.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'growthStage'}, {type: 'service'}]})],
    }),
    defineField({
      name: 'connectNext',
      title: 'Connect next',
      description: 'What to connect once the foundation is in place.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'growthStage'}, {type: 'service'}]})],
    }),
    defineField({
      name: 'addLater',
      title: 'Add later',
      description: 'What can wait.',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'growthStage'}, {type: 'service'}]})],
    }),
    defineField({
      name: 'capabilities',
      title: 'Relevant capabilities',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'exampleTools',
      title: 'Example tools',
      description: 'Example tools "we can connect" — never "partners".',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'tool'}]})],
    }),
    defineField({
      name: 'expectedOutcomes',
      title: 'Expected outcomes',
      description: 'The kind of result the work is built to produce — illustrative, never a promised number.',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'howWeHelp',
      title: 'How we help',
      description: 'Plain-English statement including the relevant delivery model(s) and the ownership line.',
      type: 'text',
      rows: 3,
    }),
  ],
})
