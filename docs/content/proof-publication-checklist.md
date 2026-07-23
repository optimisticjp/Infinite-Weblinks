# Proof Publication Checklist

Every case study, testimonial, or example is **double-gated**: it renders publicly ONLY when it has
(1) a renderable content status (`verified` / `readyToPublish`) **and** (2) complete, affirmative
`proofVerification` metadata. This checklist is the human process behind gate (2). **Do not publish any
proof item until every applicable box is genuinely ticked** — the gate is enforced in code
(`isPublishableProof`), but the truth of each item is a human responsibility.

> **Never fabricate proof.** No client name, logo, quote, metric, screenshot, or outcome may be
> invented, illustrative-dressed-as-real, or published without the real thing and real consent. The
> repository stores **no** confidential evidence or client PII — only an internal reference to where it
> lives.

## Before a proof item can be published

- [ ] **Client consent** — the client has given explicit, recorded consent to appear publicly, for
      this specific use, and has seen the exact content that will be shown.
- [ ] **Identity / logo approval** — use of their name, brand, and any logo is approved in writing;
      logo usage complies with their brand guidelines.
- [ ] **Exact quote approval** (testimonials) — the quote is verbatim from the client, or an edit they
      have explicitly approved; attribution (name/role/business) is approved.
- [ ] **Metric source** — every figure traces to a real, documented source (analytics export,
      platform report, invoice, etc.) — no estimates presented as measured results.
- [ ] **Baseline and timeframe** — each metric states what it is measured against and over what period;
      no cherry-picked window presented as typical.
- [ ] **Attribution** — the work is genuinely attributable to Infinite Weblinks (not coincidental or
      shared credit presented as sole credit).
- [ ] **Screenshots / assets approval** — any screenshots or assets are approved, contain no third-
      party PII, and are cleared for public display.
- [ ] **Confidentiality review** — nothing under NDA or commercially sensitive is disclosed; sensitive
      figures are aggregated or omitted per the client's wishes.
- [ ] **Final owner approval** — the owner has approved THIS specific item for publication.

## Recording it in the system

Set the item's `proofVerification` (Studio) or `verification` (seed) once the above is true:

| Field                    | Set to `true` / a value when…                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `consentConfirmed`       | recorded client consent exists                                                                                     |
| `identityApproved`       | name/logo use is approved                                                                                          |
| `claimsVerified`         | every claim/quote/figure is verified against evidence                                                              |
| `approvedForPublication` | the owner approved this specific item                                                                              |
| `evidenceReference`      | an INTERNAL pointer (e.g. a ticket id) to where consent + evidence live — **never** the evidence or any PII itself |

Then set the content status to `verified` (or `readyToPublish`). Both gates now pass and the item
renders as **real, unlabelled proof** — distinct from the always-labelled illustrative case scenarios.

## Rollback / unpublish

To pull a published proof item immediately:

- Set `approvedForPublication` to `false` (fastest — the source GROQ filter and `isPublishableProof`
  both drop it at once), **or** set the content status back to `draft`.
- Either change hides the item from the index, its detail route (which then 404s), the sitemap, and
  any embedded display, in both seed and live-CMS modes.
- If it was a live-CMS item, the change takes effect within the ISR revalidation window; force a
  redeploy/revalidation if it must disappear instantly.

## Illustrative scenarios are NOT proof

The worked scenarios on `/case-studies` are `CaseScenario` records — always clearly labelled
"illustrative example, not a real client", never carrying a client name, logo, testimonial, or
invented numeric result. They are a separate type from gated proof and are not governed by this
checklist. Never relabel an illustrative scenario as real proof.
