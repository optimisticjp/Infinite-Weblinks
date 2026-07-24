# Public Claims Register

Every meaningful public commitment and factual claim on the site, with its exact wording, source,
category, supporting repository evidence, what owner evidence (if any) is required, the action taken in
Phase 3B, and its final status. This is the trust-audit record for an honest launch.

**Categories**

- **implemented-fact** — provable from the code/config as shipped.
- **business-policy-commitment** — a promise about how the business operates; needs owner confirmation
  (not repo-verifiable). Retained as a value-proposition commitment; the underlying policy is an owner
  launch blocker.
- **illustrative-educational** — clearly-labelled illustrative or educational statement.
- **owner-confirmation-required** — needs owner sign-off before launch.
- **professional-review-required** — legal wording pending professional review.
- **prohibited-unverified** — would be fabricated/unverifiable; must never be published.

**Global actions taken in Phase 3B**

- Absolute adverbs that read as guarantees ("at all times", "always yours", "always know") were
  **softened** to accurate non-absolute wording where safe.
- The ownership/no-lock-in policy is **retained** as the value proposition and recorded as an
  **owner-confirmation** launch blocker (per the release-blocker register).
- No numeric price, testimonial, client name, logo, or metric was invented. Placeholder proof stays
  hidden behind the strengthened publication gate.

---

## 1. Ownership / "in your name" / no lock-in

| Wording (exact)                                                            | Route / source                                                      | Category                   | Evidence                                    | Owner evidence required                 | Action                                                             | Final status                                  |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------- | ------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------ | --------------------------------------------- |
| "Your business should never be locked in." (headline "should")             | /account-ownership, homepage trust, /about (`account-ownership.ts`) | business-policy-commitment | Value-prop stance ("should")                | Confirm the no-lock-in operating policy | Kept (a stance, not a factual guarantee); header comment corrected | Owner-confirm                                 |
| "…stay under your control **at all times**." → "…stay under your control." | `account-ownership.ts` guarantee                                    | business-policy-commitment | —                                           | Confirm data-control policy             | **Softened** (dropped "at all times")                              | Resolved-in-repo (policy still owner-confirm) |
| "The choice is **always** yours." → "The choice is yours."                 | `account-ownership.ts` + /account-ownership Callout                 | business-policy-commitment | —                                           | Confirm exit/handover policy            | **Softened** (dropped "always")                                    | Resolved-in-repo (policy owner-confirm)       |
| "Everything is created in your business name…"                             | `account-ownership.ts`, /about, llms.txt                            | business-policy-commitment | Delivery model notes describe in-name setup | Confirm accounts-in-client-name policy  | Kept                                                               | Owner-confirm                                 |
| "Nothing is locked to us / to Infinite Weblinks."                          | value-props, faqs, pricing FAQ, delivery-models, /about             | business-policy-commitment | Consistent across surfaces                  | Confirm no-lock-in policy               | Kept (value prop); test-locked in pricing                          | Owner-confirm                                 |
| "You do, always." (who owns the accounts)                                  | `faqs.ts` (/faq)                                                    | business-policy-commitment | —                                           | Confirm ownership policy                | Kept (register entry; single-word absolute noted)                  | Owner-confirm                                 |
| "You'll **always** know what we're doing…" → "You'll know…"                | `honest-expectations.ts`                                            | business-policy-commitment | —                                           | —                                       | **Softened** (dropped "always")                                    | Resolved-in-repo                              |

## 2. No-obligation / no-pressure / no mailing list / won't-sell

| Wording                                            | Route / source                                            | Category                   | Action                                        | Final status                        |
| -------------------------------------------------- | --------------------------------------------------------- | -------------------------- | --------------------------------------------- | ----------------------------------- |
| "No pressure and no obligation" / "No obligation." | /contact, /faq, /how-it-works, /case-studies, growth-plan | implemented-fact           | Kept (accurate — no auto-signup, no purchase) | OK                                  |
| "nothing gets added to a mailing list"             | ContactForm success                                       | implemented-fact           | Kept (no mailing-list integration exists)     | OK                                  |
| "We'll never sell your details."                   | ContactForm consent                                       | business-policy-commitment | Kept                                          | Owner-confirm (data-selling policy) |
| "Your details stay private, never sold"            | contact guidance                                          | business-policy-commitment | Kept                                          | Owner-confirm                       |

## 3. Privacy / cookies / analytics

| Wording                                                                                | Route / source     | Category                     | Action                                                                            | Final status                              |
| -------------------------------------------------------------------------------------- | ------------------ | ---------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------- |
| "Cloudflare Web Analytics, a cookieless analytics service" (present tense)             | /privacy, /cookies | professional-review-required | Kept; flagged in legal handoff — analytics is **inactive** until the token is set | Owner-confirm (activation) + legal review |
| "does not use tracking cookies… does not track individual visitors"                    | /privacy, /cookies | implemented-fact             | Kept (cookieless beacon; no cookie code)                                          | OK (legal review)                         |
| "no advertising cookies, cross-site tracking pixels, or third-party marketing cookies" | /cookies           | implemented-fact             | Kept (none implemented)                                                           | OK (legal review)                         |

## 4. Free / time-to-complete

| Wording                                                            | Route / source                             | Category                         | Action                                            | Final status      |
| ------------------------------------------------------------------ | ------------------------------------------ | -------------------------------- | ------------------------------------------------- | ----------------- |
| "free" (growth plan, guidance)                                     | /pricing, /refunds, /growth-plan, llms.txt | implemented-fact                 | Kept (no payment on site)                         | OK                |
| "takes a few minutes" / "Takes a couple of minutes" (inconsistent) | /pricing vs /growth-plan                   | implemented-fact (soft estimate) | **Reconciled** to "a few minutes" for consistency | OK                |
| "It is yours to keep…" (free plan)                                 | /refunds                                   | business-policy-commitment       | Kept (free, no obligation)                        | OK (legal review) |

## 5. Pricing (decision section)

| Wording                                                                                       | Route / source | Category                      | Action | Final status                  |
| --------------------------------------------------------------------------------------------- | -------------- | ----------------------------- | ------ | ----------------------------- |
| "No [fixed price list]. …we quote each piece of work after we understand it"                  | /pricing + FAQ | implemented-fact              | Kept   | OK                            |
| Delivery cost **shapes** ("a project fee", "a recurring fee", "the tools' own subscriptions") | `pricing.ts`   | implemented-fact (no figures) | Kept   | OK                            |
| "quoted to scope" / "written quote… before any work begins"                                   | /pricing       | business-policy-commitment    | Kept   | Owner-confirm (quote process) |

**Pricing decision.** Current approved state: **qualitative, quoted-to-scope** — no numeric price,
rate, range, retainer, minimum, or duration appears anywhere (enforced by the pricing integrity test).
To publish ranges the owner would need to supply approved figures (with the deposit/recurring/minimum
disclosure rules). Ranges are **intentionally withheld** for now; **no numeric pricing was invented**.
Whether deposits, recurring fees, or minimum commitments must be disclosed is an owner/counsel question
(see the legal handoff and release blockers). Page copy and the FAQPage JSON-LD share one source
(`pricing.ts`), so they stay identical.

## 6. Proof / case studies / examples

| Wording                                                                                                          | Route / source                   | Category                           | Action                                                                     | Final status |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- | ------------ |
| "illustrative example, not a real client" (+ "No client names, logos, testimonials or specific numeric results") | /case-studies, /connected-growth | illustrative-educational           | Kept; strengthened proof gate keeps real proof hidden until fully verified | OK           |
| Placeholder case studies / testimonials / examples                                                               | `proof.ts`                       | prohibited-unverified (until real) | Double-gated (status + verification) → hidden                              | OK           |
| Qualitative result markers ("Improving", "Compounding")                                                          | `case-scenarios.ts`              | illustrative-educational           | Kept (no invented figures; labelled illustrative)                          | OK           |

## 7. Partner / partnership / platform logos

| Wording                                                                                                      | Route / source                       | Category                   | Action                                                           | Final status                |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------ | -------------------------- | ---------------------------------------------------------------- | --------------------------- |
| "Digital Growth Partner" (positioning)                                                                       | homepage, /about, /contact, llms.txt | business-policy-commitment | Kept (self-description, not a claim of third-party partnership)  | Owner-confirm (positioning) |
| "An ongoing partnership" (engagement shape)                                                                  | /pricing                             | business-policy-commitment | Kept                                                             | Owner-confirm               |
| "Works with the tools your business already uses." + "Examples only. No partnership or endorsement implied." | homepage hero                        | implemented-fact           | Kept (explicit non-endorsement disclaimer; real local SVG logos) | OK                          |

## 8. Security / compliance / verified / trusted / proven

| Wording                                                                         | Route / source | Category         | Action                                                                                   | Final status |
| ------------------------------------------------------------------------------- | -------------- | ---------------- | ---------------------------------------------------------------------------------------- | ------------ |
| No standalone "secure / compliant / proven / trusted" marketing claim           | —              | —                | Confirmed absent (only a service-category **name** "Security, Maintenance & Compliance") | OK           |
| Organization JSON-LD asserts **no** response time / rating / unverifiable proof | `jsonld.ts`    | implemented-fact | Kept (deliberate absence; no Review/AggregateRating)                                     | OK           |

## 9. Support / response / reply

| Wording                                                                   | Route / source  | Category         | Action                                       | Final status |
| ------------------------------------------------------------------------- | --------------- | ---------------- | -------------------------------------------- | ------------ |
| "A real person… reply by email with a practical next step" (no timeframe) | /contact, forms | implemented-fact | Kept (no SLA/response-time claimed anywhere) | OK           |

## 10. Delivery / handover

| Wording                                                                | Route / source                                   | Category                   | Action                                    | Final status                             |
| ---------------------------------------------------------------------- | ------------------------------------------------ | -------------------------- | ----------------------------------------- | ---------------------------------------- |
| Four delivery models incl. "hand you the keys so your team can run it" | delivery-models, /how-it-works, /about, /pricing | business-policy-commitment | Kept                                      | Owner-confirm (delivery/handover policy) |
| "Every service is tagged clearly so you know which before you commit." | /faq, llms.txt                                   | implemented-fact           | Kept (services carry delivery-model tags) | OK                                       |

---

## Owner confirmations still required (summary)

The **business-policy-commitment** rows above are the site's value proposition and are retained, but
each underlying policy needs owner confirmation before launch: **account ownership / accounts-in-your-
name / customer-data control / no lock-in / exit & handover**, **won't-sell-data**, **written-quote
process**, **positioning as "Digital Growth Partner"**, **delivery/handover model**, and the
**analytics activation** decision. These are consolidated in `phase-3b-release-blockers.md`.

Nothing in this register was fabricated: no invented metric, testimonial, client, logo, or numeric
price. Absolute guarantees were softened or recorded as owner-confirmation items — never asserted as
verified fact.
