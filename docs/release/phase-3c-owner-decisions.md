# Phase 3C — Owner Decisions Register

The single record of every decision that only the **owner** (or a qualified professional) can make
before Infinite Weblinks goes live. Each row is graded with one of four honest statuses — **nothing
is marked resolved without real evidence**, and **no decision here has been invented**.

> **Provenance (read this first).** This register was prepared by the release engineer (Claude Code)
> during an automated Phase 3C pass. **No owner confirmation, legal review, or Cloudflare evidence was
> supplied to this session.** Therefore every owner/legal/external item below is recorded as
> **unresolved-blocker** or **intentionally-deferred-and-safely-gated** — never as confirmed. The owner
> must record real confirmations here (with a date and, where relevant, a reference) before the
> corresponding gate can be considered cleared. Per the Phase 3C rules, **merge and deployment do not
> proceed while any HARD item is `unresolved-blocker`.**

## Status legend

| Status                                      | Meaning                                                                                                                            |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **confirmed-by-owner**                      | The owner has explicitly confirmed this (record who + date). **None so far.**                                                      |
| **professionally-reviewed**                 | A qualified professional (e.g. lawyer) has reviewed/approved (record who + date). **None so far.**                                 |
| **intentionally-deferred-and-safely-gated** | A deliberate "not now": the feature stays safely gated/withheld and the site launches truthfully without it. Not a launch blocker. |
| **unresolved-blocker**                      | Needed for an honest launch and **not yet resolved**. Blocks the relevant gate.                                                    |

---

## 1. Legal (HARD)

| Decision                                                                                       | Status                 | Notes                                                                                                                       |
| ---------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Professional review of the 5 legal pages (privacy / cookies / terms / refunds / accessibility) | **unresolved-blocker** | Pages carry `legalReviewStatus:"draft"` + a visible notice; none is professionally reviewed. See `legal-review-handoff.md`. |
| Legal entity / data-controller identity, registered address, jurisdiction / governing law      | **unresolved-blocker** | Not derivable from code; owner + counsel must supply.                                                                       |
| Lawful basis, retention periods, access/deletion process, international transfers, DPAs        | **unresolved-blocker** | Formspree + Cloudflare processors; owner + counsel.                                                                         |
| WCAG 2.2 AA conformance target + complaint/resolution process                                  | **unresolved-blocker** | a11y test posture is AA-green, but the published conformance **claim** and process need owner confirmation.                 |

## 2. Business-policy commitments (HARD — owner sign-off, not repo work)

These are the site's value proposition. The copy is retained; each underlying policy needs the owner
to confirm it is true and operated as described.

| Commitment                                                                                       | Status                 | Notes                                                              |
| ------------------------------------------------------------------------------------------------ | ---------------------- | ------------------------------------------------------------------ |
| Account ownership / accounts-in-your-name / customer-data control / no lock-in / exit & handover | **unresolved-blocker** | Absolute adverbs softened; policy itself is owner-confirm.         |
| "We'll never sell your details" / no mailing list                                                | **unresolved-blocker** | Data-handling policy; owner-confirm.                               |
| Written-quote process ("a written quote before any work begins")                                 | **unresolved-blocker** | Commercial process; owner-confirm.                                 |
| Positioning as a "Digital Growth Partner"                                                        | **unresolved-blocker** | Self-description; owner-confirm it is accurate.                    |
| Delivery / handover model (four models incl. "hand you the keys")                                | **unresolved-blocker** | Operating model; owner-confirm.                                    |
| A real person monitors and answers the support inbox                                             | **unresolved-blocker** | Operational commitment behind "a real person will read and reply". |

## 3. Analytics (HARD to resolve one way or the other before launch)

| Decision                                                                            | Status                 | Notes                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare Web Analytics: **activate** (set the beacon token) **or amend** the copy | **unresolved-blocker** | Token currently unset; privacy/cookies copy is present-tense. Owner must either set `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` or amend the copy so the two are consistent. Small change, but must be truthful at launch. |

## 4. Pricing / commercial (OPTIONAL to expand; qualitative model is launch-safe)

| Decision                                                                  | Status                                      | Notes                                                                                                                                                                |
| ------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep the qualitative, quoted-to-scope model **vs** publish numeric ranges | **intentionally-deferred-and-safely-gated** | No numeric price invented; qualitative is a deliberate honest state. To publish ranges the owner supplies approved figures + disclosure rules. Not a launch blocker. |
| Deposit / recurring / minimum-commitment disclosure                       | **unresolved-blocker**                      | Whether these must be disclosed is an owner/counsel question; if such terms exist they must be disclosed.                                                            |

## 5. Proof / trust (OPTIONAL; hidden by default)

| Decision                                            | Status                                      | Notes                                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Publish any real case study / testimonial / example | **intentionally-deferred-and-safely-gated** | Double-gated + hidden; the site launches truthfully with none published. Publish later via `proof-publication-checklist.md`. Never fabricated. |

## 6. Content source (OPTIONAL; off by default)

| Decision                                 | Status                                      | Notes                                                                                                                  |
| ---------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Enable live Sanity content on production | **intentionally-deferred-and-safely-gated** | `NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED=false`; seed is the production default. Optional, after preview verification. |

## 7. Infrastructure (HARD — external, owner/operator)

| Decision / resource                                                                              | Status                 | Notes                                                                                    |
| ------------------------------------------------------------------------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------- |
| Provision + confirm R2 bucket, D1 database (+ real id), rate-limit rule; set Worker secrets/vars | **unresolved-blocker** | Forms fail closed until set. Read-only verification in §F; provisioning needs the owner. |

## 8. Release authorizations (HARD — explicit owner action)

| Decision                                        | Status                 | Notes                                                                       |
| ----------------------------------------------- | ---------------------- | --------------------------------------------------------------------------- |
| Merge strategy (merge commit / squash / rebase) | **unresolved-blocker** | Owner chooses at the merge gate (§H).                                       |
| **Merge** the green PR to `main`                | **unresolved-blocker** | Explicit owner authorization required (§H). Not given.                      |
| **Deploy** to production (`cf:deploy`)          | **unresolved-blocker** | Explicit owner authorization required (§I), separate from merge. Not given. |

---

## What the repository resolves on its own (no owner decision needed)

- The `next 16.2.10 → 16.2.11` security patch (Phase 3C §C) — engineering task, applied by Claude.
- All the repo-controlled truthfulness/gating work (legal-review status field, proof gate, claims
  register, content-source model) — already done in Phase 3B / 3C §A.

## How to use this register

1. The owner replaces an `unresolved-blocker`/`intentionally-deferred` status **only with real
   evidence** — add the confirmer's name, the date, and any reference.
2. Merge (§H) must not proceed while any **HARD** row is `unresolved-blocker`.
3. Deploy (§I) is a **separate** authorization after merge.
4. Nothing in this file may be changed to "confirmed" on the owner's behalf.
