# Phase 3B — Release-Blocker Register

Every remaining item before an honest production launch, classified by who/what resolves it. Items are
**not** marked resolved without evidence. Legend:

- **[repo]** resolved in the repository (this session)
- **[owner]** owner confirmation required
- **[legal]** professional legal review required
- **[proof]** real proof + consent/evidence required
- **[cloudflare]** Cloudflare external verification / provisioning required
- **[3C]** Phase 3C technical release task

## Legal

| Item                                                                                             | Class                     | Status / notes                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------- | --------------------------------------------------------------------------------------------------- |
| Professional review of all 5 legal pages (privacy/cookies/terms/refunds/accessibility)           | **[legal]**               | OPEN. Pages are `legalReviewStatus:"draft"` with a visible notice; none is professionally reviewed. |
| Legal entity / data-controller identity, registered address, jurisdiction                        | **[owner]** / **[legal]** | OPEN. Not in the repo; see `legal-review-handoff.md`.                                               |
| Lawful basis, **data retention** periods, access/deletion process, international transfers, DPAs | **[owner]** / **[legal]** | OPEN. Not derivable from code.                                                                      |
| Analytics activation decision (turn Cloudflare Web Analytics on, or amend the copy)              | **[owner]**               | OPEN. Beacon token currently unset; privacy/cookies copy assumes it is active.                      |
| Accessibility conformance (WCAG 2.2 AA target) + complaint process                               | **[owner]**               | OPEN. Confirm the target and the resolution path.                                                   |

## Proof / trust

| Item                                                                                                 | Class       | Status / notes                                                                                                           |
| ---------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| Real case studies / testimonials / examples with consent + verification                              | **[proof]** | OPEN. Placeholder proof is double-gated and hidden; publish only via `proof-publication-checklist.md`.                   |
| Account-ownership policy confirmation (in-your-name, no lock-in, data control, exit/handover)        | **[owner]** | OPEN. Value-prop commitments retained; absolute adverbs softened; policy needs owner sign-off (see the claims register). |
| Won't-sell-data / no-mailing-list / positioning ("Digital Growth Partner") / delivery-handover model | **[owner]** | OPEN. Business-policy commitments requiring owner confirmation.                                                          |

## Pricing / commercial

| Item                                                        | Class                     | Status / notes                                                                                                                                     |
| ----------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pricing model decision (keep qualitative vs publish ranges) | **[owner]**               | OPEN. Current approved state = qualitative, quoted-to-scope; **no numeric pricing invented**. Ranges intentionally withheld pending owner figures. |
| Deposit / recurring / minimum-commitment disclosure         | **[owner]** / **[legal]** | OPEN. Whether these must be disclosed is an owner/counsel question.                                                                                |

## Security / infrastructure

| Item                                                                                 | Class                  | Status / notes                                                                                                        |
| ------------------------------------------------------------------------------------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Turnstile strict action/hostname, fail-closed forms, PII-safe logging, tightened CSP | **[repo]**             | DONE (Phase 3A + 3B §A).                                                                                              |
| Proof publication gate, legal-review status, claims register, content runbook        | **[repo]**             | DONE (Phase 3B).                                                                                                      |
| Production secrets (Turnstile, Formspree ids, APP_ENV=production, site URL)          | **[cloudflare]**       | OPEN. Set on the Worker; forms fail closed until then. See `cloudflare-production-readiness.md`.                      |
| Real Cloudflare resources: R2 bucket, D1 database + real id, rate-limit rule         | **[cloudflare]**       | OPEN. The shipped D1 id is a local placeholder; verify with the read-only `cf:verify`.                                |
| Next.js security patch (`16.2.10 → 16.2.11`) + scheduled wrangler-chain upgrade      | **[3C]** (recommended) | OPEN. Recorded in the Phase 3A security review; a scoped patch + full re-validation, not a blind `audit fix --force`. |

## Release process (Phase 3C)

| Item                                                              | Class                  | Status / notes                                               |
| ----------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------ |
| Final full visual certification (~360/390px → desktop, axe green) | **[3C]**               | OPEN.                                                        |
| Open PR, CI configuration/gating, release certification           | **[3C]**               | OPEN. Explicitly out of Phase 3B.                            |
| Merge to `main`, production deploy (`cf:deploy`)                  | **[3C]** / **[owner]** | OPEN. Requires explicit authorization.                       |
| Enable live Sanity content (optional)                             | **[owner]**            | OPEN. After preview verification per the publishing runbook. |

---

**Summary.** Everything resolvable in the repository for legal-status clarity, proof gating, claims
truthfulness, pricing honesty, content-source model, and search-intent distinctness is **done**. The
remaining blockers are genuinely external: professional legal review, owner confirmations of business
policy + pricing, real proof + consent, Cloudflare provisioning, and the Phase 3C release tasks. No
external item is marked resolved without evidence.
