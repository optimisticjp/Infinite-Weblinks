# Content Publishing Runbook

How content is authored, gated, previewed, and published on Infinite Weblinks — and who must approve
what. The site is **seed-content-first**: reviewed local seed content is the production default, and
live Sanity reads are flag-gated and off by default.

## The content-source model (final)

| Source                                               | Role                                                                                                                                                                                           |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Local seed** (`src/lib/content/data/*`, `seed.ts`) | **Production default.** Reviewed, status-gated, code-authoritative. Renders with **no** Sanity query when live content is off.                                                                 |
| **Live Sanity** (flag-gated)                         | Optional. Read only when `NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED=true`. Status-gated at the source (GROQ).                                                                                    |
| **Legal pages**                                      | **Always code-authoritative** (not seeded to Sanity). Render gate = content status; the wording's legal-review state is the separate `legalReviewStatus` (drafts pending professional review). |
| **Proof** (case study / testimonial / example)       | **Double-gated** (`isPublishableProof`): renderable status AND complete verification. Never seeded to Sanity; real proof is added in Studio and must pass the same gate.                       |

Fallback semantics (`src/lib/sanity/fetch.ts` → `fromSanityOrSeed`):

- **Flag off (default):** seed is served; **no Sanity query is issued** (release-safety gate).
- **Flag on + query returns rows:** live rows are mapped and re-filtered by the publish gate.
- **Flag on + query returns `[]`:** the empty result is **authoritative** — seed does NOT reappear
  (so retired content can't re-leak).
- **Flag on + query fails (`null`):** falls back to seed, and logs a **visible** warn with only a
  short reason (never the query, params, or any document body). An outage is never disguised as a
  healthy live result.

## Editing seed content

1. Edit the relevant `src/lib/content/data/*.ts` (or `seed.ts`) file. Keep the `status` accurate.
2. Only `verified` / `readyToPublish` render; `draft` / `placeholder` / `approvalRequired` stay hidden.
3. Run `npm run test` (content integrity + route tests) and `npm run build`. Preview with `npm run dev`
   (stop it after) or `npm run cf:preview`.
4. Commit. Seed content ships with the code.

## Editing Sanity content

1. Edit in Studio (`studio/`). Every publishable document has a `contentStatus` (defaults to Draft →
   hidden). Only set `verified` / `readyToPublish` when the content is genuinely ready.
2. **Do not enable live content as part of editing.** The public site stays on seed until the flag is
   deliberately turned on after a controlled preview (below).
3. Reference data, chrome/hero/editorial, the rules engine, and legal pages are **not** read from
   Sanity — edit those in code.

## Status workflow

`draft` → `approvalRequired` → `verified` → `readyToPublish`. Only the last two render. `placeholder`
is a permanent "reserved slot, never real" state (used by proof placeholders).

## Proof verification workflow

Follow `proof-publication-checklist.md`. A proof item renders ONLY with a renderable status AND
complete `proofVerification` (consent + identity + claims + owner approval + a non-empty internal
evidence reference). The Studio also requires `proofVerification.approvedForPublication` at the source.
To unpublish: set `approvedForPublication` false (or status back to `draft`).

## Preview verification (before enabling live content)

1. In a **preview** environment, set `NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED=true`.
2. Verify the intended documents render, retired/draft content stays hidden, proof stays gated, the
   sitemap reflects only renderable content, and an induced Sanity error degrades to seed (a `[sanity]`
   warn appears; the page still renders).
3. Only after this passes should live content be enabled on production (an owner decision).

## Enabling live content / rollback to seed

- **Enable:** set `NEXT_PUBLIC_SANITY_LIVE_CONTENT_ENABLED=true` on the target environment (owner
  decision; do it after preview verification).
- **Rollback:** set it back to `false` — the site immediately serves seed again, issuing no Sanity
  queries. This is the fastest, safest rollback for a content problem.

## Sitemap / revalidation checks

- `src/app/sitemap.ts` lists only status-gated renderable content (and `/examples/*` only when examples
  exist). After a content change, confirm the sitemap and `robots.txt` still reflect reality.
- Live reads use ISR (`SANITY_REVALIDATE_SECONDS`); editor changes appear on that cadence. Force a
  redeploy/revalidation if a change must appear or disappear immediately (e.g. unpublishing proof).

## Who must approve what

| Change                                                                                  | Approver                             |
| --------------------------------------------------------------------------------------- | ------------------------------------ |
| Legal wording / `legalReviewStatus` → professionallyReviewed                            | Owner + qualified legal professional |
| Publishing any proof (real client work)                                                 | Owner (per the proof checklist)      |
| Pricing figures / ranges, commercial commitments                                        | Owner                                |
| Enabling live Sanity content on production                                              | Owner                                |
| Ordinary editorial seed/Studio content (verified, non-proof, non-legal, non-commercial) | Content editor                       |

## Guardrails

Do **not**: enable live Sanity content casually; change datasets or secrets; publish content to Sanity
as part of this runbook; convert placeholders/illustrative scenarios into real proof; invent pricing,
metrics, testimonials, clients, or legal approval.
