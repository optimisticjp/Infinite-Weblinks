import {defineField, defineType} from 'sanity'

/**
 * Publication-verification metadata embedded on proof documents (caseStudy / testimonial / example).
 * A proof item is a SECOND, independent gate on top of `contentStatus`: even a Verified item must
 * carry complete, affirmative verification here before it renders publicly. The app mirrors this in
 * `isPublishableProof` (src/lib/content/types.ts), and the public GROQ additionally filters
 * `proofVerification.approvedForPublication == true` so an unapproved item is never even returned.
 *
 * NEVER store the confidential evidence itself or any visitor/client PII here — `evidenceReference`
 * is only an INTERNAL pointer (e.g. a ticket/id) to where the signed consent and evidence live.
 */
export const proofVerification = defineType({
  name: 'proofVerification',
  title: 'Publication verification',
  type: 'object',
  description:
    'All five must be satisfied before this proof can be published. See the proof-publication checklist.',
  fields: [
    defineField({
      name: 'consentConfirmed',
      title: 'Consent confirmed',
      description: 'The client/subject has confirmed consent to be shown publicly.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'identityApproved',
      title: 'Identity / logo approved',
      description: 'Use of their name, identity and any logo is approved.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'claimsVerified',
      title: 'Claims verified',
      description: 'Every claim, quote and figure is verified against real evidence.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'approvedForPublication',
      title: 'Approved for publication',
      description: 'The owner has approved THIS item for publication.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'evidenceReference',
      title: 'Evidence reference (internal)',
      description:
        'An INTERNAL reference to where the signed consent and evidence live (e.g. a ticket id). Never paste the evidence or any PII here.',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      consent: 'consentConfirmed',
      identity: 'identityApproved',
      claims: 'claimsVerified',
      approved: 'approvedForPublication',
      ref: 'evidenceReference',
    },
    prepare({consent, identity, claims, approved, ref}) {
      const complete = consent && identity && claims && approved && Boolean(ref)
      return {
        title: complete ? 'Verified for publication' : 'Not yet publishable',
        subtitle: complete ? String(ref) : 'consent / identity / claims / approval / reference required',
      }
    },
  },
})
